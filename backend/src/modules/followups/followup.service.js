import { db } from "../../config/db.js";
import { followups, followupEvents, notifications } from "../../db/schema.js";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { logEvent } from "../events/event.service.js";
import { notificationService } from "../notifications/notification.service.js";
import { streamFollowUpDraft, extractFollowupFromText as aiExtractFollowupFromText } from "../../services/ai.service.js";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

async function emitToUser(userId, event, payload = {}) {
  try {
    const { getIO } = await import("../../socket.js");
    const io = getIO();
    if (io) {
      io.to(userId).emit(event, payload);
    }
  } catch (err) {
    console.error("Socket emit error:", err);
  }
}

async function clearFollowupNotifications(followupId) {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.isRead, false),
      or(
        eq(notifications.groupKey, `followup-${followupId}`),
        sql`${notifications.metadata}->>'followupId' = ${followupId}`
      )
    ));
}

async function emitFollowupChanged(userId, followupId) {
  await emitToUser(userId, "unread:changed");
  // We emit changed for both potential groupKeys just in case
  await emitToUser(userId, "notification:changed", { groupKey: `followup-${followupId}` });
  await emitToUser(userId, "notification:changed", { groupKey: "legacy" });
}

export async function createFollowup(userId, data) {
  const { title, target, notes, dueAt, reminderPolicy, priority } = data;

  const inserted = await db
    .insert(followups)
    .values({
      userId,
      title,
      target,
      notes,
      dueAt: new Date(dueAt),
      reminderPolicy: reminderPolicy || "NORMAL",
      priority: priority || "MEDIUM",
    })
    .returning();

  const followup = inserted[0];

  await notificationService.notify({
    userId,
    type: "FOLLOWUP_CREATED",
    title: `Created: ${followup.title}`,
    body: `New followup scheduled for ${new Date(followup.dueAt).toLocaleString()}`,
    severity: "SUCCESS",
    groupKey: `followup-${followup.id}`,
    metadata: {
      followupId: followup.id,
      priority: followup.priority,
    },
    actionType: "followup_created",
  });

  return followup;
}

export async function listFollowups(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const countResult = await db
    .select()
    .from(followups)
    .where(eq(followups.userId, userId));

  const total = countResult.length;

  const rows = await db
    .select()
    .from(followups)
    .where(eq(followups.userId, userId))
    .orderBy(desc(followups.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    followups: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFollowupById(id) {
  const result = await db.select().from(followups).where(eq(followups.id, id));
  return result[0] || null;
}

export async function markFollowupDone(userId, id) {
  const updated = await db
    .update(followups)
    .set({
      status: "DONE",
      completedAt: new Date(),
      updatedAt: new Date(),
      isActive: false,
      lastReminderSentAt: null,
    })
    .where(eq(followups.id, id))
    .returning();

  if (!updated.length) {
    return null;
  }

  const followup = updated[0];

  await clearFollowupNotifications(id);

  await notificationService.notify({
    userId,
    type: "FOLLOWUP_DONE",
    title: `Completed: ${followup.title}`,
    body: `You marked this followup as done`,
    severity: "SUCCESS",
    groupKey: `followup-${id}`,
    metadata: {
      followupId: id,
      completedAt: followup.completedAt,
    },
    actionType: "followup_done",
  });

  await emitFollowupChanged(userId, id);

  return followup;
}

export async function updateFollowup(userId, id, data) {
  const { title, target, notes, dueAt, priority, reminderPolicy } = data;

  const updated = await db
    .update(followups)
    .set({
      ...(title && { title }),
      ...(target && { target }),
      ...(notes && { notes }),
      ...(dueAt && { dueAt: new Date(dueAt) }),
      ...(priority && { priority }),
      ...(reminderPolicy && { reminderPolicy }),
      updatedAt: new Date(),
    })
    .where(and(eq(followups.id, id), eq(followups.userId, userId)))
    .returning();

  if (!updated.length) {
    return null;
  }

  await logEvent({
    followupId: id,
    userId,
    eventType: "RESCHEDULED",
    message: "Followup updated",
  });

  return updated[0];
}

export async function snoozeFollowup(userId, id, snoozeMinutes) {
  const existing = await db
    .select()
    .from(followups)
    .where(and(eq(followups.id, id), eq(followups.userId, userId)));

  if (existing.length === 0) {
    return { notFound: true };
  }

  if (existing[0].status === "DONE") {
    return { cannotSnoozeDone: true };
  }

  const newDueAt = new Date(new Date(existing[0].dueAt).getTime() + snoozeMinutes * 60000);

  const updated = await db
    .update(followups)
    .set({
      dueAt: newDueAt,
      status: "SNOOZED",
      lastReminderSentAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(followups.id, id), eq(followups.userId, userId)))
    .returning();

  await logEvent({
    followupId: id,
    userId,
    eventType: "SNOOZED",
    message: `Snoozed for ${snoozeMinutes} minutes`,
  });

  await clearFollowupNotifications(id);

  await notificationService.notify({
    userId,
    type: "FOLLOWUP_SNOOZED",
    title: `Snoozed: ${updated[0].title}`,
    body: `Followup snoozed for ${snoozeMinutes} minutes until ${newDueAt.toLocaleString()}`,
    severity: "INFO",
    groupKey: `followup-${id}`,
    metadata: {
      followupId: id,
      snoozeMinutes,
      newDueAt: newDueAt.toISOString(),
    },
    actionType: "followup_snoozed",
  });

  await emitFollowupChanged(userId, id);

  return { followup: updated[0] };
}

export async function getFollowupEvents(userId, followupId) {
  return db
    .select()
    .from(followupEvents)
    .where(and(eq(followupEvents.followupId, followupId), eq(followupEvents.userId, userId)));
}

export async function cancelFollowup(userId, id) {
  const updated = await db
    .update(followups)
    .set({
      status: "CANCELLED",
      isActive: false,
      updatedAt: new Date(),
      lastReminderSentAt: null,
    })
    .where(and(eq(followups.id, id), eq(followups.userId, userId)))
    .returning();

  if (!updated.length) {
    return null;
  }

  await logEvent({
    followupId: id,
    userId,
    eventType: "CANCELLED",
    message: "Followup cancelled",
  });

  await clearFollowupNotifications(id);
  await emitFollowupChanged(userId, id);

  return updated[0];
}

export async function generateDraftForFollowup(userId, id) {
  const existing = await db
    .select()
    .from(followups)
    .where(and(eq(followups.id, id), eq(followups.userId, userId)));

  if (existing.length === 0) {
    return { notFound: true };
  }

  const followup = existing[0];

  const draft = await streamFollowUpDraft({
    target: followup.target,
    title: followup.title,
    notes: followup.notes,
    priority: followup.priority,
    onChunk: (chunk) => emitToUser(userId, "ai:draft:chunk", { followupId: id, chunk }),
  });

  const updated = await db
    .update(followups)
    .set({ aiDraft: draft, isAiGenerated: true, updatedAt: new Date() })
    .where(eq(followups.id, id))
    .returning();

  await emitToUser(userId, "ai:draft:done", { followupId: id, draft });

  return { followup: updated[0] };
}

// Extracts structured follow-up fields from freeform text via AI. Read-only —
// does not touch the database; the caller reviews and calls createFollowup.
export async function extractFollowupFromText(text) {
  const extracted = await aiExtractFollowupFromText(text, { now: new Date() });

  const dueAtDate = extracted.dueAt ? new Date(extracted.dueAt) : null;
  const validDueAt = dueAtDate && !Number.isNaN(dueAtDate.getTime()) ? dueAtDate.toISOString() : null;
  const priority = VALID_PRIORITIES.includes(extracted.priority) ? extracted.priority : "MEDIUM";

  return {
    title: (extracted.title || "").trim() || "Untitled follow-up",
    target: extracted.target || null,
    notes: extracted.notes || null,
    dueAt: validDueAt,
    priority,
  };
}

export async function deleteFollowup(userId, id) {
  const deleted = await db
    .delete(followups)
    .where(and(eq(followups.id, id), eq(followups.userId, userId)))
    .returning();

  return deleted.length > 0;
}

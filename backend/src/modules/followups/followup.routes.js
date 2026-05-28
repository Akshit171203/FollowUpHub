import express from "express";
import { db } from "../../config/db.js";
import { followups } from "../../db/schema.js";
import { eq, desc, and, or, sql } from "drizzle-orm";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.js";
import {
  createFollowupSchema,
  updateFollowupSchema,
  snoozeFollowupSchema,
  followupIdParam,
  listFollowupsQuery,
} from "../../middlewares/schemas.js";
import {
  followupEvents,
  followups as followupsTable,
  notifications,
} from "../../db/schema.js";
import { logEvent } from "../events/event.service.js";
import { notificationService } from "../../services/notification.service.js";
const router = express.Router();

/**
 * POST /api/followups
 * Create followup
 */
router.post("/", authenticateUser, validate(createFollowupSchema), async (req, res) => {
  try {
    const { title, target, notes, dueAt, reminderPolicy, priority } = req.body;

    if (!title || !dueAt) {
      return res.status(400).json({ message: "title and dueAt are required" });
    }

    const inserted = await db
      .insert(followups)
      .values({
        userId: req.user.id,
        title,
        target,
        notes,
        dueAt: new Date(dueAt),
        reminderPolicy: reminderPolicy || "NORMAL",
        priority: priority || "MEDIUM",
      })
      .returning();

    const followup = inserted[0];

    // Send notification that followup was created
    await notificationService.notify({
      userId: req.user.id,
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

    return res.status(201).json({
      message: "Followup created",
      followup,
    });
  } catch (error) {
    console.error("Create followup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/followups
 * List followups for logged-in user with pagination
 */
router.get("/", authenticateUser, validate(listFollowupsQuery), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db
      .select()
      .from(followups)
      .where(eq(followups.userId, req.user.id));
    
    const total = countResult.length;

    // Get paginated results
    const rows = await db
      .select()
      .from(followups)
      .where(eq(followups.userId, req.user.id))
      .orderBy(desc(followups.createdAt))
      .limit(limit)
      .offset(offset);

    return res.json({ 
      followups: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("List followups error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

//Get Followup by ID
router.get("/:id", authenticateUser, validate(followupIdParam), async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const result = await db.select().from(followups).where(eq(followups.id, id));

  if (result.length === 0) {
    return res.status(404).json({ message: "Followup not found" });
  }

  const followup = result[0];

  if (followup.userId !== userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json({ followup });
});

/**
 * PATCH /api/followups/:id/done
 * Mark followup done
 */
router.patch("/:id/done", authenticateUser, validate(followupIdParam), async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(404).json({ message: "Followup not found" });
    }

    // ✅ Clean up notifications
    // Mark notifications read if they either match the groupKey OR contain the followupId in metadata
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
          eq(notifications.isRead, false),
          or(
              eq(notifications.groupKey, `followup-${id}`),
              sql`${notifications.metadata}->>'followupId' = ${id}`
          )
      ));

    // Send notification that followup was completed
    await notificationService.notify({
      userId: req.user.id,
      type: "FOLLOWUP_DONE",
      title: `Completed: ${updated[0].title}`,
      body: `You marked this followup as done`,
      severity: "SUCCESS",
      groupKey: `followup-${id}`,
      metadata: {
        followupId: id,
        completedAt: updated[0].completedAt,
      },
      actionType: "followup_done",
    });
      
    // Emit socket event to clear badge
    try {
        const { getIO } = await import("../../socket.js");
        const io = getIO();
        if (io) {
            io.to(req.user.id).emit("unread:changed");
            // We emit changed for both potential groupKeys just in case
            io.to(req.user.id).emit("notification:changed", { groupKey: `followup-${id}` });
            io.to(req.user.id).emit("notification:changed", { groupKey: 'legacy' }); 
        }
    } catch (e) {
        console.error("Socket emit error:", e);
    }

    return res.json({
      message: "Followup marked as DONE",
      followup: updated[0],
    });
  } catch (error) {
    console.error("Done followup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE followup (edit)
router.patch("/:id", authenticateUser, validate(updateFollowupSchema), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { title, target, notes, dueAt, priority, reminderPolicy } = req.body;

    const updated = await db
      .update(followups)
      .set({
        ...(title && { title }),
        ...(target && { target }),
        ...(notes && { notes }),

        // ✅ FIX: Convert dueAt to Date before saving
        ...(dueAt && { dueAt: new Date(dueAt) }),

        ...(priority && { priority }),
        ...(reminderPolicy && { reminderPolicy }),
        updatedAt: new Date(),
      })
      .where(and(eq(followups.id, id), eq(followups.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ message: "Followup not found" });
    }

    await logEvent({
      followupId: id,
      userId,
      eventType: "RESCHEDULED",
      message: "Followup updated",
    });

    return res.json({ message: "Followup updated", followup: updated[0] });
  } catch (err) {
    console.error("PATCH /followups/:id error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// SNOOZE
router.patch("/:id/snooze", authenticateUser, validate(snoozeFollowupSchema), async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { snoozeMinutes } = req.body;

  if (!snoozeMinutes || snoozeMinutes < 5) {
    return res.status(400).json({ message: "snoozeMinutes must be >= 5" });
  }

  const existing = await db
    .select()
    .from(followups)
    .where(and(eq(followups.id, id), eq(followups.userId, userId)));

  if (existing.length === 0) {
    return res.status(404).json({ message: "Followup not found" });
  }

  // ✅ Prevent snoozing of completed follow-ups
  if (existing[0].status === "DONE") {
    return res.status(400).json({ message: "Cannot snooze a completed follow-up" });
  }

  const newDueAt = new Date(
    new Date(existing[0].dueAt).getTime() + snoozeMinutes * 60000
  );

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

  // ✅ Clean up notifications on Snooze
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
        eq(notifications.isRead, false),
        or(
            eq(notifications.groupKey, `followup-${id}`),
            sql`${notifications.metadata}->>'followupId' = ${id}`
        )
    ));

  // Send notification that followup was snoozed
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
    
  // Emit socket event
  try {
      const { getIO } = await import("../../socket.js");
      const io = getIO();
      if (io) {
          io.to(userId).emit("unread:changed");
          io.to(userId).emit("notification:changed", { groupKey: `followup-${id}` });
          io.to(userId).emit("notification:changed", { groupKey: 'legacy' });
      }
  } catch (e) {
      console.error("Socket emit error:", e);
  }

  return res.json({ message: "Followup snoozed", followup: updated[0] });
});

// GET EVENTS TIMELINE
router.get("/:id/events", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const events = await db
    .select()
    .from(followupEvents)
    .where(
      and(eq(followupEvents.followupId, id), eq(followupEvents.userId, userId))
    );

  return res.json({ events });
});

/**
 * PATCH /api/followups/:id/cancel
 * Cancel a followup
 */
router.patch("/:id/cancel", authenticateUser, validate(followupIdParam), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

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
      return res.status(404).json({ message: "Followup not found" });
    }

    await logEvent({
      followupId: id,
      userId,
      eventType: "CANCELLED",
      message: "Followup cancelled",
    });

    // ✅ Clean up notifications on Cancel
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(
          eq(notifications.isRead, false),
          or(
              eq(notifications.groupKey, `followup-${id}`),
              sql`${notifications.metadata}->>'followupId' = ${id}`
          )
      ));

    try {
        const { getIO } = await import("../../socket.js");
        const io = getIO();
        if (io) {
            io.to(userId).emit("unread:changed");
            io.to(userId).emit("notification:changed", { groupKey: `followup-${id}` });
            io.to(userId).emit("notification:changed", { groupKey: 'legacy' });
        }
    } catch (e) {
        console.error("Socket emit error:", e);
    }

    return res.json({ message: "Followup cancelled", followup: updated[0] });
  } catch (error) {
    console.error("Cancel followup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/followups/:id
 * Delete a followup permanently
 */
router.delete("/:id", authenticateUser, validate(followupIdParam), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await db
      .delete(followups)
      .where(and(eq(followups.id, id), eq(followups.userId, userId)))
      .returning();

    if (!deleted.length) {
      return res.status(404).json({ message: "Followup not found" });
    }

    // Optional: Log event for deletion? (might be tricky if cascade delete isn't set up, but usually logs are separate)
    // If foreign keys cascade, events will be deleted. If not, we might leave orphans or need manual cleanup.
    // Assuming standard behavior for now.

    return res.json({ message: "Followup deleted" });
  } catch (error) {
    console.error("Delete followup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

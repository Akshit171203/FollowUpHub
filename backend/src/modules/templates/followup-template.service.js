import { db } from "../../config/db.js";
import { followupTemplates, followups } from "../../db/schema.js";
import { and, eq, desc } from "drizzle-orm";
import { logEvent } from "../events/event.service.js";

export async function createTemplate(userId, data) {
  const {
    name,
    title,
    target,
    notes,
    defaultDueOffsetMinutes,
    defaultPriority,
    defaultReminderPolicy,
  } = data;

  const inserted = await db
    .insert(followupTemplates)
    .values({
      userId,
      name,
      title,
      target,
      notes,
      defaultDueOffsetMinutes: defaultDueOffsetMinutes ?? 1440,
      defaultPriority: defaultPriority ?? "MEDIUM",
      defaultReminderPolicy: defaultReminderPolicy ?? "NORMAL",
    })
    .returning();

  return inserted[0];
}

export async function listTemplates(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const countResult = await db
    .select()
    .from(followupTemplates)
    .where(eq(followupTemplates.userId, userId));

  const total = countResult.length;

  const rows = await db
    .select()
    .from(followupTemplates)
    .where(eq(followupTemplates.userId, userId))
    .orderBy(desc(followupTemplates.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    templates: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getTemplateById(userId, id) {
  const rows = await db
    .select()
    .from(followupTemplates)
    .where(and(eq(followupTemplates.id, id), eq(followupTemplates.userId, userId)));

  return rows[0] || null;
}

export async function updateTemplate(userId, id, data) {
  const {
    name,
    title,
    target,
    notes,
    defaultDueOffsetMinutes,
    defaultPriority,
    defaultReminderPolicy,
  } = data;

  const updated = await db
    .update(followupTemplates)
    .set({
      ...(name && { name }),
      ...(title && { title }),
      ...(target !== undefined && { target }),
      ...(notes !== undefined && { notes }),
      ...(defaultDueOffsetMinutes !== undefined && { defaultDueOffsetMinutes }),
      ...(defaultPriority && { defaultPriority }),
      ...(defaultReminderPolicy && { defaultReminderPolicy }),
      updatedAt: new Date(),
    })
    .where(and(eq(followupTemplates.id, id), eq(followupTemplates.userId, userId)))
    .returning();

  return updated[0] || null;
}

export async function deleteTemplate(userId, id) {
  const deleted = await db
    .delete(followupTemplates)
    .where(and(eq(followupTemplates.id, id), eq(followupTemplates.userId, userId)))
    .returning();

  return deleted.length > 0;
}

export async function applyTemplate(userId, id) {
  const tpl = await getTemplateById(userId, id);

  if (!tpl) {
    return { success: false, error: "Template not found" };
  }

  const dueAt = new Date(Date.now() + tpl.defaultDueOffsetMinutes * 60 * 1000);

  const inserted = await db
    .insert(followups)
    .values({
      userId,
      title: tpl.title,
      target: tpl.target,
      notes: tpl.notes,
      dueAt,
      priority: tpl.defaultPriority,
      reminderPolicy: tpl.defaultReminderPolicy,
    })
    .returning();

  const followup = inserted[0];

  await logEvent({
    followupId: followup.id,
    userId,
    eventType: "CREATED",
    message: `Created from template: ${tpl.name}`,
  });

  return { success: true, followup };
}

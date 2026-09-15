import { db } from "../../config/db.js";
import { emailTemplates } from "../../db/schema.js";
import { and, eq, desc } from "drizzle-orm";

export async function listEmailTemplates(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const countResult = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.userId, userId));

  const total = countResult.length;

  const rows = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.userId, userId))
    .orderBy(desc(emailTemplates.updatedAt))
    .limit(limit)
    .offset(offset);

  return {
    emailTemplates: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getEmailTemplateById(userId, id) {
  const rows = await db
    .select()
    .from(emailTemplates)
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)));

  return rows[0] || null;
}

export async function createEmailTemplate(userId, data) {
  const { name, type, subject, bodyHtml } = data;

  const inserted = await db
    .insert(emailTemplates)
    .values({
      userId,
      name,
      type: type || "REMINDER",
      subject,
      bodyHtml,
    })
    .returning();

  return inserted[0];
}

export async function updateEmailTemplate(userId, id, data) {
  const { name, type, subject, bodyHtml } = data;

  const updated = await db
    .update(emailTemplates)
    .set({
      ...(name && { name }),
      ...(type && { type }),
      ...(subject && { subject }),
      ...(bodyHtml && { bodyHtml }),
      updatedAt: new Date(),
    })
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)))
    .returning();

  return updated[0] || null;
}

export async function deleteEmailTemplate(userId, id) {
  const deleted = await db
    .delete(emailTemplates)
    .where(and(eq(emailTemplates.id, id), eq(emailTemplates.userId, userId)))
    .returning();

  return deleted.length > 0;
}

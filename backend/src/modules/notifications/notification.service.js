import { db } from "../../config/db.js";
import { notifications, followups } from "../../db/schema.js";
import { and, desc, eq } from "drizzle-orm";

// Keep this if you use it anywhere from module routes (optional)
export async function createNotification({
  userId,
  followupId = null,
  type,
  title,
  body = null,
}) {
  const inserted = await db
    .insert(notifications)
    .values({
      userId,
      followupId,
      type,
      title,
      body,
      isRead: false,
    })
    .returning();

  return inserted[0];
}

// ✅ UPDATED: now returns followup details too
export async function getNotifications(userId, filters = {}) {
  const conditions = [eq(notifications.userId, userId)];

  if (filters.isRead !== undefined) {
    conditions.push(eq(notifications.isRead, filters.isRead));
  }

  if (filters.type) {
    conditions.push(eq(notifications.type, filters.type));
  }

  const rows = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      followupId: notifications.followupId,
      type: notifications.type,
      title: notifications.title,
      body: notifications.body,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
      readAt: notifications.readAt,

      // followup info (nullable because LEFT JOIN)
      followup: {
        id: followups.id,
        title: followups.title,
        priority: followups.priority,
        status: followups.status,
        escalationLevel: followups.escalationLevel,
        dueAt: followups.dueAt,
        lastReminderSentAt: followups.lastReminderSentAt,
      },
    })
    .from(notifications)
    .leftJoin(followups, eq(notifications.followupId, followups.id))
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt));

  return rows;
}

export async function getUnreadCount(userId) {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return rows.length;
}

export async function markNotificationRead(userId, notificationId) {
  const updated = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  return updated[0];
}

export async function markAllRead(userId) {
  const updated = await db
    .update(notifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(notifications.userId, userId))
    .returning();

  return updated.length;
}

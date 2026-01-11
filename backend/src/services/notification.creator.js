import { db } from "../config/db.js";
import { notifications } from "../db/schema.js";

export async function createNotification({ userId, followupId, title, body, type }) {
  const inserted = await db
    .insert(notifications)
    .values({
      userId,
      followupId,
      title,
      body,
      type,
      isRead: false,
    })
    .returning();

  return inserted[0];
}

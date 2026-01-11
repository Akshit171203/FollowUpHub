import { db } from "../config/db.js";
import { followupEvents } from "../db/schema.js";

export async function logEvent({ followupId, userId, eventType, message }) {
  const inserted = await db
    .insert(followupEvents)
    .values({
      followupId,
      userId,
      eventType,
      message,
    })
    .returning();

  return inserted[0];
}

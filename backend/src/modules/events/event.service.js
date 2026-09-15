import { db } from "../../config/db.js";
import { followupEvents, followups } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

export async function logEvent({ followupId, userId, eventType, message }) {
  await db.insert(followupEvents).values({
    followupId,
    userId,
    eventType,
    message,
  });
}

export async function getEventTimeline(userId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const countResult = await db
    .select({ id: followupEvents.id })
    .from(followupEvents)
    .where(eq(followupEvents.userId, userId));

  const total = countResult.length;

  const rows = await db
    .select({
      id: followupEvents.id,
      eventType: followupEvents.eventType,
      message: followupEvents.message,
      createdAt: followupEvents.createdAt,
      followupId: followupEvents.followupId,
      followupTitle: followups.title,
    })
    .from(followupEvents)
    .leftJoin(followups, eq(followupEvents.followupId, followups.id))
    .where(eq(followupEvents.userId, userId))
    .orderBy(desc(followupEvents.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    events: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

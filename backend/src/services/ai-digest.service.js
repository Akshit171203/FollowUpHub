import { db } from "../config/db.js";
import { followups } from "../db/schema.js";
import { and, eq, ne, asc } from "drizzle-orm";

import { notificationService } from "../modules/notifications/notification.service.js";
import { generateDigestSummary, AiServiceError } from "./ai.service.js";

const MAX_ITEMS_PER_DIGEST = 10;

export async function runAiDigestJob() {
  const active = await db
    .select({ userId: followups.userId })
    .from(followups)
    .where(and(eq(followups.isActive, true), ne(followups.status, "DONE")));

  const userIds = [...new Set(active.map((f) => f.userId))];

  if (userIds.length === 0) {
    console.log("AI Digest: No users with active followups");
    return;
  }

  console.log(`AI Digest: Generating digests for ${userIds.length} user(s)`);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  for (const userId of userIds) {
    try {
      const items = await db
        .select()
        .from(followups)
        .where(and(eq(followups.userId, userId), eq(followups.isActive, true), ne(followups.status, "DONE")))
        .orderBy(asc(followups.dueAt))
        .limit(MAX_ITEMS_PER_DIGEST);

      if (items.length === 0) continue;

      const summary = await generateDigestSummary(
        items.map((f) => ({
          title: f.title,
          target: f.target,
          dueAt: f.dueAt,
          status: f.status,
          priority: f.priority,
        })),
        { now }
      );

      await notificationService.notify({
        userId,
        type: "AI_DIGEST",
        title: "Your daily follow-up digest",
        body: summary,
        severity: "INFO",
        groupKey: `ai-digest-${dateStr}`,
        metadata: { count: items.length },
        actionType: "ai_digest",
      });

      console.log(`✅ AI Digest sent for user: ${userId}`);
    } catch (err) {
      if (err instanceof AiServiceError) {
        console.error(`❌ AI Digest error for user ${userId}: [${err.code}] ${err.message}`);
      } else {
        console.error("❌ AI Digest error for user:", userId, err);
      }
    }
  }
}

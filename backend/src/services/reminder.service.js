import { db } from "../config/db.js";
import { followups } from "../db/schema.js";
import { and, eq, lt, ne } from "drizzle-orm";

import { notificationService } from "./notification.service.js";
import { logEvent } from "./event.service.js";

// Cooldown mapping
function getCooldownMs(policy) {
  switch (policy) {
    case "AGGRESSIVE":
      return 5 * 60 * 1000; // 5 min
    case "PERSISTENT":
      return 15 * 60 * 1000; // 15 min
    case "NORMAL":
    default:
      return 60 * 60 * 1000; // 60 min
  }
}
// Only escalate based on ignoreCount thresholds
function computeEscalationFromIgnoreCount(ignoreCount, current) {
  let newPriority = current.priority;
  let newPolicy = current.reminderPolicy;
  let newEscalationLevel = current.escalationLevel;
  let newStatus = current.status;

  // thresholds: 1, 3, 5
  if (ignoreCount >= 5) {
    newEscalationLevel = Math.max(newEscalationLevel, 3);
    newPriority = "URGENT";
    newPolicy = "AGGRESSIVE";
    newStatus = "ESCALATED";
  } else if (ignoreCount >= 3) {
    newEscalationLevel = Math.max(newEscalationLevel, 2);
    newPriority = ["URGENT"].includes(newPriority) ? newPriority : "HIGH";
    newPolicy = ["AGGRESSIVE"].includes(newPolicy) ? newPolicy : "PERSISTENT";
    newStatus = "ESCALATED";
  } else if (ignoreCount >= 1) {
    newEscalationLevel = Math.max(newEscalationLevel, 1);
    if (newPriority === "LOW") newPriority = "MEDIUM";
  }

  return {
    priority: newPriority,
    reminderPolicy: newPolicy,
    escalationLevel: newEscalationLevel,
    status: newStatus,
  };
}
// MAIN REMINDER ENGINE
export async function runReminderEngine() {
  const now = new Date();
  //Fetch all overdue followups
  const overdue = await db
    .select()
    .from(followups)
    .where(
      and(
        lt(followups.dueAt, now),
        ne(followups.status, "DONE"),
        eq(followups.isActive, true)
      )
    );

  if (overdue.length === 0) {
    console.log("Reminder Engine: No overdue followups");
    return;
  }
  // Apply cooldown logic in JS per followup policy
  const dueFollowups = overdue.filter((f) => {
    if (!f.lastReminderSentAt) return true; // never reminded -> send now
    const cooldownMs = getCooldownMs(f.reminderPolicy);
    const last = new Date(f.lastReminderSentAt).getTime();
    return now.getTime() - last >= cooldownMs;
  });

  if (dueFollowups.length === 0) {
    console.log("Reminder Engine: Overdue followups exist, but all are in cooldown");
    return;
  }

  console.log(`Reminder Engine: Sending reminders for ${dueFollowups.length} followups`);

  for (const followup of dueFollowups) {
    try {
      const isRepeatReminder = !!followup.lastReminderSentAt;

      // Ignore count increments only on repeat reminders
      const newIgnoreCount = isRepeatReminder ? followup.ignoreCount + 1 : followup.ignoreCount;

      // Escalation is derived from ignoreCount thresholds
      const escalationFields = computeEscalationFromIgnoreCount(newIgnoreCount, followup);

      // 1) Create notification using NEW Service (supports Real-time)
      await notificationService.notify({
        userId: followup.userId,
        type: "FOLLOWUP_DUE",
        title: `Reminder: ${followup.title}`,
        body: `Followup is due. Priority: ${escalationFields.priority}`,
        severity: escalationFields.priority === "URGENT" || escalationFields.priority === "HIGH" ? "WARNING" : "INFO",
        groupKey: `followup-${followup.id}`,
        metadata: {
            followupId: followup.id,
            priority: escalationFields.priority,
            escalationLevel: escalationFields.escalationLevel
        },
        actionType: "followup_due"
      });

      // 2) Log REMINDER_SENT event
      await logEvent({
        followupId: followup.id,
        userId: followup.userId,
        eventType: "REMINDER_SENT",
        message: `Reminder sent. repeat=${isRepeatReminder} ignoreCount=${newIgnoreCount} policy=${followup.reminderPolicy}`,
      });

      // Optional: log ESCALATED event only if escalationLevel changed
      if (escalationFields.escalationLevel !== followup.escalationLevel) {
        await logEvent({
          followupId: followup.id,
          userId: followup.userId,
          eventType: "ESCALATED",
          message: `Escalated to level ${escalationFields.escalationLevel} (ignoreCount=${newIgnoreCount})`,
        });

        // Optional: create escalation notification
        await notificationService.notify({
          userId: followup.userId,
          type: "FOLLOWUP_ESCALATED",
          title: `Escalated: ${followup.title}`,
          body: `Now priority ${escalationFields.priority} (level ${escalationFields.escalationLevel})`,
          severity: "WARNING",
          groupKey: `followup-${followup.id}`, 
          metadata: {
              followupId: followup.id,
              priority: escalationFields.priority,
              escalationLevel: escalationFields.escalationLevel
          }
        });
      }

      // 3) Update followup
      await db
        .update(followups)
        .set({
          ignoreCount: newIgnoreCount,
          ...escalationFields,
          lastReminderSentAt: now,
          updatedAt: now,
        })
        .where(eq(followups.id, followup.id));

      console.log(`✅ Reminder sent for followup: ${followup.id}`);
    } catch (err) {
      console.error("❌ Reminder Engine error for followup:", followup.id, err);
    }
  }
}

import { db } from "../config/db.js";
import { followups } from "../db/schema.js";
import { and, eq, lt, ne } from "drizzle-orm";

import { notificationService } from "./notification.service.js";
import { logEvent } from "./event.service.js";
import { sendSlackNotification } from "./slack.service.js";

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

function calculateDelay(dueAt) {
  const now = new Date();
  const diff = now - new Date(dueAt);

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day(s)`;
  return `${hours} hour(s)`;
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

/**
 * Send Escalation Email to Manager for Jira tickets
 */
async function sendJiraManagerEscalation(followup, user, escalationLevel) {
  console.log(`📧 [Escalation Email] Attempting for followup=${followup.id}, title="${followup.title}", level=${escalationLevel}`);
  console.log(`📧 [Escalation Email] user.managerEmail = "${user.managerEmail}", user.email = "${user.email}", user.name = "${user.name}"`);
  
  if (!user.managerEmail) {
    console.log(`📧 [Escalation Email] SKIPPED: managerEmail is empty/null for user ${user.id}`);
    return false;
  }

  const now = new Date();
  // 24-hour cooldown for manager spam (so we don't bombard them every minute)
  if (
    followup.lastManagerNotifiedAt &&
    now.getTime() - new Date(followup.lastManagerNotifiedAt).getTime() < 24 * 60 * 60 * 1000
  ) {
    const remaining = 24 * 60 * 60 * 1000 - (now.getTime() - new Date(followup.lastManagerNotifiedAt).getTime());
    console.log(`📧 [Escalation Email] SKIPPED: 24h cooldown active, ${Math.round(remaining / 60000)} min remaining. lastManagerNotifiedAt=${followup.lastManagerNotifiedAt}`);
    return false; // Cooldown active
  }

  // Calculate delay
  const delayMs = now.getTime() - new Date(followup.dueAt).getTime();
  const delayDays = Math.floor(delayMs / (1000 * 60 * 60 * 24));
  const delayHours = Math.floor(delayMs / (1000 * 60 * 60)) % 24;
  const delayStr = delayDays > 0 ? `${delayDays} days, ${delayHours} hours` : `${delayHours} hours`;

  // Determine Tiers
  // Level 1 -> Dev (already handled by normal reminders)
  // Level 2 -> Team Lead (we send to managerEmail for now, can extend later)
  // Level 3 -> Manager
  const tierName = escalationLevel >= 3 ? "Manager (Level 3)" : "Team Lead (Level 2)";

  try {
    const { sendEmail } = await import("../config/mailer.js");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #d9534f;">⚠️ Jira Ticket Escalation: ${tierName}</h2>
        <p>A Jira ticket assigned to <strong>${user.name}</strong> is critically overdue and requires attention.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Ticket:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${followup.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Assignee:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.name} (${user.email})</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Overdue By:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #d9534f;">${delayStr}</td>
          </tr>
        </table>
        <div style="margin-top: 25px;">
          <a href="${followup.externalUrl}" style="background-color: #0052CC; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">View Ticket in Jira</a>
        </div>
      </div>
    `;

    console.log(`📧 [Escalation Email] Sending to ${user.managerEmail}...`);
    await sendEmail({
      to: user.managerEmail,
      subject: `Escalation: Jira Ticket Overdue for ${user.name}`,
      html,
    });

    console.log(`📧 [Escalation Email] ✅ SUCCESS - Email sent to ${user.managerEmail} for ticket "${followup.title}"`);
    return true; // Sent successfully
  } catch (err) {
    console.error(`📧 [Escalation Email] ❌ FAILED to send to ${user.managerEmail}:`, err.message || err);
    return false;
  }
}
// MAIN REMINDER ENGINE
export async function runReminderEngine() {
  const now = new Date();
  //Fetch all overdue followups
  const overdue = await db
    .select({
       followup: followups,
       user: followups.userId // We'll manually join or fetch users to get managerEmail below
    })
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
  
  // Actually, we must fetch the user details to have user mapping
  const { usersTable } = await import("../db/schema.js");
  const overdueWithUsers = await db
    .select({
      followup: followups,
      user: usersTable
    })
    .from(followups)
    .innerJoin(usersTable, eq(followups.userId, usersTable.id))
    .where(
      and(
        lt(followups.dueAt, now),
        ne(followups.status, "DONE"),
        eq(followups.isActive, true)
      )
    );

  if (overdueWithUsers.length === 0) {
    console.log("Reminder Engine: No overdue followups with valid users");
    return;
  }
  // Apply cooldown logic in JS per followup policy
  const dueFollowupsInfo = overdueWithUsers.filter(({ followup: f }) => {
    if (!f.lastReminderSentAt) return true; // never reminded -> send now
    const cooldownMs = getCooldownMs(f.reminderPolicy);
    const last = new Date(f.lastReminderSentAt).getTime();
    return now.getTime() - last >= cooldownMs;
  });

  if (dueFollowupsInfo.length === 0) {
    console.log("Reminder Engine: Overdue followups exist, but all are in cooldown");
    return;
  }

  console.log(`Reminder Engine: Sending reminders for ${dueFollowupsInfo.length} followups`);

  for (const info of dueFollowupsInfo) {
    const followup = info.followup;
    const user = info.user;
    
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

      // 3) Jira specific escalation (manager notification)
      let updatedManagerNotifiedAt = followup.lastManagerNotifiedAt;
      console.log(`🔍 [Escalation Check] followup=${followup.id} externalSource="${followup.externalSource}" escalationLevel=${escalationFields.escalationLevel} (need >= 2)`);
      if (followup.externalSource === "JIRA" && escalationFields.escalationLevel >= 2) {
        await sendSlackNotification({
          title: followup.title,
          assignee: user.email,
          delay: calculateDelay(followup.dueAt),
          link: followup.externalUrl
        });

        console.log(`🔍 [Escalation Check] ✅ Conditions met, calling sendJiraManagerEscalation...`);
        const sent = await sendJiraManagerEscalation(followup, user, escalationFields.escalationLevel);
        if (sent) {
           updatedManagerNotifiedAt = now;
           await logEvent({
            followupId: followup.id,
            userId: followup.userId,
            eventType: "ESCALATED",
            message: `Jira Escalation dispatched to manager: ${user.managerEmail}`,
          });
        } else {
          console.log(`🔍 [Escalation Check] Manager email was NOT sent (cooldown, missing email, or SMTP failure)`);
        }
      } else {
        console.log(`🔍 [Escalation Check] ❌ Conditions NOT met: externalSource=${followup.externalSource}, escalationLevel=${escalationFields.escalationLevel}`);
      }

      // 4) Update followup
      await db
        .update(followups)
        .set({
          ignoreCount: newIgnoreCount,
          ...escalationFields,
          lastReminderSentAt: now,
          lastManagerNotifiedAt: updatedManagerNotifiedAt,
          updatedAt: now,
        })
        .where(eq(followups.id, followup.id));

      console.log(`✅ Reminder sent for followup: ${followup.id}`);
    } catch (err) {
      console.error("❌ Reminder Engine error for followup:", followup.id, err);
    }
  }
}


/**
 * TODO REMINDER ENGINE  
 * Simpler than followups - no escalation, just simple reminders with cooldown
 */
export async function runTodoReminderEngine() {
  const { getTodosDueForReminder, updateLastRemindedAt } = await import("../modules/todos/todo.service.js");
  
  const dueTodos = await getTodosDueForReminder();
  
  if (dueTodos.length === 0) {
    console.log("Todo Reminder Engine: No todos due for reminder");
    return;
  }
  
  console.log(`Todo Reminder Engine: Sending reminders for ${dueTodos.length} todos`);
  
  for (const todo of dueTodos) {
    try {
      await notificationService.notify({
        userId: todo.userId,
        type: "TODO_REMINDER",
        title: `Todo Reminder: ${todo.title}`,
        body: `Due now (Today list)`,
        severity: "INFO",
        groupKey: `todo-${todo.id}`,
        metadata: {
          todoId: todo.id,
          forDate: todo.forDate,
        },
        actionType: "todo_reminder",
      });
      
      await updateLastRemindedAt(todo.id);
      
      console.log(`✅ Reminder sent for todo: ${todo.id}`);
    } catch (err) {
      console.error("❌ Todo Reminder Engine error for todo:", todo.id, err);
    }
  }
}

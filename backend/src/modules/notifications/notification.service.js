import { db } from "../../config/db.js";
import { notifications, notificationPreferences, followups } from "../../db/schema.js";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { logEvent } from "../events/event.service.js";

/**
 * ============================================================================
 * OBSERVABILITY: Metrics & Debug Events
 * ============================================================================
 */

// In-memory metrics (for single-instance deployments)
// For multi-instance: see Redis alternative in implementation guide
const metrics = {
  global: {
    sent: 0,
    skipped: 0,
    errors: 0,
  },
  byUser: new Map(), // userId -> { sent, skipped, errors }
};

// Ring buffer(a rolling log of the last 500 notification events) for debug events (max 500, FIFO)
const MAX_EVENTS = 500;
const debugEvents = [];

/**
 * Add a debug event to the ring buffer
 */
function addDebugEvent(userId, reasonCode, type, details = {}) {
  const event = {
    ts: new Date().toISOString(),
    userId,
    reasonCode,
    type,
    details,
  };

  debugEvents.push(event);

  // FIFO eviction when exceeding max
  if (debugEvents.length > MAX_EVENTS) {
    debugEvents.shift();
  }
}

/**
 * Increment metrics for a user
 */
function incrementMetric(userId, metric) {
  // Global
  metrics.global[metric]++;

  // Per-user
  if (!metrics.byUser.has(userId)) {
    metrics.byUser.set(userId, { sent: 0, skipped: 0, errors: 0 });
  }
  metrics.byUser.get(userId)[metric]++;
}

/**
 * Get metrics (optionally filtered by userId)
 */
export function getMetrics(userId = null) {
  if (userId) {
    return {
      global: metrics.global,
      user: metrics.byUser.get(userId) || { sent: 0, skipped: 0, errors: 0 },
    };
  }
  return {
    global: metrics.global,
    byUser: Object.fromEntries(metrics.byUser),
  };
}

/**
 * Get debug events (optionally filtered by userId)
 */
export function getDebugEvents(userId = null) {
  if (userId) {
    return debugEvents.filter((e) => e.userId === userId);
  }
  return debugEvents;
}

async function emitToUser(userId, event, payload = {}) {
  try {
    const { getIO } = await import("../../socket.js");
    const io = getIO();
    if (io) {
      io.to(userId).emit(event, payload);
    }
  } catch (err) {
    console.error("Socket emit error:", err);
  }
}

/**
 * ============================================================================
 * NOTIFICATION SERVICE
 * ============================================================================
 */

export const notificationService = {
  /**
   * Main notification entry point
   * @param {Object} input - { userId, groupKey, type, severity, title, body, metadata, actionType }
   * @returns {Object} - { sent: boolean, skipped?: boolean, reason?: string, notification?: object }
   */
  async notify(input) {
    const { userId, groupKey, type, severity, title, body, metadata = {}, actionType } = input;

    try {
      // 1. Check preferences
      const prefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      if (prefs.length > 0) {
        const p = prefs[0];

        // Check: in_app_disabled
        if (!p.inAppEnabled) {
          incrementMetric(userId, "skipped");
          addDebugEvent(userId, "in_app_disabled", type, { title });
          return { sent: false, skipped: true, reason: "in_app_disabled" };
        }

        // Check: type_disabled
        if (Array.isArray(p.typesDisabled) && p.typesDisabled.includes(type)) {
          incrementMetric(userId, "skipped");
          addDebugEvent(userId, "type_disabled", type, { title, disabledTypes: p.typesDisabled });
          return { sent: false, skipped: true, reason: "type_disabled" };
        }

        // Check: quiet_hours
        if (p.quietHoursEnabled && p.quietHoursStart && p.quietHoursEnd) {
          if (this.isBetweenTimes(p.quietHoursStart, p.quietHoursEnd)) {
            // Insert into DB but DON'T emit socket
            const notification = await this.insertNotification(input);
            incrementMetric(userId, "skipped");
            addDebugEvent(userId, "quiet_hours", type, {
              title,
              quietStart: p.quietHoursStart,
              quietEnd: p.quietHoursEnd,
            });
            return { sent: true, signalEmitted: false, reason: "quiet_hours", notification };
          }
        }
      }

      // 2. Insert into DB
      const notification = await this.insertNotification(input);

      // 3. Emit socket event
      try {
        const { getIO } = await import("../../socket.js");
        const io = getIO();
        if (io) {
          io.to(userId).emit("notification:changed", {
            groupKey,
            title,
            message: body,
            severity,
          });
          io.to(userId).emit("unread:changed", {});
        }
      } catch (socketErr) {
        incrementMetric(userId, "errors");
        addDebugEvent(userId, "socket_emit_failed", type, {
          title,
          error: socketErr.message,
        });
        console.error("Socket emit failed:", socketErr);
        // Don't fail the whole operation
      }

      // Success
      incrementMetric(userId, "sent");
      addDebugEvent(userId, "sent", type, { title, groupKey });
      return { sent: true, notification };
    } catch (err) {
      incrementMetric(userId, "errors");
      addDebugEvent(userId, "db_insert_failed", type, {
        title,
        error: err.message,
      });
      console.error("Notification service error:", err);
      throw err;
    }
  },

  /**
   * Insert notification into database
   */
  async insertNotification(input) {
    const [record] = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        groupKey: input.groupKey,
        type: input.type,
        severity: input.severity || "INFO",
        title: input.title,
        body: input.body,
        metadata: input.metadata || {},
        actionType: input.actionType,
      })
      .returning();
    return record;
  },

  /**
   * Check if current time is between start and end times
   * Handles cross-midnight ranges (e.g., 22:00 → 08:00)
   * @param {string} start - "HH:MM"
   * @param {string} end - "HH:MM"
   */
  isBetweenTimes(start, end) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [sh, sm] = start.split(":").map(Number);
    const startMinutes = sh * 60 + sm;

    const [eh, em] = end.split(":").map(Number);
    const endMinutes = eh * 60 + em;

    // Edge case: start === end means 24-hour quiet (always muted)
    if (startMinutes === endMinutes) {
      return true;
    }

    if (startMinutes < endMinutes) {
      // Normal day range (e.g., 09:00 to 17:00)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Crosses midnight (e.g., 22:00 to 08:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  },
};

/**
 * ============================================================================
 * QUERY / MUTATION HELPERS (used by the notifications HTTP API)
 * ============================================================================
 */

export async function getUnreadCount(userId) {
  const result = await db
    .select({ count: sql`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return parseInt(result[0].count);
}

export async function getNotifications(userId, { page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;

  const list = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  return { notifications: list, page, limit };
}

export async function getGroups(userId) {
  // Simplified SQL approach for MVP efficiency:
  const result = await db.execute(sql`
    SELECT
      n.group_key as "groupKey",
      COUNT(*) FILTER (WHERE n.is_read = false)::int as "unreadCount",
      MAX(n.created_at) as "lastActivity",
      (ARRAY_AGG(n.title ORDER BY n.created_at DESC))[1] as "latestTitle",
      (ARRAY_AGG(n.severity ORDER BY n.created_at DESC))[1] as "latestSeverity",
      (ARRAY_AGG(n.type ORDER BY n.created_at DESC))[1] as "latestType",
      (ARRAY_AGG(n.metadata ORDER BY n.created_at DESC))[1] as "latestMetadata"
    FROM notifications n
    WHERE n.user_id = ${userId}
    GROUP BY n.group_key
    ORDER BY "lastActivity" DESC
  `);

  return result.rows;
}

export async function getGroupDetails(userId, groupKey) {
  return db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.groupKey, groupKey)))
    .orderBy(desc(notifications.createdAt));
}

export async function markAsRead(userId, notificationId) {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

  await emitToUser(userId, "unread:changed");
}

export async function markGroupRead(userId, groupKey) {
  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.groupKey, groupKey),
      eq(notifications.isRead, false)
    ));

  await emitToUser(userId, "unread:changed");
}

export async function batchMarkRead(userId, ids) {
  if (!ids || !ids.length) return;

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), inArray(notifications.id, ids)));

  await emitToUser(userId, "unread:changed");
}

/**
 * Marks a notification's linked followup as DONE, plus the notification itself.
 */
export async function actionDone(userId, notificationId) {
  const [notif] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

  if (!notif) {
    return { notFound: true };
  }

  const followupId = notif.metadata?.followupId;

  if (followupId) {
    await db.update(followups)
      .set({
        status: "DONE",
        completedAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
        lastReminderSentAt: null,
      })
      .where(and(eq(followups.id, followupId), eq(followups.userId, userId)));

    await logEvent({
      followupId,
      userId,
      eventType: "COMPLETED",
      message: "Marked done via notification",
    });
  }

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));

  await emitToUser(userId, "unread:changed");
  await emitToUser(userId, "notification:changed", { groupKey: notif.groupKey });

  return { success: true };
}

/**
 * Snoozes a notification's linked followup by the given number of minutes.
 */
export async function actionSnooze(userId, notificationId, minutes) {
  const [notif] = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));

  if (!notif) {
    return { notFound: true };
  }

  const followupId = notif.metadata?.followupId;

  if (followupId) {
    const [existing] = await db
      .select()
      .from(followups)
      .where(and(eq(followups.id, followupId), eq(followups.userId, userId)));

    if (existing && existing.status === "DONE") {
      return { cannotSnoozeDone: true };
    }

    if (existing) {
      const newDueAt = new Date(new Date(existing.dueAt).getTime() + minutes * 60000);

      await db.update(followups)
        .set({
          dueAt: newDueAt,
          status: "SNOOZED",
          lastReminderSentAt: null,
          updatedAt: new Date(),
        })
        .where(eq(followups.id, followupId));

      await logEvent({
        followupId,
        userId,
        eventType: "SNOOZED",
        message: `Snoozed for ${minutes} mins via notification`,
      });
    }
  }

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));

  await emitToUser(userId, "unread:changed");
  await emitToUser(userId, "notification:changed", { groupKey: notif.groupKey });

  return { success: true };
}

export async function getPreferences(userId) {
  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (prefs) return prefs;

  return {
    emailEnabled: true,
    inAppEnabled: true,
    typesDisabled: [],
    quietHoursEnabled: false,
  };
}

export async function updatePreferences(userId, data) {
  const {
    emailEnabled,
    inAppEnabled,
    typesDisabled,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
  } = data;

  const [existing] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing) {
    await db
      .update(notificationPreferences)
      .set({
        emailEnabled,
        inAppEnabled,
        typesDisabled,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId));
  } else {
    await db.insert(notificationPreferences).values({
      userId,
      emailEnabled,
      inAppEnabled,
      typesDisabled: typesDisabled || [],
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
    });
  }
}

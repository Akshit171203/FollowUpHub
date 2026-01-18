import { db } from "../config/db.js";
import { notifications, notificationPreferences } from "../db/schema.js";
import { eq } from "drizzle-orm";

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

// Ring buffer for debug events (max 500, FIFO)
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
        const { getIO } = await import("../socket.js");
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

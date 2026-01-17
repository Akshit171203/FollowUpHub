import { db } from "../config/db.js";
import { notifications, notificationPreferences} from "../db/schema.js";
import { eq, and } from "drizzle-orm";
// import { io } from "../socket.js"; // Circular dependency risk or just strict import? We'll inject or import carefully.
// For now, let's assume we can import a helper to emit.

/**
 * @typedef {Object} NotifyInput
 * @property {string} userId - Target User ID
 * @property {string} groupKey - Grouping key (e.g. "followup:123")
 * @property {import("../db/schema.js").notificationTypeEnum} type - Notification Type
 * @property {import("../db/schema.js").notificationSeverityEnum} severity - Severity
 * @property {string} title - Notification Title
 * @property {string} [body] - Notification Body
 * @property {Object} [metadata] - JSON Metadata
 * @property {string} [actionType] - Action Type
 */

export const notificationService = {
  /**
   * Main entrypoint to send a notification.
   * Checks preferences -> Insert DB -> Emit Socket Event
   * @param {NotifyInput} input
   */
  
  async notify(input) {
    const { userId, groupKey, type, severity, title, body, metadata = {}, actionType } = input;

    // 1. Check Preferences
    // We fetch checks first to avoid unnecessary DB writes.
    // If no preferences record exists, we assume defaults (Internal logic: Enabled).
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (prefs.length > 0) {
      const p = prefs[0];
      
      // In-App global toggle
      if (!p.inAppEnabled) {
        return { skipped: true, reason: "in_app_disabled" };
      }

      // Disabled Types
      if (Array.isArray(p.typesDisabled) && p.typesDisabled.includes(type)) {
        return { skipped: true, reason: "type_disabled" };
      }

      // Quiet Hours (Simplistic implementation: Block if currently in quiet hours)
      // Note: User can use 24h format "22:00", "08:00"
      if (p.quietHoursEnabled && p.quietHoursStart && p.quietHoursEnd) {
        if (this.isBetweenTimes(p.quietHoursStart, p.quietHoursEnd)) {
           // For MVP: We skip emitting. User asked "store delayedUntil OR don't emit".
           // We will store it but NOT emit signal.
           // So we proceed to Insert, but return early before Emit.
           const notification = await this.insertNotification(input);
           return { sent: true, signalEmitted: false, reason: "quiet_hours" };
        }
      }
    }

    // 2. Insert into DB
    const notification = await this.insertNotification(input);

    // 3. Emit Signal
    // We need to dynamic import or use a global IO instance to avoid circular deps if initialized in server.js
    // For now, let's look for a standard way to get IO. 
    // Usually `req.app.get('io')` works in routes, but this is a service.
    // We will export a `getIO()` from socket.js or similar.
    try {
        const { getIO } = await import("../socket.js"); 
        const io = getIO();
        if (io) {
             io.to(userId).emit("notification:changed", { 
                 groupKey,
                 title: input.title,
                 message: input.body,
                 severity: input.severity
             });
             
             // Also emit unread count update - Client can refetch or we can calculate it.
             // Calculating unread count might be expensive to do on every notify.
             // Client usually fetches unread count on 'notification:changed' anyway?
             // Let's emit a focused signal.
              io.to(userId).emit("unread:changed", { 
                // generic signal, let client fetch accurate count
              });
        }
    } catch (e) {
        console.warn("Socket emit failed:", e.message);
    }

    return { sent: true, notification };
  },

  async insertNotification(input) {
      // Drizzle insert returning id
      const [record] = await db.insert(notifications).values({
          userId: input.userId,
          groupKey: input.groupKey,
          type: input.type,
          severity: input.severity || "INFO",
          title: input.title,
          body: input.body,
          metadata: input.metadata || {},
          actionType: input.actionType,
      }).returning();
      return record;
  },

  /**
   * Helper to check if current time is within partial range
   * @param {string} start "HH:MM"
   * @param {string} end "HH:MM"
   */
  isBetweenTimes(start, end) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [sh, sm] = start.split(":").map(Number);
      const startMinutes = sh * 60 + sm;

      const [eh, em] = end.split(":").map(Number);
      const endMinutes = eh * 60 + em;

      if (startMinutes < endMinutes) {
          // Normal day range (e.g. 09:00 to 17:00)
          return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } else {
          // Crosses midnight (e.g. 22:00 to 08:00)
          return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }
  }
};

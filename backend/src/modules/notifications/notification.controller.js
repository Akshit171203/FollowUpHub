import { db } from "../../config/db.js";
import { notifications, notificationPreferences, followups, followupEvents } from "../../db/schema.js";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { logEvent } from "../events/event.service.js";
import { getIO } from "../../socket.js";

export const notificationController = {
  /**
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res) {
      try {
          const userId = req.user.id;
          const result = await db
            .select({ count: sql`count(*)` })
            .from(notifications)
            .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
          
          return res.json({ count: parseInt(result[0].count) });
      } catch (err) {
          console.error("getUnreadCount error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * GET /api/notifications
   * Raw list of notifications, paginated
   */
  async getNotifications(req, res) {
      try {
          const userId = req.user.id;
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 20;
          const offset = (page - 1) * limit;

          const list = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(desc(notifications.createdAt))
            .limit(limit)
            .offset(offset);
          
          return res.json({ notifications: list, page, limit });
      } catch (err) {
          console.error("getNotifications error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * GET /api/notifications/groups
   * Returns list of notification groups with latest item and unread count.
   */
  async getGroups(req, res) {
    try {
      const userId = req.user.id;
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

      return res.json({ groups: result.rows });
    } catch (err) {
      console.error("getGroups error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * GET /api/notifications/groups/:groupKey
   * Returns all notifications in a group
   */
  async getGroupDetails(req, res) {
    try {
        const userId = req.user.id;
        const { groupKey } = req.params;

        const list = await db
            .select()
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.groupKey, groupKey)
            ))
            .orderBy(desc(notifications.createdAt));
        
        return res.json({ notifications: list });
    } catch (err) {
        console.error("getGroupDetails error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * PATCH /api/notifications/:id/read
   */
  async markAsRead(req, res) {
      try {
          const userId = req.user.id;
          const { id } = req.params;

          await db
            .update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
          
          const io = getIO();
          io.to(`user:${userId}`).emit("unread:changed");
          
          return res.json({ success: true });
      } catch (err) {
          console.error("markAsRead error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * PATCH /api/notifications/groups/:groupKey/read-all
   */
  async markGroupRead(req, res) {
      try {
          const userId = req.user.id;
          const { groupKey } = req.params;

          await db
            .update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.groupKey, groupKey),
                eq(notifications.isRead, false)
            ));
          
          const io = getIO();
          io.to(`user:${userId}`).emit("unread:changed");
          
          return res.json({ success: true });
      } catch (err) {
          console.error("markGroupRead error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * POST /api/notifications/batch/read
   * Body: { ids: string[] }
   */
  async batchMarkRead(req, res) {
      try {
          const userId = req.user.id;
          const { ids } = req.body;
          
          if (!ids || !ids.length) return res.json({ success: true });

          await db
            .update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(and(
                eq(notifications.userId, userId),
                inArray(notifications.id, ids)
            ));

          const io = getIO();
          io.to(`user:${userId}`).emit("unread:changed");

          return res.json({ success: true });
      } catch (err) {
          console.error("batchMarkRead error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * POST /api/notifications/:id/action/done
   * Marks notification read + Marks follow-up done
   */
  async actionDone(req, res) {
      try {
          const userId = req.user.id;
          const { id } = req.params;

          // 1. Get notification to find follow-up ID
          const [notif] = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
          
          if (!notif) return res.status(404).json({ error: "Notification not found" });
          
          const metadata = notif.metadata; // JSONB
          const followupId = metadata?.followupId;

          if (followupId) {
              // 2. Mark Follow-up as DONE
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
                  message: "Marked done via notification"
              });
          }

          // 3. Mark Notification Read
          await db.update(notifications)
             .set({ isRead: true, readAt: new Date() })
             .where(eq(notifications.id, id));

          const io = getIO();
          io.to(`user:${userId}`).emit("unread:changed");
          io.to(`user:${userId}`).emit("notification:changed", { groupKey: notif.groupKey });

          return res.json({ success: true });
      } catch (err) {
          console.error("actionDone error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * POST /api/notifications/:id/action/snooze
   * Body: { minutes }
   */
  async actionSnooze(req, res) {
      try {
          const userId = req.user.id;
          const { id } = req.params;
          const { minutes } = req.body;

          if (!minutes || minutes < 1) return res.status(400).json({ error: "Invalid minutes" });

          // 1. Get notification
          const [notif] = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
          
          if (!notif) return res.status(404).json({ error: "Notification not found" });

          const metadata = notif.metadata;
          const followupId = metadata?.followupId;

          if (followupId) {
              // 2. Check existing follow-up status
              const [existing] = await db
                  .select()
                  .from(followups)
                  .where(and(eq(followups.id, followupId), eq(followups.userId, userId)));
              
              if (existing && existing.status !== "DONE") {
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
                      message: `Snoozed for ${minutes} mins via notification`
                  });
              } else if (existing && existing.status === "DONE") {
                  return res.status(400).json({ error: "Cannot snooze completed follow-up" });
              }
          }

          // 3. Mark Notification Read
          await db.update(notifications)
            .set({ isRead: true, readAt: new Date() })
            .where(eq(notifications.id, id));

          const io = getIO();
          io.to(`user:${userId}`).emit("unread:changed");
          io.to(`user:${userId}`).emit("notification:changed", { groupKey: notif.groupKey });
          
          return res.json({ success: true });
      } catch (err) {
          console.error("actionSnooze error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * GET /api/notifications/preferences
   */ 
  async getPreferences(req, res) {
      try {
          const userId = req.user.id;
          let [prefs] = await db
             .select()
             .from(notificationPreferences)
             .where(eq(notificationPreferences.userId, userId))
             .limit(1);
          
          if (!prefs) {
              // Return defaults if not found
              prefs = {
                  emailEnabled: true,
                  inAppEnabled: true,
                  typesDisabled: [],
                  quietHoursEnabled: false
              };
          }
          return res.json({ preferences: prefs });
      } catch (err) {
          console.error("getPreferences error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  },

  /**
   * PATCH /api/notifications/preferences
   */
  async updatePreferences(req, res) {
      try {
          const userId = req.user.id;
          const { 
              emailEnabled, 
              inAppEnabled, 
              typesDisabled, 
              quietHoursEnabled, 
              quietHoursStart, 
              quietHoursEnd 
          } = req.body;

          // Upsert
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
                  quietHoursEnd
              });
          }

          return res.json({ success: true });
      } catch (err) {
          console.error("updatePreferences error:", err);
          return res.status(500).json({ error: "Internal server error" });
      }
  }
};

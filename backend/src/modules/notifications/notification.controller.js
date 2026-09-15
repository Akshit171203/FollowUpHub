import * as notificationService from "./notification.service.js";
import { notificationService as notifyEngine } from "./notification.service.js";

export const notificationController = {
  /**
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res) {
    try {
      const count = await notificationService.getUnreadCount(req.user.id);
      return res.json({ count });
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
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await notificationService.getNotifications(req.user.id, { page, limit });

      return res.json(result);
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
      const groups = await notificationService.getGroups(req.user.id);
      return res.json({ groups });
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
      const { groupKey } = req.params;
      const list = await notificationService.getGroupDetails(req.user.id, groupKey);
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
      await notificationService.markAsRead(req.user.id, req.params.id);
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
      await notificationService.markGroupRead(req.user.id, req.params.groupKey);
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
      await notificationService.batchMarkRead(req.user.id, req.body.ids);
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
      const result = await notificationService.actionDone(req.user.id, req.params.id);

      if (result.notFound) {
        return res.status(404).json({ error: "Notification not found" });
      }

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
      const { minutes } = req.body;

      if (!minutes || minutes < 1) {
        return res.status(400).json({ error: "Invalid minutes" });
      }

      const result = await notificationService.actionSnooze(req.user.id, req.params.id, minutes);

      if (result.notFound) {
        return res.status(404).json({ error: "Notification not found" });
      }

      if (result.cannotSnoozeDone) {
        return res.status(400).json({ error: "Cannot snooze completed follow-up" });
      }

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
      const preferences = await notificationService.getPreferences(req.user.id);
      return res.json({ preferences });
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
      await notificationService.updatePreferences(req.user.id, req.body);
      return res.json({ success: true });
    } catch (err) {
      console.error("updatePreferences error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * GET /api/notifications/debug/me
   * Returns metrics and debug events for the current user only
   */
  async getDebugMe(req, res) {
    try {
      const userId = req.user.id;
      const metrics = notificationService.getMetrics(userId);
      const events = notificationService.getDebugEvents(userId);

      return res.json({
        metrics,
        events,
        note: "Showing data for current user only",
      });
    } catch (err) {
      console.error("getDebugMe error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * GET /api/notifications/debug/admin
   * Returns global metrics and all debug events
   * SECURITY: Requires admin role
   */
  async getDebugAdmin(req, res) {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }

      const metrics = notificationService.getMetrics();
      const events = notificationService.getDebugEvents();

      return res.json({
        metrics,
        events,
        note: "Global data (admin view)",
      });
    } catch (err) {
      console.error("getDebugAdmin error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  /**
   * POST /api/notifications/test
   * Sends a test notification for the current user
   */
  async sendTestNotification(req, res) {
    try {
      const userId = req.user.id;
      const testGroupKey = `test-${Date.now()}`;

      const result = await notifyEngine.notify({
        userId,
        groupKey: testGroupKey,
        type: "REMINDER_SENT",
        severity: "INFO",
        title: "Test Notification",
        body: "This is a test notification to verify your setup is working correctly.",
        metadata: {
          isTest: true,
          timestamp: new Date().toISOString(),
        },
        actionType: "test",
      });

      return res.json({
        success: true,
        result,
        message: "Test notification sent. Check your notifications or desktop alerts!",
      });
    } catch (err) {
      console.error("sendTestNotification error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
};

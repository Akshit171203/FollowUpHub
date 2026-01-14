import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  markNotificationRead,
} from "./notification.service.js";

const router = express.Router();

/**
 * GET /api/notifications with pagination
 * Optional filters:
 *  - ?isRead=true/false
 *  - ?type=FOLLOWUP_DUE
 *  - ?page=1
 *  - ?limit=10
 */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const filters = {};

    if (req.query.isRead !== undefined) {
      filters.isRead = req.query.isRead === "true";
    }

    if (req.query.type) {
      filters.type = req.query.type;
    }

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    const result = await getNotifications(userId, filters, pagination);

    return res.json(result);
  } catch (err) {
    console.error("GET /notifications error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
router.get("/unread", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await getNotifications(userId, { isRead: false });

    return res.json({ notifications: list });
  } catch (err) {
    console.error("GET /notifications/unread error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}); 
/**
 * GET /api/notifications/unread-count
 */
router.get("/unread-count", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCount(userId);

    return res.json({ count });
  } catch (err) {
    console.error("GET /notifications/unread-count error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/notifications/:id/read
 */
router.patch("/:id/read", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const updated = await markNotificationRead(userId, id);

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    return res.json({
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (err) {
    console.error("PATCH /notifications/:id/read error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * PATCH /api/notifications/read-all
 */
router.patch("/read-all", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await markAllRead(userId);

    return res.json({ message: "All notifications marked read", count });
  } catch (err) {
    console.error("PATCH /notifications/read-all error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;

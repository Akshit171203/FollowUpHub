import express from "express";
import { authenticateUser } from "../../middlewares/auth.middleware.js";
import { notificationController } from "./notification.controller.js";

const router = express.Router();

// General
router.get("/", authenticateUser, notificationController.getNotifications);
router.get("/unread-count", authenticateUser, notificationController.getUnreadCount);
router.patch("/:id/read", authenticateUser, notificationController.markAsRead);
router.post("/batch/read", authenticateUser, notificationController.batchMarkRead);

// Actions
router.post("/:id/action/done", authenticateUser, notificationController.actionDone);
router.post("/:id/action/snooze", authenticateUser, notificationController.actionSnooze);

// Grouped Notifications
router.get("/groups", authenticateUser, notificationController.getGroups);
router.get("/groups/:groupKey", authenticateUser, notificationController.getGroupDetails);
router.patch("/groups/:groupKey/read-all", authenticateUser, notificationController.markGroupRead);

// Preferences
router.get("/preferences", authenticateUser, notificationController.getPreferences);
router.patch("/preferences", authenticateUser, notificationController.updatePreferences);

// === OBSERVABILITY & DEBUGGING ===
// User-specific debug endpoint (safe for all users)
router.get("/debug/me", authenticateUser, notificationController.getDebugMe);

// Admin-only debug endpoint (requires admin role)
router.get("/debug/admin", authenticateUser, notificationController.getDebugAdmin);

// Test notification endpoint
router.post("/test", authenticateUser, notificationController.sendTestNotification);

export default router;

/**
 * Desktop Notification Utility
 * 
 * Handles browser desktop notifications (Web Notifications API)
 * - Permission checking and requesting
 * - Showing notifications with per-group throttling
 * - Click handlers for navigation
 */

// Per-group throttle: Don't spam same notification within 3 seconds
const THROTTLE_MS = 3000;
const lastNotificationTimes = new Map<string, number>();

/**
 * Check if browser supports desktop notifications (SSR-safe)
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Get current permission status without requesting (SSR-safe)
 * Returns: "granted" | "denied" | "default"
 */
export function getPermissionStatus(): NotificationPermission {
  if (!isNotificationSupported()) {
    return "denied";
  }
  return Notification.permission;
}

/**
 * Request permission from user (call this from a UI button click)
 * Returns: "granted" | "denied" | "default"
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn("Desktop notifications not supported in this browser");
    return "denied";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Show a desktop notification
 * 
 * @param title - Notification title
 * @param body - Notification body text
 * @param groupKey - Used as tag for deduplication AND per-group throttling
 * @param onClick - Callback when notification is clicked
 * @returns Notification instance or null if throttled/failed
 */
export function showDesktopNotification(
  title: string,
  body: string,
  groupKey: string,
  onClick?: () => void
): Notification | null {
  // Check support
  if (!isNotificationSupported()) {
    return null;
  }

  // Check permission
  if (Notification.permission !== "granted") {
    return null;
  }

  // Per-group throttle check (different groups can notify simultaneously)
  const now = Date.now();
  const lastTime = lastNotificationTimes.get(groupKey) || 0;
  if (now - lastTime < THROTTLE_MS) {
    console.log(`Desktop notification throttled for group: ${groupKey}`);
    return null;
  }

  try {
    // Create notification with tag for deduplication
    const notification = new Notification(title, {
      body,
      tag: groupKey, // Same tag replaces previous notification
      requireInteraction: false, // Auto-dismiss after a few seconds
      // Note: icon and badge removed - add them later with actual image files
    });

    // Update per-group throttle timestamp
    lastNotificationTimes.set(groupKey, now);

    // Handle click - safely focus and navigate
    if (onClick) {
      notification.onclick = (event) => {
        event.preventDefault(); // Prevent default browser behavior
        try {
          window.focus();
          onClick();
        } catch (error) {
          console.error("Error handling notification click:", error);
        } finally {
          notification.close();
        }
      };
    }

    return notification;
  } catch (error) {
    console.error("Error showing desktop notification:", error);
    return null;
  }
}

/**
 * Check if the current tab/window is focused (SSR-safe)
 * Returns true if user can see the page
 */
export function isTabVisible(): boolean {
  if (typeof document === "undefined") {
    return true; // Assume visible during SSR
  }
  return document.visibilityState === "visible";
}

/**
 * Clean up old throttle entries (call this periodically to prevent memory leaks)
 */
export function cleanupThrottleCache(): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  lastNotificationTimes.forEach((time, key) => {
    if (now - time > THROTTLE_MS * 2) {
      expiredKeys.push(key);
    }
  });
  
  expiredKeys.forEach(key => lastNotificationTimes.delete(key));
}

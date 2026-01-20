"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPermissionStatus,
  requestNotificationPermission,
  isNotificationSupported,
} from "@/lib/notificationPermission";

/**
 * Desktop Notification Toggle Component
 * 
 * Allows users to enable/disable desktop notifications
 * Shows current status and handles permission request
 * Polls permission status to stay in sync with browser settings
 */
export function DesktopNotificationToggle() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check permission status and sync with browser (runs on mount and periodically)
  useEffect(() => {
    if (!isNotificationSupported()) {
      return;
    }
    
    const updatePermission = () => {
      const currentPermission = getPermissionStatus();
      setPermissionStatus(currentPermission);
      
      // If permission revoked, disable in localStorage
      if (currentPermission !== "granted") {
        const wasEnabled = localStorage.getItem("desktopNotificationsEnabled") === "true";
        if (wasEnabled) {
          localStorage.setItem("desktopNotificationsEnabled", "false");
          setEnabled(false);
        }
      }
    };
    
    // Initial check
    updatePermission();
    
    // Load user preference
    const savedPreference = localStorage.getItem("desktopNotificationsEnabled");
    setEnabled(savedPreference === "true");
    
    // Poll every 5 seconds to detect permission changes
    const interval = setInterval(updatePermission, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    if (!isNotificationSupported()) {
      alert("Desktop notifications are not supported in this browser");
      return;
    }

    setLoading(true);

    try {
      if (!enabled) {
        // User wants to enable - request permission if not granted
        if (permissionStatus !== "granted") {
          const newPermission = await requestNotificationPermission();
          setPermissionStatus(newPermission);
          
          if (newPermission !== "granted") {
            alert("Please allow notifications in your browser settings");
            setLoading(false);
            return;
          }
        }
        
        // Enable in localStorage
        localStorage.setItem("desktopNotificationsEnabled", "true");
        setEnabled(true);
      } else {
        // User wants to disable
        localStorage.setItem("desktopNotificationsEnabled", "false");
        setEnabled(false);
      }
    } catch (error) {
      console.error("Error toggling desktop notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if not supported
  if (!isNotificationSupported()) {
    return null;
  }

  // Determine button state
  const isActive = enabled && permissionStatus === "granted";
  const buttonText = isActive ? "Desktop Alerts On" : "Desktop Alerts Off";
  const Icon = isActive ? Bell : BellOff;

  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={
        isActive 
          ? "gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-transparent" 
          : "gap-2 text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900"
      }
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline font-medium">{buttonText}</span>
    </Button>
  );
}

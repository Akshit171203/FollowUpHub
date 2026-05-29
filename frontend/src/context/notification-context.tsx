"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  showDesktopNotification,
  isTabVisible,
  getPermissionStatus,
  cleanupThrottleCache,
} from "@/lib/notificationPermission";

type NotificationGroup = {
  groupKey: string;
  unreadCount: number;
  lastActivity: string;
  latestTitle: string;
  latestSeverity: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "CRITICAL";
  latestType: string;
};

type NotificationContextType = {
  groups: NotificationGroup[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markGroupRead: (groupKey: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  actionDone: (id: string) => Promise<void>;
  actionSnooze: (id: string, minutes: number) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Ref to prevent stale closure issues
  const groupsRef = useRef<NotificationGroup[]>([]);
  
  useEffect(() => {
    groupsRef.current = groups;
  }, [groups]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ groups: NotificationGroup[] }>("/api/notifications/groups");
      
      if (res?.groups) {
          setGroups(res.groups);
          // Calculate total unread count from groups, ensuring numeric addition
          const totalUnread = res.groups.reduce((acc, g) => acc + (parseInt(String(g.unreadCount)) || 0), 0);
          setUnreadCount(totalUnread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Debounced version for socket events (500ms delay)
  const debouncedFetchGroups = useRef(debounce(fetchGroups, 500)).current;
  
  const markGroupRead = useCallback(async (groupKey: string) => {
      try {
          // Use ref to avoid stale closure
          const currentGroups = groupsRef.current;
          const targetGroup = currentGroups.find(g => g.groupKey === groupKey);
          const unreadToSubtract = targetGroup?.unreadCount || 0;
          
          // Optimistic update
          setGroups(prev => prev.map(g => g.groupKey === groupKey ? { ...g, unreadCount: 0 } : g));
          setUnreadCount(prev => Math.max(0, prev - unreadToSubtract));

          await apiFetch(`/api/notifications/groups/${groupKey}/read-all`, { method: "PATCH" });
      } catch (err) {
          console.error("Failed to read group:", err);
          fetchGroups(); // Revert on error
      }
  }, [fetchGroups]);

  const markAsRead = useCallback(async (id: string) => {
      try {
          await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
          console.error("Failed to mark read:", err);
      }
  }, []);

  const actionDone = useCallback(async (id: string) => {
      try {
          await apiFetch(`/api/notifications/${id}/action/done`, { method: "POST" });
      } catch (err) {
          console.error("Failed to mark done:", err);
          throw err;
      }
  }, []);

  const actionSnooze = useCallback(async (id: string, minutes: number) => {
      try {
          await apiFetch(`/api/notifications/${id}/action/snooze`, { 
              method: "POST",
              body: JSON.stringify({ minutes })
          });
      } catch (err) {
          console.error("Failed to snooze:", err);
          throw err;
      }
  }, []);

  // Ref to prevent double-fetch in Strict Mode
  const initialized = useRef(false);

  useEffect(() => {
    // Socket connection
    const socket = connectSocket();

    // Initial Fetch - Prevent double fetch in Strict Mode
    if (!initialized.current) {
      fetchGroups();
      initialized.current = true;
    }
    
    // Cleanup throttle cache every 5 minutes
    const cleanupInterval = setInterval(cleanupThrottleCache, 5 * 60 * 1000);

    const handleChanged = (data: { groupKey: string; title?: string; message?: string; severity?: string }) => {
        if (data.title) {
            // Play Sound
            try {
                // Using a softer, more pleasant UI pop sound (mixkit-2354) instead of the loud chime
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
                audio.volume = 0.5;
                audio.play().catch(e => console.warn("Audio play failed", e));
            } catch (e) {
                console.warn("Audio setup failed", e);
            }

            // Show in-app toast
            toast(data.title, {
                description: data.message,
                action: {
                    label: "View",
                    onClick: () => {
                        if (data.groupKey) {
                          try {
                            router.push(`/notifications/${data.groupKey}`);
                          } catch (error) {
                            console.error("Navigation failed:", error);
                          }
                        }
                    }
                }
            });

            // Desktop Notification Logic
            const desktopEnabled = typeof window !== "undefined" && localStorage.getItem("desktopNotificationsEnabled") === "true";
            const permissionGranted = getPermissionStatus() === "granted";
            const alwaysShow = typeof window !== "undefined" && localStorage.getItem("desktopNotificationsAlwaysShow") === "true";
            const tabHidden = !isTabVisible();

            // Show if: enabled AND permission granted AND (tab hidden OR always show)
            if (desktopEnabled && permissionGranted && (tabHidden || alwaysShow)) {
                showDesktopNotification(
                    data.title,
                    data.message || "",
                    data.groupKey,
                    () => {
                        try {
                            window.focus();
                            if (data.groupKey) {
                                router.push(`/notifications/${data.groupKey}`);
                            }
                        } catch (error) {
                            console.error("Desktop notification click failed:", error);
                        }
                    }
                );
            }
        }
        
        // Use debounced fetch to prevent API spam
        debouncedFetchGroups();
    };
    
    const handleUnreadChanged = () => {
        debouncedFetchGroups();
    };

    socket.on("notification:changed", handleChanged);
    socket.on("unread:changed", handleUnreadChanged);

    return () => {
      socket.off("notification:changed", handleChanged);
      socket.off("unread:changed", handleUnreadChanged);
      disconnectSocket();
      clearInterval(cleanupInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - listeners use latest state via refs/closures

  return (
    <NotificationContext.Provider value={{ groups, unreadCount, loading, refresh: fetchGroups, markGroupRead, markAsRead, actionDone, actionSnooze }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

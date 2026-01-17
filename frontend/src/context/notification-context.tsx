"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket"; // Adjust path
import { apiFetch } from "@/lib/api"; // Existing API helper assumed
import { toast } from "sonner";
// You might need to import types from your followups.ts or create new types

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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
  
  const markGroupRead = useCallback(async (groupKey: string) => {
      try {
          // Optimistic update
          setGroups(prev => prev.map(g => g.groupKey === groupKey ? { ...g, unreadCount: 0 } : g));
          setUnreadCount(prev => {
              const group = groups.find(g => g.groupKey === groupKey);
              return prev - (group?.unreadCount || 0);
          });

          await apiFetch(`/api/notifications/groups/${groupKey}/read-all`, { method: "PATCH" });
          // Optionally re-fetch to ensure sync
          // fetchGroups(); 
      } catch (err) {
          console.error("Failed to read group:", err);
          fetchGroups(); // Revert on error
      }
  }, [groups, fetchGroups]);

  const markAsRead = useCallback(async (id: string) => {
      try {
          await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
          // Optimistic update handled by socket return event usually, but we can double check
          setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
          console.error("Failed to mark read:", err);
      }
  }, []);

  const actionDone = useCallback(async (id: string) => {
      try {
          await apiFetch(`/api/notifications/${id}/action/done`, { method: "POST" });
          // Refresh will be triggered by socket events
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

  useEffect(() => {
    // 1. Connect Socket
    const socket = connectSocket();

    // 2. Initial Fetch
    fetchGroups();

    // 3. Listen for events
    const handleChanged = (data: { groupKey: string; title?: string; message?: string; severity?: string }) => {
        if (data.title) {
            // Play Sound
            try {
                // Simple "ding" sound
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.volume = 0.5;
                audio.play().catch(e => console.warn("Audio play failed", e));
            } catch (e) {
                console.warn("Audio setup failed", e);
            }

            // Show visible toast!
            toast(data.title, {
                description: data.message,
                action: {
                    label: "View",
                    onClick: () => {
                        // We could navigate
                    }
                }
            });
        }
        fetchGroups(); 
    };
    
    const handleUnreadChanged = () => {
        fetchGroups();
    };

    socket.on("notification:changed", handleChanged);
    socket.on("unread:changed", handleUnreadChanged);

    return () => {
      socket.off("notification:changed", handleChanged);
      socket.off("unread:changed", handleUnreadChanged);
      disconnectSocket();
    };
  }, [fetchGroups]);

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

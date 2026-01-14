"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  getAllNotifications,
  getUnreadCount,
  getUnreadNotifications,
  markAllRead,
  markNotificationRead,
  type Notification,
} from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    try {
      setLoading(true);
      const [count, list] = await Promise.all([
        getUnreadCount(),
        tab === "unread" ? getUnreadNotifications() : getAllNotifications(),
      ]);
      setUnreadCount(count);
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Request failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const list = useMemo(() => items, [items]);

  async function onMarkAllRead() {
    try {
      await markAllRead();
      toast.success("Marked all as read");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  async function onMarkRead(id: string) {
    try {
      await markNotificationRead(id);
      toast.success("Marked as read");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              Unread: {unreadCount}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={tab === "all" ? "default" : "outline"}
              onClick={() => setTab("all")}
            >
              All
            </Button>
            <Button
              variant={tab === "unread" ? "default" : "outline"}
              onClick={() => setTab("unread")}
            >
              Unread
            </Button>
            <Button variant="outline" onClick={onMarkAllRead}>
              Mark all read
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : list.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No notifications.
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {list.map((n) => (
                  <div key={n.id} className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {n.title ?? n.type ?? "Notification"}
                      </div>
                      <div className="text-sm text-muted-foreground break-words">
                        {n.message ?? "—"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {fmt(n.createdAt)}
                      </div>
                    </div>

                    <Button variant="outline" onClick={() => onMarkRead(n.id)}>
                      Mark read
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

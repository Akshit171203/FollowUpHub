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
  type PaginationMeta,
} from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function load(page = currentPage) {
    try {
      setLoading(true);
      
      const countPromise = getUnreadCount();
      let listPromise;
      
      if (tab === "unread") {
        listPromise = getUnreadNotifications(); // Unread endpoint doesn't support pagination yet
      } else {
        listPromise = getAllNotifications({ page, limit: 10 });
      }

      const [count, listResult] = await Promise.all([countPromise, listPromise]);
      setUnreadCount(count);

      if (tab === "all") {
        // Handle paginated response
        const result = listResult as { notifications: Notification[], pagination?: PaginationMeta };
        setItems(Array.isArray(result.notifications) ? result.notifications : []);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        // Handle array response (legacy)
        setItems(Array.isArray(listResult) ? listResult : []);
        // Reset pagination for unread tab since it's not paginated or handled differently
        setPagination({ page: 1, limit: 10, total: (listResult as Notification[]).length, totalPages: 1 });
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Request failed");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Reset to page 1 when tab changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      load(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => {
    load(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const list = useMemo(() => items, [items]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

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
            {tab === "all" && !loading && items.length > 0 && pagination.total > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-4">
          <Button variant="outline" onClick={() => load(currentPage)} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

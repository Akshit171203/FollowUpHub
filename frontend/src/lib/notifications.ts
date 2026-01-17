// src/lib/notifications.ts
import { apiFetch } from "@/lib/api";

export type Notification = {
  id: string;
  userId: string;
  title?: string | null;
  message?: string | null;
  type?: string | null;
  isRead?: boolean | null;
  createdAt?: string | null;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ListResp = { 
  notifications: Notification[];
  pagination?: PaginationMeta;
};
type CountResp = { count: number } | { unread: number } | number;

export async function getAllNotifications(params?: {
  page?: number;
  limit?: number;
}): Promise<{ notifications: Notification[]; pagination?: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/notifications${queryString ? `?${queryString}` : ""}`;

  const res = await apiFetch<ListResp>(url, {
    method: "GET",
  });
  
  if (Array.isArray(res)) {
    return { notifications: res };
  }
  
  return {
    notifications: Array.isArray(res?.notifications) ? res.notifications : [],
    pagination: res?.pagination
  };
}

export async function getUnreadNotifications(): Promise<Notification[]> {
  const res = await apiFetch<ListResp | Notification[]>(
    "/api/notifications",
    { method: "GET" }
  );
  if (Array.isArray(res)) return res;
  return Array.isArray(res?.notifications) ? res.notifications : [];
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiFetch<CountResp>("/api/notifications/unread-count", {
    method: "GET",
  });

  if (typeof res === "number") return res;
  if (typeof (res as any)?.count === "number") return (res as any).count;
  if (typeof (res as any)?.unread === "number") return (res as any).unread;
  return 0;
}

export async function markNotificationRead(id: string) {
  return apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllRead() {
  return apiFetch(`/api/notifications/read-all`, { method: "PATCH" });
}

// If your backend has PATCH /api/notifications/mark-read (bulk)
export async function markNotificationsAsRead(ids: string[]) {
  return apiFetch(`/api/notifications/mark-read`, {
    method: "PATCH",
    body: JSON.stringify({ ids }),
  });
}

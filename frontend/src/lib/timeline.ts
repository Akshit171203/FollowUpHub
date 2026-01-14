// src/lib/timeline.ts
import { apiFetch } from "@/lib/api";

export type TimelineEvent = {
  id: string;
  userId: string;
  type?: string | null;
  message?: string | null;
  createdAt?: string | null;
  meta?: any;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Resp = { 
  events: TimelineEvent[];
  pagination?: PaginationMeta;
};

export async function getEventTimeline(params?: {
  page?: number;
  limit?: number;
}): Promise<{ events: TimelineEvent[]; pagination?: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/events/timeline${queryString ? `?${queryString}` : ""}`;

  const res = await apiFetch<Resp>(url, { method: "GET" });
  
  if (Array.isArray(res)) {
    return { events: res };
  }
  
  return {
    events: Array.isArray((res as any)?.events) ? (res as any).events : [],
    pagination: res?.pagination
  };
}

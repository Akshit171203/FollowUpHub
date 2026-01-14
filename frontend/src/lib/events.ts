// src/lib/events.ts
import { apiFetch } from "@/lib/api";
import { getAllFollowUps, type FollowUp } from "@/lib/followups";

export type FollowUpEvent = {
  id: string;
  followupId?: string | null;
  type?: string | null;
  message?: string | null;
  createdAt?: string | null;
  meta?: any;
};

// backend might return: { events: [...] } OR [...]
type EventsResp = { events: FollowUpEvent[] } | FollowUpEvent[];

export async function getFollowUpEvents(followupId: string): Promise<FollowUpEvent[]> {
  const res = await apiFetch<EventsResp>(`/api/followups/${followupId}/events`, {
    method: "GET",
  });

  if (Array.isArray(res)) return res;
  return Array.isArray((res as any)?.events) ? (res as any).events : [];
}

/**
 * "Global timeline" = fetch all followups, then fetch events for each followup.
 * MVP approach without changing backend.
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type TimelineResp = { 
  events: FollowUpEvent[]; 
  pagination?: PaginationMeta;
};

/**
 * Global timeline using efficient backend endpoint
 */
export async function getEventTimeline(params?: {
  page?: number;
  limit?: number;
}): Promise<{ events: FollowUpEvent[]; pagination?: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/events/timeline${queryString ? `?${queryString}` : ""}`;

  const res = await apiFetch<TimelineResp>(url, { method: "GET" });
  
  // Handle older array response if fallback needed, though we updated backend
  if (Array.isArray(res)) {
    return { events: res };
  }
  
  return {
    events: Array.isArray((res as any)?.events) ? (res as any).events : [],
    pagination: res?.pagination
  };
}

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

type Resp = { events: TimelineEvent[] } | TimelineEvent[];

export async function getEventTimeline(): Promise<TimelineEvent[]> {
  const res = await apiFetch<Resp>("/api/events/timeline", { method: "GET" });
  if (Array.isArray(res)) return res;
  return Array.isArray((res as any)?.events) ? (res as any).events : [];
}

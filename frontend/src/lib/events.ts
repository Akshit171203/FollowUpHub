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
export async function getEventTimeline(): Promise<FollowUpEvent[]> {
  const followups = await getAllFollowUps();

  const list: FollowUp[] = Array.isArray(followups) ? followups : [];

  const all = await Promise.all(
    list
      .filter((f) => !!f?.id)
      .map(async (f) => {
        try {
          const evs = await getFollowUpEvents(f.id);
          // ensure followupId is present even if backend doesn't include it
          return evs.map((e) => ({ ...e, followupId: e.followupId ?? f.id }));
        } catch {
          return [];
        }
      })
  );

  const flat = all.flat();

  flat.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  return flat;
}

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getEventTimeline, type FollowUpEvent } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function TimelinePage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<FollowUpEvent[]>([]);

  async function load() {
    try {
      setLoading(true);
      const data = await getEventTimeline();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load timeline");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Event Timeline</h1>
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : events.length === 0 ? (
              <div className="text-sm text-muted-foreground">No events.</div>
            ) : (
              <div className="divide-y rounded-md border">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium">{ev.type ?? "EVENT"}</div>
                      <div className="text-xs text-muted-foreground">
                        • {fmt(ev.createdAt)}
                      </div>
                      {ev.followupId ? (
                        <div className="text-xs text-muted-foreground">
                          • FollowUp: {ev.followupId}
                        </div>
                      ) : null}
                    </div>

                    {ev.message ? (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {ev.message}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

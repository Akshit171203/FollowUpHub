"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

import { getEventTimeline, type FollowUpEvent, type PaginationMeta } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function TimelinePage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<FollowUpEvent[]>([]);
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
      const data = await getEventTimeline({ page, limit: 10 });
      setEvents(Array.isArray(data.events) ? data.events : []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load timeline");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // Track loaded page to prevent duplicate fetch in Strict Mode
  const loadedPage = useRef(0);

  useEffect(() => {
    // Only fetch if we haven't already fetched this page
    if (loadedPage.current === currentPage) return;
    
    loadedPage.current = currentPage;
    load(currentPage);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Event Timeline</h1>
          <Button variant="outline" onClick={() => load(currentPage)} disabled={loading}>
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
            {pagination.total > 0 && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                disabled={loading}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

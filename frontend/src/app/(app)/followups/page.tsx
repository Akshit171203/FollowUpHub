"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  getAllFollowUps,
  markDone,
  snoozeFollowUp,
  type FollowUp,
} from "@/lib/followups";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function FollowUpsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FollowUp[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    try {
      setLoading(true);
      const list = await getAllFollowUps(); // <-- now returns FollowUp[]
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to fetch follow-ups");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((x) => {
      const title = (x.title ?? "").toLowerCase();
      const notes = (x.notes ?? "").toLowerCase();
      const target = (x.target ?? "").toLowerCase();
      return title.includes(term) || notes.includes(term) || target.includes(term);
    });
  }, [items, q]);

  async function onDone(id: string) {
    try {
      await markDone(id);
      toast.success("Marked as done");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to mark done");
    }
  }

  async function onSnooze(id: string) {
    try {
      await snoozeFollowUp(id, 10);
      toast.success("Snoozed for 10 minutes");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to snooze");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Follow-ups</h1>
            <p className="text-sm text-muted-foreground">
              Create, snooze, mark done.
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/templates">Templates</Link>
            </Button>
            <Button asChild>
              <Link href="/followups/new">Create FollowUp</Link>
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Input
            placeholder="Search follow-ups…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No follow-ups found.
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {filtered.map((f) => (
                  <div
                    key={f.id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{f.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Due: {fmt(f.dueAt)} • Status: {f.status ?? "—"}
                      </div>

                      {(f.target || f.notes) ? (
                        <div className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {f.target ? `Target: ${f.target}` : ""}
                          {f.target && f.notes ? " • " : ""}
                          {f.notes ? `Notes: ${f.notes}` : ""}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Button asChild variant="outline">
                        <Link href={`/followups/${f.id}`}>Open</Link>
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => onDone(f.id)}
                        disabled={f.status === "DONE"}
                      >
                        Done
                      </Button>
                      {f.status !== "DONE" && (
                        <Button variant="outline" onClick={() => onSnooze(f.id)}>
                          Snooze 10m
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline">
            <Link href="/timeline">Event Timeline</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/notifications">Notifications</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/templates">Templates</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

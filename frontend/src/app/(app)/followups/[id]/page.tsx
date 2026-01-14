"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  getFollowUp,
  markDone,
  cancelFollowUp,
  deleteFollowUp,
  snoozeFollowUp,
  type FollowUp,
} from "@/lib/followups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function FollowUpDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<FollowUp | null>(null);

  async function load() {
    try {
      setLoading(true);
      if (!id) {
        setItem(null);
        return;
      }
      const res = await getFollowUp(id);
      setItem(res ?? null);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load follow-up");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onDone() {
    if (!id) return;
    try {
      await markDone(id);
      toast.success("Marked as done");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to mark done");
    }
  }

  async function onSnooze() {
    if (!id) return;
    try {
      await snoozeFollowUp(id, 10);
      toast.success("Snoozed for 10 minutes");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to snooze");
    }
  }


  async function onCancel() {
    if (!id) return;
    if (!confirm("Are you sure you want to cancel this follow-up?")) return;
    try {
      await cancelFollowUp(id);
      toast.success("Follow-up cancelled");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to cancel");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this follow-up? This cannot be undone.")) return;
    try {
      await deleteFollowUp(id);
      toast.success("Follow-up deleted");
      router.push("/followups");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Follow-up</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Follow-up</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : !item ? (
              <div className="text-sm text-muted-foreground">Not found</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Title</div>
                  <div className="font-medium">{item.title ?? "—"}</div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Due</div>
                    <div>{fmt(item.dueAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>{item.status ?? "—"}</div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-sm text-muted-foreground">Target</div>
                    <div className="break-words">{item.target ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                    <div className="break-words">{item.notes ?? "—"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button 
                    variant="secondary" 
                    onClick={onDone}
                    disabled={item.status === "DONE" || item.status === "CANCELLED"}
                  >
                    Mark done
                  </Button>
                  
                  {item.status !== "DONE" && item.status !== "CANCELLED" && (
                    <>
                      <Button variant="outline" onClick={onSnooze}>
                        Snooze 10m
                      </Button>
                      <Button variant="outline" onClick={onCancel} className="text-red-500 hover:text-red-600">
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  <Button variant="destructive" onClick={onDelete}>
                    Delete
                  </Button>

                  <Button asChild variant="outline">
                    <Link href="/followups">Back to list</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

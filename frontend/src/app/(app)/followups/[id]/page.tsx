"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import {
  getFollowUp,
  markDone,
  cancelFollowUp,
  deleteFollowUp,
  snoozeFollowUp,
  updateFollowUp,
  type FollowUp,
} from "@/lib/followups";
import { isValidId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      title: "",
      target: "",
      notes: "",
      dueAt: "", // string for input value
  });

  // Early validation for invalid IDs
  if (!isValidId(id)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Follow-up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This follow-up ID is invalid or doesn't exist.
            </p>
            <Button asChild>
              <Link href="/followups">Back to Follow-ups</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  function startEditing() {
      if (!item) return;
      setEditForm({
          title: item.title,
          target: item.target || "",
          notes: item.notes || "",
          dueAt: item.dueAt ? new Date(item.dueAt).toISOString().slice(0, 16) : "",
      });
      setIsEditing(true);
  }

  async function saveEdit() {
      if (!id) return;
      try {
          // Convert dueAt back to ISO if present
          const updates = {
              title: editForm.title,
              target: editForm.target,
              notes: editForm.notes,
              dueAt: editForm.dueAt ? new Date(editForm.dueAt).toISOString() : null,
          };
          
          await updateFollowUp(id, updates);
          toast.success("Follow-up updated");
          setIsEditing(false);
          load();
      } catch (e: any) {
          toast.error(e?.message ?? "Failed to update");
      }
  }

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
            <CardTitle className="text-base flex items-center justify-between">
                <span>Details</span>
                {!isEditing && item && item.status !== "DONE" && item.status !== "CANCELLED" && (
                    <Button variant="ghost" size="sm" onClick={startEditing}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-5 w-56" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Skeleton className="h-4 w-10 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-14 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Skeleton className="h-4 w-14 mb-2" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-12 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            ) : !item ? (
              <div className="text-sm text-muted-foreground">Not found</div>
            ) : isEditing ? (
              /* EDIT MODE */
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label>Title</Label>
                      <Input 
                          value={editForm.title} 
                          onChange={e => setEditForm({...editForm, title: e.target.value})} 
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Target</Label>
                      <Input 
                          value={editForm.target} 
                          onChange={e => setEditForm({...editForm, target: e.target.value})} 
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input 
                          value={editForm.notes} 
                          onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                      />
                  </div>
                  <div className="space-y-2">
                      <Label>Due At</Label>
                      <Input 
                          type="datetime-local"
                          value={editForm.dueAt} 
                          onChange={e => setEditForm({...editForm, dueAt: e.target.value})} 
                      />
                  </div>
                  <div className="flex gap-2 pt-2">
                      <Button onClick={saveEdit}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
              </div>
            ) : (
              /* VIEW MODE */
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

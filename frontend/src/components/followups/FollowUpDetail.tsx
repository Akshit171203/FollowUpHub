"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { format } from "date-fns";

import {
  getFollowUp,
  markDone,
  cancelFollowUp,
  deleteFollowUp,
  snoozeFollowUp,
  updateFollowUp,
  type FollowUp,
} from "@/lib/followups";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

interface FollowUpDetailProps {
  id: string;
  onClose?: () => void; // Optional callback to close dialog/navigate back
  onUpdate?: () => void; // Callback when data changes (to refresh list)
}

export function FollowUpDetail({ id, onClose, onUpdate }: FollowUpDetailProps) {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<FollowUp | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
      title: "",
      target: "",
      notes: "",
      dueAt: "", 
  });

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
          onUpdate?.();
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
      onUpdate?.();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to mark done");
    }
  }

  async function onSnooze() {
    if (!id) return;
    try {
      await snoozeFollowUp(id, 10); // 10 minutes snooze default for detail view button
      toast.success("Snoozed for 10 minutes");
      load();
      onUpdate?.();
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
      onUpdate?.();
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
      onUpdate?.();
      onClose?.(); 
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete");
    }
  }

  if (loading) {
      return <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  if (!item) {
      return <div className="p-8 text-center text-sm text-muted-foreground">Follow-up not found</div>;
  }

  return (
    <div className="w-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl flex items-center justify-between pr-8">
            <span>Details</span>
            {!isEditing && item.status !== "DONE" && item.status !== "CANCELLED" && (
                <Button variant="ghost" size="sm" onClick={startEditing}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                </Button>
            )}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {isEditing ? (
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
              <div className="font-medium text-lg">{item.title ?? "—"}</div>
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

            <div className="flex flex-wrap gap-2 pt-4 border-t mt-4">
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
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}

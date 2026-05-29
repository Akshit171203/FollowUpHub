"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Calendar, Target, AlignLeft, CheckCircle2, Clock, X, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

function StatusBadge({ status }: { status: string }) {
  const getStyles = () => {
    switch (status) {
      case "DONE":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "PENDING":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "ESCALATED":
        return "bg-red-50 text-red-600 border-red-200";
      case "CANCELLED":
        return "bg-zinc-100 text-zinc-500 border-zinc-200";
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200";
    }
  };

  return (
    <span className={cn("px-2.5 py-1 rounded-md text-[12px] font-semibold border uppercase tracking-wide", getStyles())}>
      {status}
    </span>
  );
}

interface FollowUpDetailProps {
  id: string;
  onClose?: () => void;
  onUpdate?: () => void;
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
      await snoozeFollowUp(id, 10);
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
      return (
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-zinc-900 animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Loading details...</p>
        </div>
      );
  }

  if (!item) {
      return <div className="p-8 text-center text-sm font-medium text-zinc-500">Follow-up not found</div>;
  }

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight leading-tight">
            Follow-up Details
          </h2>
          <p className="text-sm font-medium text-zinc-500">View and manage this follow-up</p>
        </div>
        {!isEditing && item.status !== "DONE" && item.status !== "CANCELLED" && (
            <Button variant="outline" size="sm" onClick={startEditing} className="h-8 rounded-lg shadow-sm border-zinc-200 hover:bg-zinc-50">
                <Pencil className="w-3.5 h-3.5 mr-2" />
                <span className="font-semibold text-[13px]">Edit</span>
            </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          /* EDIT MODE */
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</Label>
                  <Input 
                      value={editForm.title} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                      className="bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Target</Label>
                  <Input 
                      value={editForm.target} 
                      onChange={e => setEditForm({...editForm, target: e.target.value})} 
                      className="bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notes</Label>
                  <Input 
                      value={editForm.notes} 
                      onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                      className="bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                  />
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Due At</Label>
                  <Input 
                      type="datetime-local"
                      value={editForm.dueAt} 
                      onChange={e => setEditForm({...editForm, dueAt: e.target.value})} 
                      className="bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
                  />
              </div>
              <div className="flex items-center gap-3 pt-4">
                  <Button onClick={saveEdit} className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-sm px-6 font-semibold">
                    Save Changes
                  </Button>
                  <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl font-medium text-zinc-500 hover:text-zinc-900">
                    Cancel
                  </Button>
              </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Title</h3>
              <p className="text-[17px] font-bold text-zinc-900 leading-snug">{item.title ?? "—"}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-zinc-50/80 border border-zinc-100">
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" /> Due Date
                </span>
                <span className="text-[14px] font-semibold text-zinc-900">{fmt(item.dueAt)}</span>
              </div>
              <div className="flex flex-col gap-1.5 items-start">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Status</span>
                <StatusBadge status={item.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <Target className="w-3.5 h-3.5" /> Target
                </span>
                <span className="text-[14px] font-medium text-zinc-800 break-words leading-relaxed bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100/50 min-h-[44px]">
                  {item.target || <span className="text-zinc-400 italic">No target specified</span>}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  <AlignLeft className="w-3.5 h-3.5" /> Notes
                </span>
                <span className="text-[14px] font-medium text-zinc-800 break-words leading-relaxed bg-zinc-50/50 p-2.5 rounded-lg border border-zinc-100/50 min-h-[44px]">
                  {item.notes || <span className="text-zinc-400 italic">No additional notes</span>}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-6 mt-2 border-t border-zinc-100">
              <Button 
                onClick={onDone}
                disabled={item.status === "DONE" || item.status === "CANCELLED"}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 rounded-xl font-semibold gap-2 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Done
              </Button>
              
              {item.status !== "DONE" && item.status !== "CANCELLED" && (
                <>
                  <Button variant="outline" onClick={onSnooze} className="rounded-xl shadow-sm border-zinc-200 hover:bg-zinc-50 font-semibold gap-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    Snooze 10m
                  </Button>
                  <Button variant="outline" onClick={onCancel} className="rounded-xl shadow-sm border-zinc-200 hover:bg-red-50 text-red-600 hover:text-red-700 hover:border-red-200 font-semibold gap-2 transition-colors ml-auto">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              )}
              
              <Button variant="ghost" onClick={onDelete} className="rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors gap-2 ml-auto p-2" title="Delete forever">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

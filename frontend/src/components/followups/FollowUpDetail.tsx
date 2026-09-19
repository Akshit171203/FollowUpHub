"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil, Calendar, Target, AlignLeft, CheckCircle2, Clock, Trash2, Sparkles, Copy } from "lucide-react";
import { format } from "date-fns";

import {
  getFollowUp,
  markDone,
  deleteFollowUp,
  snoozeFollowUp,
  updateFollowUp,
  generateDraft,
  type FollowUp,
} from "@/lib/followups";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
      title: "",
      target: "",
      notes: "",
      dueAt: "",
  });

  // AI Draft State
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftText, setDraftText] = useState("");

  async function load() {
    try {
      setLoading(true);
      if (!id) {
        setItem(null);
        return;
      }
      const res = await getFollowUp(id);
      setItem(res ?? null);
      setDraftText(res?.aiDraft || "");
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to load follow-up");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const socket = getSocket();

    function onChunk(payload: { followupId: string; chunk: string }) {
      if (payload.followupId !== id) return;
      setDraftText((prev) => prev + payload.chunk);
    }

    function onDone(payload: { followupId: string; draft: string }) {
      if (payload.followupId !== id) return;
      setDraftText(payload.draft);
      setDraftLoading(false);
    }

    socket.on("ai:draft:chunk", onChunk);
    socket.on("ai:draft:done", onDone);
    return () => {
      socket.off("ai:draft:chunk", onChunk);
      socket.off("ai:draft:done", onDone);
    };
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
      } catch (e: unknown) {
          toast.error((e as Error)?.message ?? "Failed to update");
      }
  }

  async function onDone() {
    if (!id) return;
    try {
      await markDone(id);
      toast.success("Marked as done", {
        action: { label: "View", onClick: () => router.push(`/followups?id=${id}`) }
      });
      load();
      onUpdate?.();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to mark done");
    }
  }

  async function onSnooze() {
    if (!id) return;
    try {
      await snoozeFollowUp(id, 10);
      toast.success("Snoozed for 10 minutes", {
        action: { label: "View", onClick: () => router.push(`/followups?id=${id}`) }
      });
      load();
      onUpdate?.();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to snooze");
    }
  }

  async function onGenerateDraft() {
    if (!id) return;
    try {
      setDraftLoading(true);
      setDraftText(""); // streamed in live via ai:draft:chunk socket events
      const updated = await generateDraft(id);
      setItem(updated);
      setDraftText(updated.aiDraft || ""); // fallback if socket events were missed
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to generate draft");
    } finally {
      setDraftLoading(false);
    }
  }

  async function onCopyDraft() {
    if (!draftText) return;
    try {
      await navigator.clipboard.writeText(draftText);
      toast.success("Draft copied to clipboard");
    } catch {
      toast.error("Failed to copy draft");
    }
  }

  async function onDelete() {
    if (!id) return;
    try {
      await deleteFollowUp(id);
      toast.success("Follow-up deleted");
      onUpdate?.();
      onClose?.(); 
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to delete");
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
      {!showDeleteConfirm && (
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Follow-up Details
            </h2>
          </div>
          {!isEditing && item.status !== "DONE" && item.status !== "CANCELLED" && (
              <button onClick={startEditing} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors group" title="Edit details">
                  <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
          )}
        </div>
      )}

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
          <>
            {showDeleteConfirm ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in zoom-in-95 fade-in duration-200">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 mb-2 tracking-tight">Delete this follow-up?</h2>
                <p className="text-[15px] text-zinc-500 max-w-sm mb-8 leading-relaxed">
                  This action cannot be undone. This will permanently delete the follow-up and remove it from our servers.
                </p>
                <div className="flex items-center gap-3 w-full justify-center">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="h-11 rounded-xl font-bold px-8 bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600 transition-colors shadow-sm">
                    Cancel
                  </Button>
                  <Button onClick={onDelete} className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md shadow-red-600/20 font-bold px-8 transition-all">
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                
                {/* Title & Core Metadata */}
                <div className="flex flex-col gap-4">
                  <h1 className="text-[26px] font-extrabold text-zinc-900 tracking-tight leading-tight">
                    {item.title ?? "Untitled Follow-up"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                     <StatusBadge status={item.status || "PENDING"} />
                     {item.dueAt && (
                       <span className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-600 bg-white shadow-sm px-3 py-1.5 rounded-full border border-zinc-200/80">
                         <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                         {fmt(item.dueAt)}
                       </span>
                     )}
                  </div>
                </div>

                {/* Crisp App-Native Metadata Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2 p-5 rounded-[20px] bg-zinc-50/80 border border-zinc-200/80 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      <Target className="w-3.5 h-3.5" /> Target
                    </span>
                    <span className="text-[15px] font-semibold text-zinc-900 mt-0.5 truncate">
                      {item.target || <span className="text-zinc-400 italic font-medium">None specified</span>}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2 p-5 rounded-[20px] bg-zinc-50/80 border border-zinc-200/80 shadow-sm transition-all hover:bg-zinc-50 hover:border-zinc-300">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                      <AlignLeft className="w-3.5 h-3.5" /> Notes
                    </span>
                    <span className="text-[14px] font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap mt-0.5">
                      {item.notes || <span className="text-zinc-400 italic font-medium">No notes added</span>}
                    </span>
                  </div>
                </div>

                {/* Crisp AI Draft Box */}
                <div className="relative flex flex-col gap-4 p-6 rounded-[20px] bg-violet-50/40 border border-violet-100 shadow-sm mt-4">
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 text-violet-600 border border-violet-200/50 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-zinc-900 tracking-tight leading-none">AI Assistant</h3>
                        <p className="text-[13px] font-medium text-zinc-500 mt-1">Draft a perfect follow-up</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={onGenerateDraft}
                      disabled={draftLoading}
                      className="h-9 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold text-[13px] shadow-sm transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                      {draftLoading ? "Drafting..." : draftText ? "Regenerate" : "Generate Draft"}
                    </Button>
                  </div>

                  <div className="relative z-10">
                  {draftLoading && !draftText ? (
                    <div className="space-y-2.5 py-3">
                      <div className="h-2.5 rounded-full bg-violet-200/50 w-full animate-pulse" />
                      <div className="h-2.5 rounded-full bg-violet-200/50 w-5/6 animate-pulse delay-75" />
                      <div className="h-2.5 rounded-full bg-violet-200/50 w-2/3 animate-pulse delay-150" />
                    </div>
                  ) : draftText ? (
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
                      <Textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        rows={4}
                        className="bg-white border-violet-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-[14px] font-medium leading-relaxed resize-none rounded-xl p-4 text-zinc-800 placeholder:text-zinc-400 shadow-sm transition-all min-h-[120px]"
                      />
                      <div className="absolute bottom-3 right-3">
                        <Button
                          size="sm"
                          onClick={onCopyDraft}
                          className="rounded-lg bg-white hover:bg-zinc-50 text-violet-700 font-semibold gap-1.5 text-xs h-8 px-3 shadow-sm border border-violet-200 transition-all active:scale-95"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  </div>
                </div>

                
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Sticky Action Footer */}
      {!loading && item && !isEditing && !showDeleteConfirm && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onDone}
              disabled={item.status === "DONE" || item.status === "CANCELLED"}
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-sm font-bold gap-1.5 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Done
            </Button>
            
            {item.status !== "DONE" && item.status !== "CANCELLED" && (
                <Button size="sm" variant="outline" onClick={onSnooze} className="rounded-xl shadow-sm border-zinc-200 hover:bg-zinc-50 font-bold gap-1.5 bg-white">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Snooze 10m
                </Button>
            )}
          </div>
          
          <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors bg-transparent border-transparent" title="Delete forever">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

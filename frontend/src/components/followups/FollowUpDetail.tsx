"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil, Calendar, Target, AlignLeft, CheckCircle2, Clock, Trash2, Sparkles, Copy, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
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
        return "bg-zinc-900 text-white border-zinc-800";
      case "PENDING":
        return "bg-white text-zinc-900 border-zinc-200/80 shadow-sm";
      case "ESCALATED":
        return "bg-red-50 text-red-600 border-red-200";
      case "CANCELLED":
        return "bg-white/50 text-zinc-500 border-zinc-200/50";
      default:
        return "bg-white text-zinc-600 border-zinc-200 shadow-sm";
    }
  };

  return (
    <span className={cn("px-3 py-1.5 rounded-full text-[11px] font-bold border uppercase tracking-widest flex items-center shrink-0", getStyles())}>
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
        <div className="min-h-[500px] flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-200 border-t-blue-600 animate-spin" />
          <p className="text-sm font-medium text-zinc-500">Loading details...</p>
        </div>
      );
  }

  if (!item) {
      return <div className="min-h-[500px] flex items-center justify-center text-sm font-medium text-zinc-500">Follow-up not found</div>;
  }

  return (
    <div className="w-full flex flex-col md:flex-row font-sans min-h-[500px] max-h-[90vh]">
      
      {/* LEFT COLUMN: Metadata & Edit */}
      <div className="w-full md:w-[380px] shrink-0 bg-[#F5F7FA] relative overflow-y-auto overflow-x-hidden flex flex-col border-r border-zinc-100">
        
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-32 right-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-8 md:p-10">
          
          <div className="flex items-center justify-between mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200/60 text-zinc-600 text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              Detail View
            </div>
            {!isEditing && item.status !== "DONE" && item.status !== "CANCELLED" && (
                <button 
                  onClick={startEditing} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 hover:bg-white border border-zinc-200/60 text-zinc-600 hover:text-zinc-900 transition-all font-semibold text-xs shadow-sm backdrop-blur-sm" 
                  title="Edit details"
                >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                </button>
            )}
          </div>

          {isEditing ? (
            /* EDIT MODE */
            <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300 flex-1 flex flex-col">
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Title</Label>
                    <Input 
                        value={editForm.title} 
                        onChange={e => setEditForm({...editForm, title: e.target.value})}
                        className="h-11 rounded-[12px] bg-white hover:bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-semibold text-zinc-900 px-4 outline-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Target</Label>
                    <Input 
                        value={editForm.target} 
                        onChange={e => setEditForm({...editForm, target: e.target.value})} 
                        className="h-11 rounded-[12px] bg-white hover:bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-semibold text-zinc-900 px-4 outline-none"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Due At</Label>
                    <Input 
                        type="datetime-local"
                        value={editForm.dueAt} 
                        onChange={e => setEditForm({...editForm, dueAt: e.target.value})} 
                        className="h-11 rounded-[12px] bg-white hover:bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-semibold text-zinc-900 px-4 outline-none w-full appearance-none"
                    />
                </div>
                <div className="space-y-1.5 flex-1 flex flex-col">
                    <Label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider ml-1">Notes</Label>
                    <Textarea 
                        value={editForm.notes} 
                        onChange={e => setEditForm({...editForm, notes: e.target.value})} 
                        className="flex-1 resize-none min-h-[120px] rounded-[12px] bg-white hover:bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium text-zinc-900 p-4 outline-none"
                    />
                </div>
                <div className="flex items-center justify-end gap-3 pt-6 shrink-0 border-t border-zinc-200/50">
                    <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-11 px-4 rounded-[12px] font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors bg-white shadow-sm border border-zinc-200/50">
                      Cancel
                    </Button>
                    <Button onClick={saveEdit} className="h-11 px-5 bg-zinc-900 hover:bg-black text-white rounded-[12px] shadow-md font-bold transition-all active:scale-[0.98]">
                      Save Changes
                    </Button>
                </div>
            </div>
          ) : (
            /* VIEW MODE METADATA */
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-2 duration-300">
              
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-[1.15] mb-4">
                  {item.title ?? "Untitled Follow-up"}
                </h1>
                <div className="flex flex-wrap items-center gap-2.5">
                   <StatusBadge status={item.status || "PENDING"} />
                   {item.dueAt && (
                     <span className="flex items-center gap-2 text-[12px] font-bold text-zinc-600 bg-white shadow-sm px-3.5 py-1.5 rounded-full border border-zinc-200/80">
                       <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                       {fmt(item.dueAt)}
                     </span>
                   )}
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                <div className="flex flex-col gap-2 p-5 rounded-[20px] bg-white/60 border border-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <Target className="w-3.5 h-3.5" /> Target Assignee
                  </span>
                  <span className="text-[15px] font-bold text-zinc-800 truncate">
                    {item.target || <span className="text-zinc-400 italic font-medium">Unassigned</span>}
                  </span>
                </div>
                
                <div className="flex flex-col gap-2 p-5 rounded-[20px] bg-white/60 border border-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-md flex-1">
                  <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <AlignLeft className="w-3.5 h-3.5" /> Notes & Context
                  </span>
                  <span className="text-[14px] font-medium text-zinc-700 leading-relaxed whitespace-pre-wrap mt-1">
                    {item.notes || <span className="text-zinc-400 italic font-medium">No notes provided for this follow-up.</span>}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI & Actions */}
      <div className="flex-1 bg-white relative flex flex-col">
         
         <div className="flex-1 p-8 md:p-10 overflow-y-auto">
            {showDeleteConfirm ? (
                <div className="flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-300 h-full">
                  <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 ring-[12px] ring-red-50/50 shadow-inner">
                    <Trash2 className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">Delete this follow-up?</h2>
                  <p className="text-[15px] text-zinc-500 max-w-xs mx-auto mb-10 leading-relaxed font-medium">
                    This action cannot be undone. This will permanently delete the follow-up.
                  </p>
                  <div className="flex flex-col gap-3 w-full max-w-[240px] mx-auto">
                    <Button onClick={onDelete} className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-[12px] shadow-md shadow-red-600/20 font-bold w-full transition-all active:scale-[0.98]">
                      Delete Forever
                    </Button>
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="h-11 rounded-[12px] font-bold w-full bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600 transition-colors shadow-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
            ) : (
                /* AI DRAFTING ASSISTANT */
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)]">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[18px] font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                          Drafting Assistant
                        </h3>
                        <p className="text-[13px] font-medium text-blue-600/70 mt-1">AI-powered smart replies</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative flex-1 flex flex-col group min-h-[250px]">
                      {draftLoading && !draftText ? (
                        <div className="absolute inset-0 rounded-[20px] border border-blue-100 bg-[#F5F7FA] p-6 space-y-4">
                          <div className="h-3.5 rounded-full bg-blue-200/50 w-full animate-pulse" />
                          <div className="h-3.5 rounded-full bg-blue-200/50 w-5/6 animate-pulse delay-75" />
                          <div className="h-3.5 rounded-full bg-blue-200/50 w-2/3 animate-pulse delay-150" />
                        </div>
                      ) : (
                        <>
                          <Textarea
                            value={draftText}
                            onChange={(e) => setDraftText(e.target.value)}
                            placeholder="Hit Generate Draft to let AI write a follow-up message based on your notes..."
                            className="flex-1 w-full bg-[#F9FAFB] hover:bg-[#F5F7FA] border border-zinc-200/80 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 text-[15px] font-medium leading-relaxed resize-none rounded-[20px] p-6 text-zinc-800 placeholder:text-zinc-400 shadow-inner transition-all outline-none"
                          />
                          {draftText && (
                            <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                size="sm"
                                onClick={onCopyDraft}
                                className="rounded-[10px] bg-zinc-900 hover:bg-black text-white font-bold gap-2 text-[11px] h-9 px-4 shadow-md transition-all active:scale-95"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Copy text
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                      <Button
                        onClick={onGenerateDraft}
                        disabled={draftLoading}
                        className="h-11 px-6 rounded-[12px] bg-zinc-900 hover:bg-black border border-zinc-800 text-white font-bold text-[13px] shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                      >
                        {draftLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Drafting...
                          </>
                        ) : (
                          <>
                            {draftText ? "Regenerate Draft" : "Generate AI Draft"}
                            <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
                          </>
                        )}
                      </Button>
                  </div>
                </div>
            )}
         </div>

         {/* ACTION FOOTER */}
         {!loading && item && !isEditing && !showDeleteConfirm && (
           <div className="p-6 bg-white border-t border-zinc-100 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-3">
               <Button
                 onClick={onDone}
                 disabled={item.status === "DONE" || item.status === "CANCELLED"}
                 className="h-11 bg-zinc-900 hover:bg-black text-white rounded-[12px] shadow-md font-bold px-6 gap-2 disabled:opacity-30 disabled:bg-zinc-900 transition-all active:scale-[0.98]"
               >
                 <CheckCircle2 className="w-4 h-4" />
                 Mark as Done
               </Button>
               
               {item.status !== "DONE" && item.status !== "CANCELLED" && (
                   <Button variant="outline" onClick={onSnooze} className="h-11 rounded-[12px] shadow-sm border-zinc-200 hover:bg-zinc-50 font-bold px-5 gap-2 bg-white text-zinc-700 transition-all active:scale-[0.98]">
                     <Clock className="w-4 h-4 text-zinc-400" />
                     Snooze 10m
                   </Button>
               )}
             </div>
             
             <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="w-11 h-11 rounded-[12px] flex items-center justify-center text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors bg-white border border-zinc-200/50 shadow-sm" title="Delete forever">
               <Trash2 className="w-4 h-4" />
             </Button>
           </div>
         )}

      </div>

    </div>
  );
}

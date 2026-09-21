"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Wand2, Loader2, MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  extractFollowUpFromText,
  createFollowUp,
  type ExtractedFollowUp,
} from "@/lib/followups";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AiQuickCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const EMPTY_FORM = { title: "", target: "", notes: "", dueAt: "", priority: "MEDIUM" };

const SUGGESTIONS = [
  "Follow up with Sarah about the Q3 design specs on Friday",
  "Check invoice status with Acme Corp next Monday at 10am",
  "Ask David for the onboarding docs tomorrow afternoon"
];

export function AiQuickCreateDialog({ open, onOpenChange, onCreated }: AiQuickCreateDialogProps) {
  const [text, setText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<typeof EMPTY_FORM | null>(null);

  function reset() {
    setText("");
    setForm(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  async function onExtract() {
    if (!text.trim()) return;
    try {
      setExtracting(true);
      const extracted: ExtractedFollowUp = await extractFollowUpFromText(text);
      setForm({
        title: extracted.title || "",
        target: extracted.target || "",
        notes: extracted.notes || "",
        dueAt: extracted.dueAt ? new Date(extracted.dueAt).toISOString().slice(0, 16) : "",
        priority: extracted.priority || "MEDIUM",
      });
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to extract follow-up");
    } finally {
      setExtracting(false);
    }
  }

  async function onCreate() {
    if (!form || !form.title.trim() || !form.dueAt) {
      toast.error("Title and due date are required");
      return;
    }
    try {
      setCreating(true);
      await createFollowUp({
        title: form.title,
        target: form.target || null,
        notes: form.notes || null,
        dueAt: new Date(form.dueAt).toISOString(),
        priority: form.priority,
      });
      toast.success("Follow-up created successfully");
      handleOpenChange(false);
      onCreated();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to create follow-up");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[950px] p-0 overflow-hidden border border-zinc-200/50 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.15)] rounded-[20px] bg-white sm:rounded-[20px]">
        <DialogTitle className="sr-only">AI Quick Add</DialogTitle>
        
        <div className="flex flex-col md:flex-row h-full min-h-[500px] max-h-[90vh]">
          
          {/* Left Panel - App Theme (Indigo/Blue/Emerald) */}
          <div className="w-full md:w-[380px] bg-[#F5F7FA] relative overflow-y-auto overflow-x-hidden flex flex-col p-8 md:p-10 shrink-0 border-r border-zinc-100">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-200/40 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-200/30 rounded-full blur-[80px] pointer-events-none" />

            {/* Back Button */}
            <button 
              onClick={() => handleOpenChange(false)}
              className="relative z-10 w-9 h-9 bg-white/60 hover:bg-white border border-zinc-200/60 shadow-sm transition-all rounded-full flex items-center justify-center text-zinc-600 mb-8 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-zinc-200/60 text-zinc-600 text-[10px] font-bold uppercase tracking-widest mb-5 shadow-sm">
                <Sparkles className="w-3 h-3 text-blue-500" />
                {form ? "Review Details" : "Drafting Assistant"}
              </div>

              <h2 className="text-[28px] font-extrabold text-zinc-900 leading-[1.15] tracking-tight mb-4">
                {form ? "Confirm your task" : (
                  <>
                    Magic Quick <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500">Create</span>
                  </>
                )}
              </h2>
              
              <p className="text-[14px] text-zinc-500 font-medium leading-relaxed mb-8 pr-4">
                {form 
                  ? "We've parsed your request into structured fields. Please review and adjust anything if needed."
                  : "Type your thoughts naturally. We'll automatically extract the assignee, due dates, and context."
                }
              </p>
            </div>

            {/* Premium Glass Cards Graphic */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto mb-auto mt-2 z-10">
               {/* Back card */}
               <div className="absolute top-0 left-4 right-8 bottom-12 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transform -rotate-6 transition-transform hover:-rotate-3 duration-500" />
               
               {/* Front card */}
               <div className="absolute top-8 left-8 right-0 bottom-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-5 flex flex-col gap-4 transform rotate-2 transition-transform hover:rotate-0 duration-500">
                 <div className="flex items-center justify-between">
                   <div className="w-10 h-3 bg-zinc-200/80 rounded-full" />
                   <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                     F
                   </div>
                 </div>
                 <div className="space-y-2 mt-1">
                   <div className="w-full h-2 bg-zinc-100 rounded-full" />
                   <div className="w-4/5 h-2 bg-zinc-100 rounded-full" />
                   <div className="w-2/3 h-2 bg-zinc-100 rounded-full" />
                 </div>
                 <div className="mt-auto flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                     <Sparkles className="w-2.5 h-2.5 text-indigo-600" />
                   </div>
                   <div className="w-16 h-2 bg-zinc-100 rounded-full" />
                 </div>
               </div>
            </div>

            {/* Pro Tip Box - Sleek Glass */}
            <div className="relative z-10 mt-6 bg-white/50 backdrop-blur-xl rounded-[12px] p-4 border border-white shadow-sm">
               <h4 className="flex items-center gap-2 text-[12px] font-bold text-zinc-900 mb-1.5 uppercase tracking-wide">
                 <span className="w-2 h-2 rounded-full bg-blue-500" />
                 Pro tip
               </h4>
               <p className="text-[12px] text-zinc-500 font-medium leading-relaxed">
                 {form 
                   ? "You can set up to 3 escalation targets in settings."
                   : "Try terms like 'next Friday' or 'tomorrow at 3pm'."
                 }
               </p>
            </div>
          </div>

          {/* Right Panel - Form Area */}
          <div className="flex-1 bg-white p-8 relative flex flex-col">
            <AnimatePresence mode="wait">
              {!form ? (
                <motion.div 
                  key="extract"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col h-full"
                >
                  <div className="flex-1 flex flex-col">
                    <Label className="text-[14px] font-bold text-zinc-900 mb-2.5 block">
                      What do you need to follow up on? <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={5}
                        maxLength={2000}
                        placeholder="e.g. Check on pending invoice payment with John Doe by next Wednesday..."
                        className="bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 text-[14px] leading-relaxed resize-none rounded-[12px] p-4 transition-all text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm outline-none w-full"
                        autoFocus
                      />
                    </div>

                    {/* Enhanced Suggestions */}
                    <div className="mt-6 flex flex-col gap-2.5">
                      <Label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
                        Try a prompt:
                      </Label>
                      {SUGGESTIONS.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => setText(suggestion)}
                          className="text-left w-full bg-white border border-zinc-100 hover:border-blue-200 hover:shadow-sm hover:bg-blue-50/30 transition-all p-3 rounded-[12px] flex items-center gap-3 group"
                        >
                          <div className="w-7 h-7 rounded-full bg-zinc-50 group-hover:bg-blue-100 flex items-center justify-center shrink-0 transition-colors">
                            <MessageSquareText className="w-3.5 h-3.5 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <span className="text-[13px] text-zinc-600 font-medium truncate flex-1 group-hover:text-zinc-900 transition-colors">
                            "{suggestion}"
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-5 border-t border-zinc-100 flex justify-end gap-3 shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenChange(false)}
                      className="h-11 px-5 rounded-[12px] font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={onExtract}
                      disabled={extracting || !text.trim()}
                      className="h-11 px-6 rounded-[12px] bg-zinc-900 hover:bg-black text-white font-bold shadow-sm transition-all active:scale-[0.98] disabled:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {extracting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Generate Task
                          <Sparkles className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col h-full"
                >
                  <div className="space-y-5 flex-1">
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-zinc-900 ml-1">
                        Title <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={form.title} 
                        onChange={(e) => setForm({ ...form, title: e.target.value })} 
                        className="h-11 rounded-[12px] bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-semibold text-zinc-900 px-4 outline-none"
                        placeholder="e.g. Check on pending invoice payment"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-zinc-900 ml-1">Assignee</Label>
                        <Input 
                          value={form.target} 
                          onChange={(e) => setForm({ ...form, target: e.target.value })} 
                          className="h-11 rounded-[12px] bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-semibold text-zinc-900 px-4 outline-none"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[13px] font-bold text-zinc-900 ml-1">Due Date</Label>
                        <div className="relative">
                          <Input
                            type="datetime-local"
                            value={form.dueAt}
                            onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                            className="h-11 rounded-[12px] bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-semibold text-zinc-900 px-4 outline-none w-full appearance-none"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[13px] font-bold text-zinc-900 ml-1">Notes & Context</Label>
                      <Textarea 
                        value={form.notes} 
                        onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                        rows={4} 
                        className="resize-none rounded-[12px] bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all font-medium text-zinc-900 px-4 py-3 outline-none"
                        placeholder="Add any relevant details, links, or context..."
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-zinc-100 flex justify-end gap-3 shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => setForm(null)}
                      className="h-11 px-5 rounded-[12px] font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={onCreate}
                      disabled={creating}
                      className="h-11 px-6 rounded-[12px] bg-zinc-900 hover:bg-black text-white font-bold shadow-sm transition-all active:scale-[0.98] disabled:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Create Follow-up"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, Check } from "lucide-react";

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
      <DialogContent className="max-w-xl p-0 overflow-hidden border-zinc-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-[24px] bg-white sm:rounded-[24px]">
        <DialogTitle className="sr-only">AI Quick Add</DialogTitle>
        
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500"></div>

        <div className="px-8 py-8 z-10">
          {!form ? (
            <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-[14px] bg-violet-50 border border-violet-100 text-violet-600 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-zinc-900 tracking-tight">Magic Quick Create</h2>
                  <p className="text-[14px] font-medium text-zinc-500 mt-0.5">
                    Type naturally. The AI will do the heavy lifting.
                  </p>
                </div>
              </div>

              <div className="relative group mt-1">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="e.g., Remind me to follow up with Jane about the Q3 report next Friday..."
                  className="bg-zinc-50/80 border-zinc-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 text-[15px] leading-relaxed resize-none rounded-[16px] p-5 transition-all text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm"
                  autoFocus
                />
              </div>
              
              <Button
                onClick={onExtract}
                disabled={extracting || !text.trim()}
                className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm transition-all active:scale-[0.98] mt-2"
              >
                {extracting ? "Analyzing magic..." : "Generate Magic Task"}
                {!extracting && <Sparkles className="w-4 h-4 ml-2 opacity-80" />}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-400">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-[22px] font-bold text-zinc-900 tracking-tight">Review Task</h2>
                  <p className="text-[14px] font-medium text-zinc-500 mt-0.5">Verify the extracted details.</p>
                </div>
                <button
                  onClick={() => setForm(null)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>

              <div className="grid gap-5">
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Title</Label>
                  <Input 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    className="h-11 rounded-xl bg-zinc-50/80 border-zinc-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all font-semibold text-zinc-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Target Person</Label>
                    <Input 
                      value={form.target} 
                      onChange={(e) => setForm({ ...form, target: e.target.value })} 
                      className="h-11 rounded-xl bg-zinc-50/80 border-zinc-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all font-semibold text-zinc-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Due Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={form.dueAt}
                      onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                      className="h-11 rounded-xl bg-zinc-50/80 border-zinc-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all font-semibold text-zinc-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-bold text-zinc-500 uppercase tracking-wider">Notes</Label>
                  <Textarea 
                    value={form.notes} 
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} 
                    rows={2} 
                    className="resize-none rounded-xl bg-zinc-50/80 border-zinc-200 focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 shadow-sm transition-all font-medium text-zinc-900"
                  />
                </div>
              </div>

              <Button
                onClick={onCreate}
                disabled={creating}
                className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-sm transition-all active:scale-[0.98] mt-2"
              >
                {creating ? "Creating Task..." : "Confirm & Create"}
                {!creating && <Check className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

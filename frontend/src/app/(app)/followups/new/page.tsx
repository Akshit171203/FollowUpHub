"use client";

import { Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, LayoutTemplate, Calendar, CheckCircle2 } from "lucide-react";

import { createFollowUp } from "@/lib/followups";
import { getTemplate } from "@/lib/templates";

export default function CreateFollowUpPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center p-8">Loading...</div>}>
      <CreateFollowUpContent />
    </Suspense>
  );
}

function CreateFollowUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState(""); 
  const [submitting, setSubmitting] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState<string | null>(null);

  const loadedTemplateId = useRef<string | null>(null);

  useEffect(() => {
    if (templateId && loadedTemplateId.current !== templateId) {
      const loadTemplate = async () => {
        try {
          setLoadingTemplate(true);
          loadedTemplateId.current = templateId;
          
          const template = await getTemplate(templateId);
          setTemplateName(template.name);
          
          setTitle(template.title || "");
          setTarget(template.target || "");
          setNotes(template.notes || "");
          
          if (template.defaultDueOffsetMinutes) {
            const dueDate = new Date(Date.now() + template.defaultDueOffsetMinutes * 60 * 1000);
            const formatted = dueDate.toISOString().slice(0, 16);
            setDueAt(formatted);
          }
          
          toast.success(`Template applied`);
        } catch (err: any) {
          toast.error(err.message || "Failed to load template");
          loadedTemplateId.current = null;
        } finally {
          setLoadingTemplate(false);
        }
      };
      
      loadTemplate();
    }
  }, [templateId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSubmitting(true);
      await createFollowUp({
        title: title.trim(),
        target: target.trim() || null,
        notes: notes.trim() || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      toast.success("Follow-up created successfully");
      router.push("/followups");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create follow-up");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] flex items-start justify-center p-4 md:p-8 pt-8 md:pt-16 font-sans relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-violet-100/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-fuchsia-100/30 blur-3xl" />
      </div>

      <div className="max-w-[1200px] w-full flex flex-col md:flex-row bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 overflow-hidden relative z-10">
        
        {/* Left Side: Context / Branding */}
        <div
          className="md:w-[35%] p-10 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #A5B4FC 0%, #C4B5FD 35%, #E9D5FF 70%, #F5D0FE 100%)",
          }}
        >
          <div className="relative z-10">
            <button 
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors mb-12" style={{ color: "rgba(0,0,0,0.6)" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug mb-4">
              {templateId ? "Start from Template" : "Create New Follow-up"}
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "rgba(0,0,0,0.55)" }}>
              Define the details of your follow-up to ensure nothing slips through the cracks. We'll track it for you.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative z-10 mt-10 mb-4 flex items-center justify-center">
            <div className="w-52 h-36 relative">
              {/* Main card — perfectly upright */}
              <div className="absolute inset-0 bg-white/30 backdrop-blur-md border border-white/50 rounded-2xl shadow-xl flex items-center justify-center p-4">
                <div className="w-full h-full bg-white rounded-xl shadow-sm border border-white/60 flex flex-col overflow-hidden">
                  <div className="h-4 border-b border-zinc-100 flex items-center px-2 gap-1 bg-zinc-50/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-2">
                    <div className="h-2.5 w-1/2 bg-violet-100 rounded-full"></div>
                    <div className="h-2.5 w-3/4 bg-violet-100 rounded-full"></div>
                    <div className="h-2.5 w-2/3 bg-violet-100 rounded-full"></div>
                  </div>
                </div>
              </div>
              {/* Overlapping badge card — perfectly upright */}
              <div className="absolute -top-4 -right-4 w-24 h-28 bg-white rounded-xl shadow-2xl border border-zinc-100 z-20 flex flex-col p-2.5 gap-1.5">
                <div className="flex justify-end mb-0.5">
                  <div className="w-7 h-7 rounded-md bg-violet-500 flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-[12px]">F</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5 mt-0.5">
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full"></div>
                  <div className="h-1.5 w-3/4 bg-zinc-100 rounded-full"></div>
                  <div className="h-1.5 w-5/6 bg-zinc-100 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            {loadingTemplate ? (
               <div className="flex items-center gap-3 bg-white/35 border border-white/50 p-4 rounded-2xl" style={{ color: "rgba(0,0,0,0.6)" }}>
                 <div className="w-5 h-5 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                 <span className="text-[14px] font-medium">Loading template...</span>
               </div>
            ) : templateId && templateName ? (
              <div className="bg-white/35 backdrop-blur-md border border-white/50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center" style={{ color: "rgba(0,0,0,0.6)" }}>
                    <LayoutTemplate className="w-4 h-4" />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "rgba(0,0,0,0.5)" }}>Template Applied</span>
                </div>
                <p className="font-semibold text-[15px]" style={{ color: "rgba(0,0,0,0.75)" }}>{templateName}</p>
                <div className="flex items-center gap-2 mt-4 text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                   <CheckCircle2 className="w-4 h-4" />
                   <span>Pre-filled successfully</span>
                </div>
              </div>
            ) : (
              <div className="bg-white/35 border border-white/50 rounded-2xl p-5 flex flex-col gap-4">
                 <div className="flex items-center gap-3" style={{ color: "rgba(0,0,0,0.7)" }}>
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[14px] font-semibold">Pro tip</span>
                 </div>
                 <p className="text-[13px] leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>
                   Use templates from the Templates page to automatically pre-fill these details and save time on recurring follow-ups.
                 </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[65%] p-10 md:p-12">
          <form onSubmit={onSubmit} className="flex flex-col h-full">
            <div className="space-y-6 flex-1">
              
              {/* Title Field */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Check on pending invoice payment"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Target Field */}
                 <div className="space-y-2">
                   <label className="text-[13px] font-semibold text-zinc-900 px-1">
                     Target
                   </label>
                   <input 
                     type="text"
                     placeholder="e.g. John Doe, Client X"
                     value={target} 
                     onChange={(e) => setTarget(e.target.value)} 
                     className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                   />
                 </div>

                 {/* Due Date Field */}
                 <div className="space-y-2">
                   <label className="text-[13px] font-semibold text-zinc-900 px-1">
                     Due Date
                   </label>
                   <div className="relative">
                     <input 
                       type="datetime-local"
                       value={dueAt} 
                       onChange={(e) => setDueAt(e.target.value)} 
                       className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl pl-10 pr-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none min-h-[48px]"
                     />
                     <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                   </div>
                 </div>
              </div>

              {/* Notes Field */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Notes & Context
                </label>
                <textarea 
                  rows={4}
                  placeholder="Add any relevant details, links, or context..."
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none resize-none"
                />
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex items-center justify-end gap-4">
              <button 
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3.5 rounded-xl text-[14px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl px-8 py-3.5 text-[15px] font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                   <>
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Creating...</span>
                   </>
                ) : (
                   "Create Follow-up"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

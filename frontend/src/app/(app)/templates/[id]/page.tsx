"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTemplate, updateTemplate, deleteTemplate, Priority, ReminderPolicy } from "@/lib/templates";
import { toast } from "sonner";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [notes, setNotes] = useState("");
  const [defaultPriority, setDefaultPriority] = useState<Priority>("MEDIUM");
  const [defaultDueOffsetMinutes, setDefaultDueOffsetMinutes] = useState<number | string>(1440);
  const [defaultReminderPolicy, setDefaultReminderPolicy] = useState<ReminderPolicy>("NORMAL");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id || id === "undefined") {
        toast.error("Invalid template ID");
        router.push("/templates");
        return;
      }

      try {
        setLoading(true);
        const template = await getTemplate(id);
        setName(template.name);
        setTitle(template.title);
        setTarget(template.target || "");
        setNotes(template.notes || "");
        setDefaultPriority(template.defaultPriority || "MEDIUM");
        setDefaultDueOffsetMinutes(template.defaultDueOffsetMinutes || 1440);
        setDefaultReminderPolicy(template.defaultReminderPolicy || "NORMAL");
      } catch (err: any) {
        toast.error(err.message || "Failed to load template");
        router.push("/templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) {
      toast.error("Name and Title are required");
      return;
    }

    try {
      setSubmitting(true);
      await updateTemplate(id, {
        name: name.trim(),
        title: title.trim(),
        target: target.trim() || undefined,
        notes: notes.trim() || undefined,
        defaultPriority,
        defaultDueOffsetMinutes: defaultDueOffsetMinutes ? Number(defaultDueOffsetMinutes) : 1440,
        defaultReminderPolicy,
      });
      toast.success("Template updated");
      router.push("/templates");
    } catch (err: any) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
      router.push("/templates");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFA] flex items-start justify-center p-4 md:p-8 pt-8 md:pt-16 font-sans relative overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-violet-100/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-fuchsia-100/30 blur-3xl" />
      </div>

      <div className="max-w-[1000px] w-full flex flex-col md:flex-row bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200/60 overflow-hidden relative z-10">

        {/* Left Side: Branding */}
        <div
          className="md:w-[40%] p-10 flex flex-col justify-between relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #A5B4FC 0%, #C4B5FD 35%, #E9D5FF 70%, #F5D0FE 100%)",
          }}
        >
          <div className="relative z-10">
            <button
              onClick={() => router.push("/templates")}
              className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-white/70 transition-colors mb-12" style={{ color: "rgba(0,0,0,0.6)" }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-snug mb-4">
              Edit Follow-up Template
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "rgba(0,0,0,0.55)" }}>
              Update the details of this template. Changes will apply the next time it's used to create a follow-up.
            </p>
          </div>

          {/* Illustration */}
          <div className="relative z-10 mt-10 mb-4 flex items-center justify-center">
            <div className="w-52 h-36 relative">
              {/* Main card */}
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
              {/* Overlapping badge card */}
              <div className="absolute -top-4 -right-4 w-24 h-28 bg-white rounded-xl shadow-2xl border border-zinc-100 z-20 flex flex-col p-2.5 gap-1.5">
                <div className="flex justify-end mb-0.5">
                  <div className="w-7 h-7 rounded-md bg-violet-500 flex items-center justify-center shadow-sm">
                    <FileText className="w-3.5 h-3.5 text-white" />
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

          {/* Delete button */}
          <div className="relative z-10">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/35 border border-white/50 text-[13px] font-semibold hover:bg-white/50 transition-colors" style={{ color: "rgba(0,0,0,0.6)" }}
            >
              <Trash2 className="w-4 h-4" />
              Delete Template
            </button>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[60%] p-10 md:p-12">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="space-y-6 flex-1">

              {/* Name */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Job Application Follow-up"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check application status"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                />
              </div>

              {/* Target */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Target
                </label>
                <input
                  type="text"
                  placeholder="e.g. HR Recruiter"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Priority */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-900 px-1">
                    Default Priority
                  </label>
                  <select
                    value={defaultPriority}
                    onChange={(e) => setDefaultPriority(e.target.value as Priority)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 transition-all outline-none appearance-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                {/* Default Due Offset */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-zinc-900 px-1">
                    Due Offset (Minutes)
                  </label>
                  <input
                    type="number"
                    value={defaultDueOffsetMinutes}
                    onChange={(e) => setDefaultDueOffsetMinutes(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Default Reminder Policy */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-zinc-900 px-1">
                  Default Reminder Policy
                </label>
                <select
                  value={defaultReminderPolicy}
                  onChange={(e) => setDefaultReminderPolicy(e.target.value as ReminderPolicy)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-[15px] text-zinc-900 transition-all outline-none appearance-none"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="AGGRESSIVE">AGGRESSIVE</option>
                  <option value="PASSIVE">PASSIVE</option>
                  <option value="NONE">NONE</option>
                </select>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.push("/templates")}
                className="px-6 py-3.5 rounded-xl text-[14px] font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-300 text-white rounded-xl py-3.5 text-[15px] font-semibold transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

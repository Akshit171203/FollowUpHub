"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { createFollowUp } from "@/lib/followups";
import { getTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateFollowUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState(""); // datetime-local
  const [submitting, setSubmitting] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // Ref to track if we've already tried to load this template ID to prevent strict mode double-fetch
  const loadedTemplateId = useRef<string | null>(null);

  useEffect(() => {
    if (templateId && loadedTemplateId.current !== templateId) {
      const loadTemplate = async () => {
        try {
          setLoadingTemplate(true);
          // Mark as loaded immediately to prevent race conditions
          loadedTemplateId.current = templateId;
          
          const template = await getTemplate(templateId);
          
          // Pre-fill form with template data
          setTitle(template.title || "");
          setTarget(template.target || "");
          setNotes(template.notes || "");
          
          // Calculate due date from defaultDueOffsetMinutes
          if (template.defaultDueOffsetMinutes) {
            const dueDate = new Date(Date.now() + template.defaultDueOffsetMinutes * 60 * 1000);
            // Format for datetime-local input
            const formatted = dueDate.toISOString().slice(0, 16);
            setDueAt(formatted);
          }
          
          toast.success(`Template "${template.name}" applied`);
        } catch (err: any) {
          toast.error(err.message || "Failed to load template");
          // Reset ref on error to allow retry if needed
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
      toast.success("Follow-up created");
      router.push("/followups");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create follow-up");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create FollowUp</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        {loadingTemplate ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading template...</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Due at</Label>
                  <Input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                  />
                </div>

                <Button className="w-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

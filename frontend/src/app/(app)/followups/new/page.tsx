"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createFollowUp } from "@/lib/followups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateFollowUpPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [notes, setNotes] = useState("");
  const [dueAt, setDueAt] = useState(""); // datetime-local
  const [submitting, setSubmitting] = useState(false);

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
      </div>
    </div>
  );
}

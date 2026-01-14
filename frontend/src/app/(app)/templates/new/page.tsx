"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateTemplatePage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSubmitting(true);
      await createTemplate({ name: name.trim(), content: content.trim() || null });
      toast.success("Template created");
      router.push("/templates");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create template</h1>
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
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <Input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Template text…"
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

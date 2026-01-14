"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  applyTemplate,
  deleteTemplate,
  getTemplate,
  patchTemplate,
  type Template,
} from "@/lib/templates";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Template | null>(null);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  async function load() {
    try {
      setLoading(true);
      if (!id) {
        setItem(null);
        return;
      }
      const res = await getTemplate(id);
      setItem(res ?? null);
      setName(res?.name ?? "");
      setContent(res?.content ?? "");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load template");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onSave() {
    if (!id) return;
    try {
      await patchTemplate(id, { name: name.trim(), content: content.trim() });
      toast.success("Template updated");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update template");
    }
  }

  async function onApply() {
    if (!id) return;
    try {
      await applyTemplate(id);
      toast.success("Template applied");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to apply template");
    }
  }

  async function onDelete() {
    if (!id) return;
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
      router.push("/templates");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete template");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Template</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Template</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : !item ? (
              <div className="text-sm text-muted-foreground">Not found</div>
            ) : (
              <div className="space-y-4">
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

                <div className="flex flex-wrap gap-2">
                  <Button onClick={onSave}>Save</Button>
                  <Button variant="outline" onClick={onApply}>
                    Apply
                  </Button>
                  <Button variant="destructive" onClick={onDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

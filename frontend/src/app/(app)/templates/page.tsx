"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getTemplates, type Template } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Template[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    try {
      setLoading(true);
      const list = await getTemplates();
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to fetch templates");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((t) => (t.name ?? "").toLowerCase().includes(term));
  }, [items, q]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Templates</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage templates.
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/followups">Back to Follow-ups</Link>
            </Button>
            <Button asChild>
              <Link href="/templates/new">Create template</Link>
            </Button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Input
            placeholder="Search templates…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">All templates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">No templates.</div>
            ) : (
              <div className="divide-y rounded-md border">
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{t.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        {t.content ?? "—"}
                      </div>
                    </div>

                    <Button asChild variant="outline">
                      <Link href={`/templates/${t.id}`}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

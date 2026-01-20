"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTemplate, updateTemplate, deleteTemplate, Priority, ReminderPolicy } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
      // Validate ID before fetching
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
        router.push("/templates"); // Redirect on failure
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, router]); // Changed from params.id to id

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
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Edit Follow-up Template</h1>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="priority">Default Priority</Label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value as Priority)}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>

            <div>
              <Label htmlFor="defaultDueOffset">Default Due Offset (Minutes)</Label>
              <Input
                id="defaultDueOffset"
                type="number"
                value={defaultDueOffsetMinutes}
                onChange={(e) => setDefaultDueOffsetMinutes(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="reminderPolicy">Default Reminder Policy</Label>
              <select
                id="reminderPolicy"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={defaultReminderPolicy}
                onChange={(e) => setDefaultReminderPolicy(e.target.value as ReminderPolicy)}
              >
                <option value="NORMAL">NORMAL</option>
                <option value="AGGRESSIVE">AGGRESSIVE</option>
                <option value="PASSIVE">PASSIVE</option>
                <option value="NONE">NONE</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/templates")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

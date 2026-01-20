"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmailTemplate, EmailTemplateType } from "@/lib/emailTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<EmailTemplateType>("REMINDER");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSubmitting(true);
      await createEmailTemplate({
        name: name.trim(),
        type,
        subject: subject.trim(),
        bodyHtml: bodyHtml.trim(),
      });
      toast.success("Email template created");
      router.push("/email-templates");
    } catch (err: any) {
      toast.error(err.message || "Failed to create email template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Create Email Template</h1>

      <Card>
        <CardHeader>
          <CardTitle>Email Template Details</CardTitle>
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
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={type}
                onChange={(e) => setType(e.target.value as EmailTemplateType)}
              >
                <option value="REMINDER">REMINDER</option>
                <option value="ESCALATION">ESCALATION</option>
                <option value="DIGEST">DIGEST</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bodyHtml">Body HTML</Label>
              <textarea
                id="bodyHtml"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
              />
            </div>

            {bodyHtml && (
              <div>
                <Label>Preview</Label>
                <div
                  className="mt-2 rounded-md border border-input p-4 bg-white text-black"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/email-templates")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getEmailTemplates, deleteEmailTemplate, EmailTemplate } from "@/lib/emailTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmailTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (err: any) {
      setError(err.message || "Failed to load email templates");
      toast.error(err.message || "Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    const filtered = templates.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [search, templates]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this email template?")) return;
    try {
      await deleteEmailTemplate(id);
      toast.success("Email template deleted");
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <Button onClick={() => router.push("/email-templates/new")}>
          Create Email Template
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Search email templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" onClick={fetchTemplates}>
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48 mb-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No email templates found.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filteredTemplates.length > 0 && (
        <div className="space-y-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">{template.name}</CardTitle>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Type: <Badge variant="outline">{template.type}</Badge>
                      </p>
                      <p>Subject: {template.subject}</p>
                      <p>Updated: {new Date(template.updatedAt!).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/email-templates/${template.id}`)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(template.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

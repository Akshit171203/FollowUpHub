// src/lib/templates.ts
import { apiFetch } from "@/lib/api";

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type ReminderPolicy = "NORMAL" | "AGGRESSIVE" | "PASSIVE" | "NONE";

export type Template = {
  id: string;
  userId: string;
  name: string;
  title: string;
  target?: string | null;
  notes?: string | null;
  defaultDueOffsetMinutes?: number | null;
  defaultPriority?: Priority | null;
  defaultReminderPolicy?: ReminderPolicy | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTemplateInput = {
  name: string;
  title: string;
  target?: string;
  notes?: string;
  defaultDueOffsetMinutes?: number;
  defaultPriority?: Priority;
  defaultReminderPolicy?: ReminderPolicy;
};

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export async function getTemplates(): Promise<Template[]> {
  const res = await apiFetch<any>("/api/templates", { method: "GET" });
  
  if (Array.isArray(res)) {
    return res;
  }
  if (res?.templates && Array.isArray(res.templates)) {
    return res.templates;
  }
  return [];
}

export async function getTemplate(id: string): Promise<Template> {
  const res = await apiFetch<any>(`/api/templates/${id}`, { method: "GET" });
  
  if (res?.template) {
    return res.template;
  }
  return res;
}

export async function createTemplate(input: CreateTemplateInput): Promise<Template> {
  const res = await apiFetch<any>("/api/templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
  
  if (res?.template) {
    return res.template;
  }
  return res;
}

export async function updateTemplate(id: string, input: UpdateTemplateInput): Promise<Template> {
  const res = await apiFetch<any>(`/api/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  
  if (res?.template) {
    return res.template;
  }
  return res;
}

export async function deleteTemplate(id: string): Promise<void> {
  await apiFetch(`/api/templates/${id}`, { method: "DELETE" });
}

export async function applyTemplate(id: string): Promise<any> {
  const res = await apiFetch<any>(`/api/templates/${id}/apply`, { method: "POST" });
  
  if (res?.followup) {
    return res.followup;
  }
  return res;
}

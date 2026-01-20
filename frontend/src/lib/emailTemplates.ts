// src/lib/emailTemplates.ts
import { apiFetch } from "@/lib/api";

export type EmailTemplateType = "REMINDER" | "ESCALATION" | "DIGEST";

export type EmailTemplate = {
  id: string;
  userId: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  bodyHtml: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateEmailTemplateInput = {
  name: string;
  type: EmailTemplateType;
  subject: string;
  bodyHtml: string;
};

export type UpdateEmailTemplateInput = Partial<CreateEmailTemplateInput>;

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const res = await apiFetch<any>("/api/email-templates", { method: "GET" });
  
  if (Array.isArray(res)) {
    return res;
  }
  if (res?.emailTemplates && Array.isArray(res.emailTemplates)) {
    return res.emailTemplates;
  }
  if (res?.templates && Array.isArray(res.templates)) {
    return res.templates;
  }
  return [];
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate> {
  const res = await apiFetch<any>(`/api/email-templates/${id}`, { method: "GET" });
  
  if (res?.emailTemplate) {
    return res.emailTemplate;
  }
  if (res?.template) {
    return res.template;
  }
  return res;
}

export async function createEmailTemplate(input: CreateEmailTemplateInput): Promise<EmailTemplate> {
  const res = await apiFetch<any>("/api/email-templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
  
  if (res?.emailTemplate) {
    return res.emailTemplate;
  }
  if (res?.template) {
    return res.template;
  }
  return res;
}

export async function updateEmailTemplate(id: string, input: UpdateEmailTemplateInput): Promise<EmailTemplate> {
  const res = await apiFetch<any>(`/api/email-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  
  if (res?.emailTemplate) {
    return res.emailTemplate;
  }
  if (res?.template) {
    return res.template;
  }
  return res;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
  await apiFetch(`/api/email-templates/${id}`, { method: "DELETE" });
}

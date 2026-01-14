// src/lib/templates.ts
import { apiFetch } from "@/lib/api";

export type Template = {
  id: string;
  userId: string;
  name: string;
  content?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateTemplateInput = {
  name: string;
  content?: string | null;
};

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ListResp = { 
  templates: Template[];
  pagination?: PaginationMeta;
};

export async function getTemplates(params?: {
  page?: number;
  limit?: number;
}): Promise<{ templates: Template[]; pagination?: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/templates${queryString ? `?${queryString}` : ""}`;

  const res = await apiFetch<ListResp>(url, { method: "GET" });
  
  if (Array.isArray(res)) {
    return { templates: res };
  }
  
  return {
    templates: Array.isArray(res?.templates) ? res.templates : [],
    pagination: res?.pagination
  };
}

export async function getTemplate(id: string): Promise<Template | null> {
  if (!id) return null;
  return apiFetch<Template>(`/api/templates/${id}`, { method: "GET" });
}

export async function createTemplate(input: CreateTemplateInput) {
  return apiFetch(`/api/templates`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function patchTemplate(id: string, input: UpdateTemplateInput) {
  return apiFetch(`/api/templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteTemplate(id: string) {
  return apiFetch(`/api/templates/${id}`, { method: "DELETE" });
}

// If your backend uses GET /api/templates/:id/apply:
export async function applyTemplate(id: string) {
  return apiFetch(`/api/templates/${id}/apply`, { method: "GET" });
}

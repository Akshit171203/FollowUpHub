// src/lib/followups.ts
import { apiFetch } from "@/lib/api";
import { isValidId } from "@/lib/utils";

export type FollowUpStatus = "PENDING" | "DONE" | "SNOOZED" | "CANCELLED";
export type FollowUpPriority = "LOW" | "MEDIUM" | "HIGH";

export type FollowUp = {
  id: string;
  userId: string;
  title: string;
  target?: string | null;
  notes?: string | null;
  dueAt?: string | null;
  status?: FollowUpStatus | string | null;
  priority?: FollowUpPriority | string | null;
  reminderPolicy?: string | null;
  ignoreCount?: number | null;
  escalationLevel?: number | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  lastReminderSentAt?: string | null;
  aiDraft?: string | null;
  isAiGenerated?: boolean | null;
};

export type CreateFollowUpInput = {
  title: string;
  target?: string | null;
  notes?: string | null;
  dueAt?: string | null;
  priority?: FollowUpPriority | string;
};

export type UpdateFollowUpInput = Partial<CreateFollowUpInput> & {
  status?: FollowUpStatus | string;
  isActive?: boolean;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ListResp = { 
  followups: FollowUp[];
  pagination?: PaginationMeta;
};
type DetailResp = { followup: FollowUp };

export async function getAllFollowUps(params?: {
  page?: number;
  limit?: number;
}): Promise<{ followups: FollowUp[]; pagination?: PaginationMeta }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  
  const queryString = queryParams.toString();
  const url = `/api/followups${queryString ? `?${queryString}` : ""}`;

  const res = await apiFetch<ListResp>(url, {
    method: "GET",
  });

  if (Array.isArray(res)) {
    return { followups: res };
  }
  
  return {
    followups: Array.isArray(res?.followups) ? res.followups : [],
    pagination: res?.pagination
  };
}

export async function getFollowUp(id: string): Promise<FollowUp | null> {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }

  const res = await apiFetch<DetailResp | FollowUp>(`/api/followups/${id}`, {
    method: "GET",
  });

  // ✅ handle both shapes:
  // { followup: {...} } OR {...}
  if ((res as any)?.followup) return (res as any).followup as FollowUp;
  return res as FollowUp;
}

export async function createFollowUp(input: CreateFollowUpInput) {
  return apiFetch(`/api/followups`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateFollowUp(id: string, input: UpdateFollowUpInput) {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }
  
  return apiFetch(`/api/followups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function markDone(id: string) {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }
  
  return apiFetch(`/api/followups/${id}/done`, { method: "PATCH" });
}

export async function snoozeFollowUp(id: string, snoozeMinutes: number) {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }
  
  return apiFetch(`/api/followups/${id}/snooze`, {
    method: "PATCH",
    body: JSON.stringify({ snoozeMinutes }),
  });
}

export type ExtractedFollowUp = {
  title: string;
  target: string | null;
  notes: string | null;
  dueAt: string | null;
  priority: string;
};

export async function extractFollowUpFromText(text: string): Promise<ExtractedFollowUp> {
  const res = await apiFetch<{ followup: ExtractedFollowUp } | ExtractedFollowUp>(`/api/followups/extract`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });

  if ((res as any)?.followup) return (res as any).followup as ExtractedFollowUp;
  return res as ExtractedFollowUp;
}

export async function generateDraft(id: string): Promise<FollowUp> {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }

  const res = await apiFetch<DetailResp | FollowUp>(`/api/followups/${id}/generate-draft`, {
    method: "POST",
  });

  if ((res as any)?.followup) return (res as any).followup as FollowUp;
  return res as FollowUp;
}

export async function cancelFollowUp(id: string) {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }
  
  return apiFetch(`/api/followups/${id}/cancel`, { method: "PATCH" });
}

export async function deleteFollowUp(id: string) {
  if (!isValidId(id)) {
    throw new Error("Invalid follow-up ID");
  }
  
  return apiFetch(`/api/followups/${id}`, { method: "DELETE" });
}

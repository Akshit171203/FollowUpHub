import { apiFetch } from "./api";

export type JiraConnectPayload = {
  jiraEmail: string;
  jiraDomain: string;
  jiraApiToken: string;
  managerEmail: string;
};

export async function connectJira(data: JiraConnectPayload) {
  return apiFetch<{ message: string }>("/api/jira/connect", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function syncJira() {
  return apiFetch<{ message: string; count: number }>("/api/jira/sync", {
    method: "GET",
  });
}

export async function getJiraTickets(page = 1, limit = 20) {
  return apiFetch<{
    settings: {
      isConnected: boolean;
      jiraEmail: string;
      jiraDomain: string;
      managerEmail: string;
    };
    tickets: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/api/jira/tickets?page=${page}&limit=${limit}`, {
    method: "GET",
  });
}

export async function disconnectJira() {
  return apiFetch<{ message: string }>("/api/jira/disconnect", {
    method: "DELETE",
  });
}

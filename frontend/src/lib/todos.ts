import { apiFetch } from "@/lib/api";

export type TodoStatus = "PENDING" | "DONE";

export type Todo = {
  id: string;
  userId: string;
  title: string;
  notes?: string | null;
  status: TodoStatus;
  forDate: string; // ISO date string
  remindAt?: string | null; // ISO timestamp
  lastRemindedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTodoInput = {
  title: string;
  notes?: string;
  remindAt?: string; // ISO timestamp
  forDate?: string; // ISO date (YYYY-MM-DD)
};

export type UpdateTodoInput = {
  title?: string;
  notes?: string;
  status?: TodoStatus;
  remindAt?: string | null;
};

/**
 * List todos for a specific date
 */
export async function listTodos(date?: string): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (date) {
    params.append("date", date);
  }
  
  const url = `/api/todos${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await apiFetch<{ todos: Todo[] }>(url);
  
  return res.todos;
}

/**
 * Create a new todo
 */
export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const res = await apiFetch<{ todo: Todo }>("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  
  return res.todo;
}

/**
 * Update a todo
 */
export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  const res = await apiFetch<{ todo: Todo }>(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  
  return res.todo;
}

/**
 * Delete a todo
 */
export async function deleteTodo (id: string): Promise<void> {
  await apiFetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
}

/**
 * Promote todo to followup
 */
export async function promoteTodo(id: string): Promise<any> {
  const res = await apiFetch<{ followup: any }>(`/api/todos/${id}/promote`, {
    method: "POST",
  });
  
  return res.followup;
}

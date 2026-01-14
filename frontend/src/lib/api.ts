export type ApiErrorPayload = { message?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include", // IMPORTANT for httpOnly cookie auth
  });

  const data = (await res.json().catch(() => ({}))) as any;

  if (!res.ok) {
    const msg =
      (data as ApiErrorPayload)?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

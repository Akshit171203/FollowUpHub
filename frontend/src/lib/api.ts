export type ApiErrorPayload = { message?: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Check .env.local");
}

// Dedupe concurrent refresh attempts: if two requests 401 around the same
// time, they must share one refresh call, not each rotate the same refresh
// token independently — the backend treats a second, racing rotation of an
// already-superseded token as reuse and revokes the whole session.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/api/users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!res.ok) return null;

      const data = (await res.json()) as { token: string; refreshToken: string };
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return data.token;
    } catch {
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _isRetry = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach token from localStorage for Safari/mobile (cookie doesn't work cross-domain)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // Still send cookies as fallback for desktop Chrome
  });

  // A 401 here is an actual auth failure for these two, not a signal to
  // silently refresh and retry.
  const isAuthEndpoint =
    path.startsWith("/api/users/login") || path.startsWith("/api/users/refresh");

  if (res.status === 401 && !isAuthEndpoint && !_isRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, options, true);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  }

  const data = (await res.json().catch(() => ({}))) as any;

  if (!res.ok) {
    const msg =
      (data as ApiErrorPayload)?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

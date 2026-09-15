import { apiFetch } from "@/lib/api";

export type User = {
  id: number | string;
  name: string;
  email: string;
  role?: string | null;
};

export async function signup(payload: { name: string; email: string; password: string }) {
  return apiFetch<{ message: string }>("/api/users/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  const result = await apiFetch<{ message: string; token: string; refreshToken: string }>(
    "/api/users/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  storeTokens(result.token, result.refreshToken);
  return result;
}

export async function logout() {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

  const result = await apiFetch<{ message: string }>("/api/users/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  clearTokens();
  return result;
}

// Save both tokens to localStorage for Safari/mobile cross-domain support
export function storeTokens(token: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
}

// ✅ matches your backend GET /profile
export async function profile() {
  return apiFetch<{ message: string; user: User }>("/api/users/profile", {
    method: "GET",
  });
}

// ✅ matches your backend POST /forgot-password
export async function forgotPassword(email: string) {
  return apiFetch<{ message: string }>("/api/users/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ✅ matches your backend POST /reset-password
export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ message: string }>("/api/users/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

// ✅ matches your backend POST /resend-verification
export async function resendVerification(email: string) {
  return apiFetch<{ message: string }>("/api/users/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
// ✅ matches your backend GET /verify-email
export async function verifyEmail(token: string) {
  return apiFetch<{ message: string }>(`/api/users/verify-email?token=${token}`, {
    method: "GET",
  });
}

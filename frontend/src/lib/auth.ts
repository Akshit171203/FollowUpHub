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
  const result = await apiFetch<{ message: string; token: string }>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  // Save token to localStorage for Safari/mobile cross-domain support
  if (result.token && typeof window !== "undefined") {
    localStorage.setItem("token", result.token);
  }
  return result;
}

export async function logout() {
  const result = await apiFetch<{ message: string }>("/api/users/logout", {
    method: "POST",
  });
  // Clear token from localStorage
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
  return result;
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

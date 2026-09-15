"use client";

import { Suspense } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { storeTokens } from "@/lib/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    if (token && refreshToken) {
      // Save the OAuth tokens to localStorage
      storeTokens(token, refreshToken);
      // Redirect to dashboard
      router.replace("/dashboard");
    } else {
      // No token received, redirect to login with error
      router.replace("/login?error=oauth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
        <p className="mt-4 text-sm text-gray-600">Signing you in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-black border-r-transparent"></div>
            <p className="mt-4 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

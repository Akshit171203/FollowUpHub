"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("App section error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FAFAFA] p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">Something went wrong</h2>
        <p className="text-zinc-500 text-[15px] mb-6 leading-relaxed">
          This page encountered an error. You can try again or go back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-zinc-900 text-white text-[14px] font-semibold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2.5 bg-white text-zinc-700 text-[14px] font-semibold rounded-xl hover:bg-zinc-50 transition-colors border border-zinc-200 shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

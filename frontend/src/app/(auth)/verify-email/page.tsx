"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-lg mx-auto animate-pulse h-96" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || "", [sp]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing token. Please open the verification link from your email.");
      return;
    }

    (async () => {
      try {
        setStatus("loading");
        const res = await verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Email verified successfully!");
      } catch (e: any) {
        setStatus("error");
        setMessage(e?.message || "Verification failed.");
      }
    })();
  }, [token]);

  return (
    <div className="space-y-5 w-full max-w-lg mx-auto">
      <div className="text-center md:text-left leading-none select-none">
        <h1 className="text-[4rem] lg:text-[5.5rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85]">
          EMAIL
        </h1>
        <h1 className="text-[4rem] lg:text-[5.5rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85] text-right">
          VERIFY
        </h1>
      </div>

      <div className="pt-2">
         {status === "loading" && (
            <div className="bg-white rounded-2xl p-4 text-center border border-gray-200 shadow-sm">
              <p className="text-gray-500 animate-pulse font-medium">Verifying your email...</p>
            </div>
         )}
         {status === "success" && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
               <p className="text-green-800 font-bold text-lg text-center leading-tight">{message}</p>
            </div>
         )}
         {status === "error" && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
               <p className="text-red-600 font-bold text-lg text-center leading-tight">{message}</p>
            </div>
         )}
      </div>

      <div className="grid gap-3 pt-4">
        <Button asChild className="w-full h-12 rounded-md text-lg font-medium bg-[#1F1F1F] hover:bg-black text-white transition-all shadow-lg">
          <Link href="/login">Go to Login</Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-12 rounded-md text-lg font-medium border-gray-300 hover:bg-gray-50 text-black">
          <Link href="/signup">Back to Signup</Link>
        </Button>
      </div>
    </div>
  );
}

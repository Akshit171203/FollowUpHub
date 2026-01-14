"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && <p className="text-sm text-muted-foreground">Verifying your email…</p>}
          {status === "success" && <p className="text-sm">{message}</p>}
          {status === "error" && <p className="text-sm text-destructive">{message}</p>}

          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Back to Signup</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

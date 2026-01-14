"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const disabled = !email || loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setMsg(res.message || "If the account exists, we sent a reset link.");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {msg && <p className="text-sm">{msg}</p>}
          {err && <p className="text-sm text-destructive">{err}</p>}

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <Button className="w-full" disabled={disabled}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link className="underline" href="/login">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

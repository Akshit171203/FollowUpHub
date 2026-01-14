"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { resetPassword } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const token = useMemo(() => params.get("token") || "", [params]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const disabled = !token || !newPassword || newPassword.length < 6 || loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const res = await resetPassword(token, newPassword);
      setMsg(res?.message ?? "Password reset successful");
      setTimeout(() => router.push("/login"), 800);
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>

        <CardContent>
          {!token ? (
            <div className="space-y-3">
              <p className="text-sm text-red-600">
                Reset token missing. Please use the link from your email.
              </p>
              <Link className="underline text-sm" href="/forgot-password">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 6 characters.
                </p>
              </div>

              {msg ? <p className="text-sm text-green-600">{msg}</p> : null}
              {err ? <p className="text-sm text-red-600">{err}</p> : null}

              <Button className="w-full" disabled={disabled} type="submit">
                {loading ? "Resetting..." : "Reset password"}
              </Button>

              <p className="text-sm text-muted-foreground">
                Back to{" "}
                <Link className="underline" href="/login">
                  Login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

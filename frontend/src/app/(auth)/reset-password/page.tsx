"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { resetPassword } from "@/lib/auth";
import Image from "next/image";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useSearchParams();

  const token = useMemo(() => params.get("token") || "", [params]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="space-y-5 w-full max-w-lg mx-auto">
      <div className="text-center md:text-left leading-none select-none">
        <h1 className="text-[4rem] lg:text-[5.5rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85]">
          RESET
        </h1>
        <h1 className="text-[4rem] lg:text-[5.5rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85] text-right">
          PASSWORD
        </h1>
      </div>

      {!token ? (
        <div className="space-y-3 pt-4">
          <p className="text-sm text-red-600 font-medium bg-red-50 p-3 rounded-xl border border-red-100">
            Reset token missing. Please use the link from your email.
          </p>
          <Link className="block text-center font-bold underline decoration-2 underline-offset-4 text-black" href="/forgot-password">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2 relative">
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="New password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 rounded-md bg-white border-gray-400 px-6 text-base placeholder:text-gray-500 focus:ring-1 focus:ring-black focus:border-black transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {msg ? <p className="text-green-600 font-medium bg-green-50 p-2 rounded-lg text-sm">{msg}</p> : null}
          {err ? <p className="text-red-600 font-medium bg-red-50 p-2 rounded-lg text-sm">{err}</p> : null}

          <Button className="w-full h-12 rounded-md text-lg font-medium bg-[#1F1F1F] hover:bg-black text-white transition-all shadow-lg" disabled={disabled} type="submit">
            {loading ? "Resetting..." : "Reset password"}
          </Button>

          <div className="text-center">
            <Link className="font-bold underline decoration-2 underline-offset-4 text-black" href="/login">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

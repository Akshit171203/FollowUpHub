"use client";

import Link from "next/link";
import { useState } from "react";
import { forgotPassword } from "@/lib/auth";
import Image from "next/image";
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
    <div className="space-y-5 w-full max-w-lg mx-auto">
      <div className="text-center md:text-left leading-none select-none">
        <h1 className="text-[4rem] lg:text-[5.5rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85]">
          FORGOT
        </h1>
        <h1 className="text-[4rem] lg:text-[5.5rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85] text-right">
          PASSWORD
        </h1>
      </div>

      <div className="pt-2">
         {msg && <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 font-medium">{msg}</div>}
         {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">{err}</div>}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-12 rounded-md bg-white border-gray-400 px-6 text-base placeholder:text-gray-500 focus:ring-1 focus:ring-black focus:border-black transition-all"
          />
        </div>

        <Button className="w-full h-12 rounded-md text-lg font-medium bg-[#1F1F1F] hover:bg-black text-white transition-all shadow-lg" disabled={disabled}>
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <div className="text-center">
        <Link className="font-bold underline decoration-2 underline-offset-4 text-black" href="/login">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

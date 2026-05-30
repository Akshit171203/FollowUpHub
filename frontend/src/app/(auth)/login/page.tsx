"use client";

import { Suspense } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth";
import Image from "next/image";

import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const disabled = !email || !password || loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await login({ email, password });
      router.push(returnUrl);
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 w-full max-w-lg mx-auto">
      {/* Heading */}
      <div className="text-center md:text-left leading-none select-none mb-2">
        <h1 className="text-[3rem] lg:text-[6rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85]">
          WELCOME
        </h1>
        <h1 className="text-[3rem] lg:text-[6rem] font-oswald font-bold tracking-tighter uppercase text-black leading-[0.85] text-right mt-1">
          BACK
        </h1>
       
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-lg bg-white border-gray-200 px-4 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
              Password
            </label>
            <Link 
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors" 
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-lg bg-white border-gray-200 px-4 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {err ? (
          <p className="text-sm text-red-600 font-medium px-2">{err}</p>
        ) : null}

        {/* Sign In Button */}
        <Button 
          className="w-full h-11 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-all shadow-sm" 
          type="submit" 
          disabled={disabled}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-4 py-1">
          <div className="flex-1 border-t border-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">or sign in with</span>
          <div className="flex-1 border-t border-gray-200"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="flex justify-center gap-4">
           {/* Google */}
           <a 
             className="h-12 w-12 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center shadow-sm transition-transform hover:scale-105" 
             href={`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/google`}
           >
             <svg className="h-8 w-8" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
             </svg>
           </a>
           {/* Github */}
           <a 
             className="h-12 w-12 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center shadow-sm transition-transform hover:scale-105" 
             href={`${process.env.NEXT_PUBLIC_API_URL}/api/oauth/github`}
           >
             <svg className="h-8 w-8 fill-black" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> 
           </a>
        </div>

        {/* Sign Up Link */}
        <div className="text-center pt-0">
          <p className="text-xs text-gray-600">
            New here?{" "}
            <Link className="font-semibold text-black underline decoration-1 underline-offset-2 hover:text-gray-700 transition-colors" href="/signup">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

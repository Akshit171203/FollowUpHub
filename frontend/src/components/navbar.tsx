"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

  if (isAuthPage) return null;

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/FollowUpHub.png"
            alt="FollowUpHub Logo"
            width={40}
            height={40}
            className="rounded-sm"
          />
          <span className="text-lg font-bold">FollowUpHub</span>
        </Link>
        <div className="flex items-center gap-4">
          {/* Add navigation links here later if needed */}
        </div>
      </div>
    </nav>
  );
}

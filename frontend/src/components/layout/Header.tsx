"use client";

import { Search, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { profile, User } from "@/lib/auth";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DesktopNotificationToggle } from "@/components/notifications/DesktopNotificationToggle";

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    profile().then(data => setUser(data.user)).catch(() => {});
  }, []);

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : "JD";

  return (
    <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Search */}
      <div className="flex items-center w-full max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Search follow-ups, tasks..." 
            className="pl-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 font-mono text-[10px] font-medium text-zinc-500">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle (Placeholder) */}
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900">
          <Moon className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <NotificationBell />
        
        {/* Desktop Toggle */}
        <div className="hidden sm:block">
          <DesktopNotificationToggle />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-200" />

        {/* Profile */}
        <Link href="/settings">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white cursor-pointer hover:opacity-90 transition-opacity">
            {initials}
          </div>
        </Link>
      </div>
    </header>
  );
}

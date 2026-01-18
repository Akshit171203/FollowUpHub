"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Search,
  ChevronDown, 
  Plus, 
  LogOut,
  Settings,
  User as UserIcon,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, profile, User } from "@/lib/auth";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { DesktopNotificationToggle } from "@/components/notifications/DesktopNotificationToggle";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadData() {
      // Don't load data if on auth pages (optimization, but hook must run)
      if (pathname === "/login" || pathname === "/signup") return;
      
      try {
        const userData = await profile();
        setUser(userData.user);
      } catch (error) {
        // console.error("Navbar data load failed:", error);
      }
    }
    loadData();
  }, [pathname]);

  if (pathname === "/login" || pathname === "/signup") return null;

  async function onLogout() {
    try {
      await logout();
      router.push("/login"); // Redirect explicitly to be safe
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Follow-ups", href: "/followups" },
    { label: "Templates", href: "/templates" },
    { label: "Timeline", href: "/timeline" },
    { label: "Notifications", href: "/notifications" },
  ];
  
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : "JD";

  return (
    <nav className="h-16 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50 font-lato">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-full flex items-center justify-between gap-4">
        
        {/* Left: Product + Workspace Switcher */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 group">
             <Image 
              src="/FollowUpHub.png" 
              alt="Logo" 
              width={32} 
              height={32} 
              className="object-contain rounded-md"
            />
          </Link>
          
          <div className="h-5 w-[1px] bg-zinc-200 hidden sm:block"></div>

          {/* Workspace Switcher (Segmented Control style) */}
          <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors group">
            <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-[10px] text-white flex items-center justify-center font-bold">P</span>
            <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">Personal</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600" />
          </button>
        </div>

        {/* Center: Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 relative",
                    isActive 
                      ? "text-zinc-900" 
                      : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50"
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-[-18px] left-0 right-0 h-[2px] bg-indigo-600 rounded-t-full"></span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-3">
          
          {/* Search Trigger (Input Style) */}
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-500 w-48 transition-colors group focus:ring-2 focus:ring-indigo-500/20 outline-none">
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-400 font-medium font-mono">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </button>

          {/* Notifications */}
          <NotificationBell />
          
          {/* Desktop Notification Toggle */}
          <DesktopNotificationToggle />

          <div className="h-5 w-[1px] bg-zinc-200 hidden sm:block"></div>

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center gap-2 pl-1 pr-0 py-1 rounded-full hover:bg-zinc-50 transition-colors">
               <span className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-700 group-hover:bg-zinc-200 group-hover:border-zinc-300 transition-all select-none">
                 {initials}
               </span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-56 p-1 bg-white rounded-xl shadow-xl shadow-black/5 ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
               <div className="px-3 py-2.5 mb-1 border-b border-zinc-50">
                 <p className="text-sm font-semibold text-zinc-900 truncate mb-0.5">{user?.name || 'User'}</p>
                 <p className="text-xs text-zinc-500 truncate">{user?.email || 'user@example.com'}</p>
               </div>
               
               <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                 <UserIcon className="w-4 h-4 text-zinc-400" /> Account
               </Link>
               <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                 <Settings className="w-4 h-4 text-zinc-400" /> Notification Settings
               </Link>
               
               <div className="my-1 h-[1px] bg-zinc-50"></div>
               
               <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50 text-left transition-colors font-medium">
                 <LogOut className="w-4 h-4" /> Log out
               </button>
            </div>
          </div>

          <Link href="/followups/new" className="ml-2">
            <button className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-1.5 rounded-full shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </Link>

        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  LayoutDashboard,
  Send,
  CheckCircle2,
  Kanban,
  FileText,
  Clock,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings
} from "lucide-react";
import { useUser } from "@/components/ProtectedRoute";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Follow-ups", href: "/followups", icon: Send },
  { label: "Todos", href: "/todos", icon: CheckCircle2 },
  { label: "Jira", href: "/jira", icon: Kanban },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "Timeline", href: "/timeline", icon: Clock },
];

export function Sidebar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: { 
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : "JD";

  // Force expand on mobile
  const effectiveCollapsed = isMobileMenuOpen ? false : isCollapsed;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen?.(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ 
          width: effectiveCollapsed ? 80 : 256,
          x: isMobileMenuOpen ? 0 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "h-[100dvh] bg-white border-r border-zinc-200/80 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.01)]",
          // Mobile specific classes (slide over)
          "md:relative md:z-20 md:translate-x-0 transition-transform duration-300",
          "fixed top-0 bottom-0 left-0 z-50",
          !isMobileMenuOpen && "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Collapse Toggle (Desktop Only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3.5 top-8 w-7 h-7 bg-white border border-zinc-200 rounded-full items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 shadow-sm z-30 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900/10 cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Header / Logo (Hidden on mobile as it's in the top bar) */}
        <div className={cn("hidden md:flex h-20 items-center shrink-0 border-b border-zinc-100", isCollapsed ? "justify-center" : "px-6 gap-3")}>
          <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-zinc-900 shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Image 
                src="/FollowUpHubIcon.png" 
                alt="FollowUpHub Logo" 
                width={16} 
                height={16} 
                className="object-contain filter brightness-0 invert"
              />
            </div>
            {!isCollapsed && (
              <span className="font-sans font-bold text-[18px] text-zinc-900 tracking-tight whitespace-nowrap">
                FollowUpHub
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto scrollbar-none py-6 px-4 flex flex-col gap-1.5 mt-2 md:mt-0">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen?.(false)}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 group relative cursor-pointer",
                  effectiveCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
                  isActive 
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70"
                )}
                title={effectiveCollapsed ? item.label : undefined}
              >
                <Icon className={cn("shrink-0 transition-colors", effectiveCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]", isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-600")} strokeWidth={isActive ? 2.5 : 2} />
                {!effectiveCollapsed && (
                  <span className={cn("text-[14px] whitespace-nowrap", isActive ? "font-bold" : "font-semibold")}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Actions (Notifications, Profile) */}
        <div className="p-4 border-t border-zinc-100 flex flex-col gap-1.5 shrink-0">
          <NotificationBell triggerMode="sidebar" isCollapsed={effectiveCollapsed} />
        </div>

        {/* User Profile */}
        <div className={cn("p-4 border-t border-zinc-100 shrink-0", effectiveCollapsed ? "flex justify-center" : "")}>
          <Link 
            href="/settings"
            onClick={() => setIsMobileMenuOpen?.(false)}
            className={cn(
              "flex items-center rounded-xl transition-all border border-transparent hover:border-zinc-200 hover:bg-zinc-50 hover:shadow-sm cursor-pointer",
              effectiveCollapsed ? "p-1 justify-center" : "px-3 py-2 gap-3"
            )}
            title={effectiveCollapsed ? "Settings" : undefined}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-[12px] font-bold text-white shadow-sm shrink-0">
              {initials}
            </div>
            {!effectiveCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[14px] font-bold text-zinc-900 truncate leading-tight">{user?.name || "User"}</span>
                <span className="text-[12px] font-medium text-zinc-500 truncate leading-tight mt-0.5">Settings & Profile</span>
              </div>
            )}
          </Link>
        </div>
      </motion.aside>
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu,
  X,
  Search
} from "lucide-react";
import { useUser } from "@/components/ProtectedRoute";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navItems = [
  { label: "Overview", href: "/dashboard" }, // Using Dashboard as Overview
  { label: "Follow-ups", href: "/followups" },
  { label: "Todos", href: "/todos" },
  { label: "Jira", href: "/jira" },
  { label: "Templates", href: "/templates" },
  { label: "Timeline", href: "/timeline" },
];

export function TopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : "JD";

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-zinc-200/80 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Left Side: Logo & Desktop Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-zinc-900 group-hover:scale-105 transition-transform">
                <Image 
                  src="/FollowUpHubIcon.png" 
                  alt="FollowUpHub Logo" 
                  width={14} 
                  height={14} 
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="font-sans font-semibold text-[17px] text-zinc-900 tracking-tight">
                FollowUpHub
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1 mt-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative group px-3 py-1.5"
                  >
                    <span className={cn(
                      "relative z-10 text-[14px] transition-colors duration-200 font-medium px-2 py-1.5 rounded-md",
                      isActive 
                        ? "text-zinc-900 bg-zinc-100" 
                        : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side: Actions (Search, Bell, Profile) */}
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
               <Search className="w-[18px] h-[18px]" />
            </button>
            
            <div className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer relative">
               <NotificationBell />
            </div>
            
            <div className="h-4 w-[1px] bg-zinc-200 mx-1 hidden md:block"></div>
            
            <Link href="/settings">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-[12px] font-semibold text-white shadow-sm ring-2 ring-white cursor-pointer hover:ring-zinc-200 transition-all duration-300">
                {initials}
              </div>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsOpen(true)} 
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors ml-1"
            >
              <Menu className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="md:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ x: "100%" }} 
               animate={{ x: 0 }} 
               exit={{ x: "100%" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="md:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-2xl z-50 flex flex-col p-6 border-l border-zinc-200"
             >
                <div className="flex justify-between items-center mb-8">
                   <span className="font-sans font-semibold text-lg text-zinc-900">Menu</span>
                   <button onClick={() => setIsOpen(false)} className="p-2 bg-zinc-100 rounded-full text-zinc-600 hover:text-zinc-900 transition-colors">
                      <X className="w-[18px] h-[18px]" />
                   </button>
                </div>

                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200",
                          isActive
                            ? "bg-zinc-100 text-zinc-900"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
             </motion.div>
           </>
        )}
      </AnimatePresence>
    </>
  );
}

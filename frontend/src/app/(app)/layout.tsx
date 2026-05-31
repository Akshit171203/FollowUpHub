"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { UserProvider } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/context/notification-context";
import { Toaster } from "@/components/ui/sonner";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <UserProvider>
      <NotificationProvider>
        <div className="flex h-[100dvh] bg-[#FAFAFA] text-zinc-900 selection:bg-indigo-500/30 overflow-hidden flex-col md:flex-row">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-zinc-200 shrink-0 z-30 relative">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-zinc-900 shadow-md">
                <Image 
                  src="/FollowUpHubIcon.png" 
                  alt="FollowUpHub Logo" 
                  width={16} 
                  height={16} 
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="font-sans font-bold text-[18px] text-zinc-900 tracking-tight">
                FollowUpHub
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-200 rounded-lg cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </NotificationProvider>
    </UserProvider>
  );
}

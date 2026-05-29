"use client";

import { TopNav } from "@/components/layout/TopNav";
import { Header } from "@/components/layout/Header";
import { UserProvider } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/context/notification-context";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <div className="flex flex-col min-h-screen bg-[#e8e9ec] text-zinc-900 selection:bg-indigo-500/30 relative overflow-hidden">
          
          <TopNav />
          
          {/* Main Content Area */}
          <div className="flex-1 w-full flex flex-col min-w-0 relative z-10">
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

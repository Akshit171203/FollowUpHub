"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { UserProvider } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/context/notification-context";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <NotificationProvider>
        <div className="flex h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-indigo-500/30 overflow-hidden">
          
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

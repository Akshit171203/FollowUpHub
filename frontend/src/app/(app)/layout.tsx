"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationProvider } from "@/context/notification-context";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
      <div className="flex min-h-screen bg-zinc-50/50">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </NotificationProvider>
    </ProtectedRoute>
  );
}

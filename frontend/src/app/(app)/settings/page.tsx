"use client";

import { NotificationSettings } from "@/components/notifications/NotificationSettings";
import { DesktopNotificationToggle } from "@/components/notifications/DesktopNotificationToggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bell, LogOut, User as UserIcon, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col font-sans w-full max-w-[1000px] mx-auto px-4 md:px-8 pt-8 pb-20 gap-8 relative z-10">
      
      {/* Sleek Page Header */}
      <div className="flex flex-col gap-1 border-b border-zinc-200/60 pb-6">
         <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Settings</h1>
         <p className="text-[15px] text-zinc-500">
            Manage your account session and customize your application preferences.
         </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* Account Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[14px] font-bold text-zinc-900 uppercase tracking-wider">Account</h2>
          
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                  <UserIcon className="w-5 h-5 text-zinc-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">Active Session</span>
                  <span className="text-[13px] text-zinc-500 mt-0.5">
                    Log out of your current session on this device.
                  </span>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 text-red-600 hover:text-red-700 font-semibold rounded-xl transition-all shadow-sm active:scale-95 text-[14px]"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section Header */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[14px] font-bold text-zinc-900 uppercase tracking-wider">Notifications</h2>
          
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col">
            
            {/* Desktop Notifications (Client-Side) */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold text-zinc-900 tracking-tight">Desktop Alerts</span>
                  <span className="text-[13px] text-zinc-500 mt-0.5">
                    Show native browser notifications when the tab is closed.
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <DesktopNotificationToggle />
              </div>
            </div>

            {/* Server-Backed Preferences */}
            <NotificationSettings />
          </div>
        </section>
      </div>
    </div>
  );
}

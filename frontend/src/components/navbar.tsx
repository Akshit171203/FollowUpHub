"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Bell, 
  Search,
  ChevronDown, 
  Plus, 
  LogOut,
  Settings,
  User as UserIcon,
  CheckCircle2,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout, profile, User } from "@/lib/auth";
import { getUnreadNotifications, Notification } from "@/lib/notifications";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);

  if (pathname === "/login" || pathname === "/signup") return null;

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await profile();
        setUser(userData.user);
        const notifs = await getUnreadNotifications();
        setNotifications(notifs);
      } catch (error) {
        console.error("Navbar data load failed:", error);
      }
    }
    loadData();

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="flex items-center justify-end gap-3" ref={notifRef}>
          
          {/* Search Trigger (Input Style) */}
          <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-sm text-zinc-500 w-48 transition-colors group focus:ring-2 focus:ring-indigo-500/20 outline-none">
            <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600" />
            <span className="flex-1 text-left">Search...</span>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-[10px] text-zinc-400 font-medium font-mono">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative text-zinc-500 hover:text-zinc-900 transition-colors p-2 rounded-full hover:bg-zinc-100 outline-none",
                showNotifications && "bg-zinc-100 text-zinc-900"
              )}
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl shadow-black/5 ring-1 ring-black/5 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-3 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/50">
                  <h3 className="font-semibold text-zinc-900 text-xs uppercase tracking-wider">Notifications</h3>
                  <Link 
                    href="/notifications" 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5 text-zinc-300" />
                      </div>
                      <p className="text-sm text-zinc-900 font-medium">No new notifications</p>
                      <p className="text-xs text-zinc-500 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} className="p-3 border-b border-zinc-50 hover:bg-zinc-50/80 transition-colors cursor-pointer group">
                         <div className="flex gap-3">
                           <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0 ring-2 ring-indigo-50" />
                           <div>
                             <p className="text-sm text-zinc-900 font-medium line-clamp-1 group-hover:text-indigo-600 transition-colors">{n.title || "New Notification"}</p>
                             <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                             <p className="text-[10px] text-zinc-400 mt-1.5 font-medium">{n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</p>
                           </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

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
               <Link href="/settings/preferences" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 rounded-lg hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                 <Settings className="w-4 h-4 text-zinc-400" /> Preferences
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

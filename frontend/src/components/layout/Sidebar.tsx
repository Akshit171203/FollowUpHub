"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGrid, 
  CheckSquare, 
  CheckCircle2,
  FileText, 
  LineChart, 
  BarChart,
  Kanban,
  Menu,
  X
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "My Follow-ups", href: "/followups" },
  { icon: CheckCircle2, label: "Todos", href: "/todos" },
  { icon: Kanban, label: "Jira Integration", href: "/jira" },
  { icon: FileText, label: "Templates", href: "/templates" },
  { icon: LineChart, label: "Timeline", href: "/timeline" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on navigation on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-100 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center">
          <Image 
            src="/FollowUpHubIcon.png" 
            alt="FollowUpHub Logo" 
            width={32} 
            height={32} 
            className="w-8 h-8 object-contain"
          />
          <Image 
            src="/FollowUpHub.png" 
            alt="FollowUpHub" 
            width={128} 
            height={40} 
            className="w-32 h-auto object-contain ml-2"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
        
        <div className="space-y-1">

          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-zinc-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

    </>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-200 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center">
            <Image src="/FollowUpHubIcon.png" alt="Logo" width={28} height={28} className="w-7 h-7 object-contain" />
            <span className="font-bold ml-2 text-zinc-900">FollowUpHub</span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 -mr-2 text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors">
           <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay + Sliding Drawer */}
      <AnimatePresence>
        {isOpen && (
           <>
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setIsOpen(false)}
               className="md:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ x: "-100%" }} 
               animate={{ x: 0 }} 
               exit={{ x: "-100%" }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
               className="md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 flex flex-col h-[100dvh]"
             >
                <div className="absolute top-4 right-4 z-50">
                  <button onClick={() => setIsOpen(false)} className="p-1.5 bg-zinc-100 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
                </div>
                <SidebarContent />
             </motion.div>
           </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (always visible on md+) */}
      <div className="hidden md:flex w-64 border-r border-zinc-200 bg-white flex-col h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </div>
    </>
  );
}

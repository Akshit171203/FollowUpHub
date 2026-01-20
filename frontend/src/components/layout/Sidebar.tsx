"use client";

// Layout Sidebar Component

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  CheckSquare, 
  CheckCircle2,
  FileText, 
  LineChart, 
  BarChart 
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutGrid, label: "Dashboard", href: "/dashboard" },
  { icon: CheckSquare, label: "My Follow-ups", href: "/followups" },
  { icon: CheckCircle2, label: "Todos", href: "/todos" },
  { icon: FileText, label: "Templates", href: "/templates" },
  { icon: LineChart, label: "Timeline", href: "/timeline" },
  { icon: BarChart, label: "Analytics", href: "/analytics" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-zinc-200 bg-white flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-100">
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
        
        {/* Workspace Section */}
        <div className="space-y-1">
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Workspace</h3>
          </div>
          {/* Search Placeholder */}
          <div className="px-3 mb-3">
            <div className="h-8 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center px-2.5">
               <span className="text-zinc-400 text-xs">Search...</span>
               <div className="ml-auto w-4 h-4 rounded-[3px] border border-zinc-200 bg-white flex items-center justify-center text-[9px] text-zinc-400 font-medium">⌘K</div>
            </div>
          </div>

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

      {/* Storage Widget (Bottom) */}
      <div className="p-4 mt-auto border-t border-zinc-100">
        <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Storage</span>
            <span className="text-xs font-medium text-zinc-400">75%</span>
          </div>
          <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-indigo-600 w-[75%] rounded-full" />
          </div>
          <p className="text-xs text-zinc-500">
            <span className="font-medium text-zinc-700">7.5 GB</span> of 10 GB used
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useNotifications } from "@/context/notification-context";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DesktopNotificationToggle } from "@/components/notifications/DesktopNotificationToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { groups, unreadCount, loading, markGroupRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const filteredGroups = activeTab === 'all' 
    ? groups 
    : groups.filter(g => g.unreadCount > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative overflow-visible">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div 
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                minWidth: '20px',
                height: '20px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: '600',
                border: '2px solid white',
                zIndex: 9999,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 bg-white border border-zinc-200 shadow-2xl z-50 overflow-hidden rounded-xl" align="end">
        {/* Header */}
        <div className="pt-5 px-5 pb-0 bg-white z-10 relative">
           <div className="flex items-center gap-2.5 mb-4">
             <h4 className="text-xl font-bold text-zinc-900 tracking-tight">Notifications</h4>
             {unreadCount > 0 && (
               <span className="bg-zinc-100 text-zinc-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-zinc-200 min-w-[24px] text-center">
                 {unreadCount}
               </span>
             )}
           </div>

           {/* Tabs */}
           <div className="flex border-b border-zinc-100 w-full relative">
              <button 
                onClick={() => setActiveTab('all')}
                className={cn(
                  "flex-1 pb-3 text-sm font-semibold transition-all relative",
                  activeTab === 'all' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                All
                {activeTab === 'all' && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('unread')}
                className={cn(
                  "flex-1 pb-3 text-sm font-semibold transition-all relative",
                  activeTab === 'unread' ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                )}
              >
                Unread
                {activeTab === 'unread' && (
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full"></div>
                )}
              </button>
           </div>
        </div>

        {/* Content List */}
        <ScrollArea className="h-[400px] bg-white">
           {loading && groups.length === 0 ? (
               <div className="p-8 text-center flex flex-col items-center gap-3 mt-8">
                   <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 animate-pulse"><Bell className="w-5 h-5" /></div>
                   <p className="text-xs text-zinc-400">Loading...</p>
               </div>
           ) : filteredGroups.length === 0 ? (
               <div className="p-8 text-center flex flex-col items-center gap-3 mt-8">
                   <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300"><Bell className="w-6 h-6" /></div>
                   <p className="text-sm font-medium text-zinc-900">All caught up!</p>
                   <p className="text-xs text-zinc-400 text-center max-w-[200px]">No notifications to show.</p>
               </div>
           ) : (
               <div className="divide-y divide-zinc-50">
                   {filteredGroups.map((group) => (
                       <button
                           key={group.groupKey}
                           className={cn(
                               "w-full text-left py-4 px-5 hover:bg-zinc-50/80 transition-all group relative flex gap-4 border-l-[4px]",
                               group.unreadCount > 0 
                                 ? "bg-indigo-50/5 border-indigo-500" 
                                 : "bg-white border-transparent"
                           )}
                           onClick={() => {
                               if (group.unreadCount > 0) markGroupRead(group.groupKey);
                           }}
                       >
                           <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start gap-3">
                                  <p className={cn(
                                    "text-[13px] leading-snug truncate pr-2", 
                                    group.unreadCount > 0 ? "font-bold text-zinc-900" : "font-medium text-zinc-700"
                                  )}>
                                      {group.latestTitle || "Notification"}
                                  </p>
                                  <span className={cn(
                                    "text-[10px] font-medium whitespace-nowrap shrink-0 mt-0.5",
                                    group.unreadCount > 0 ? "text-indigo-600" : "text-zinc-400"
                                  )}>
                                      {formatDistanceToNow(new Date(group.lastActivity), { addSuffix: true })}
                                  </span>
                               </div>
                               
                               <p className="text-xs text-zinc-500 leading-snug mt-1 line-clamp-1 font-medium">
                                   {group.latestType}
                                   {group.unreadCount > 1 && <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full ml-2 font-bold">+{group.unreadCount - 1}</span>}
                               </p>
                           </div>
                       </button>
                   ))}
               </div>
           )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/80 flex items-center justify-between gap-4 backdrop-blur-sm">
          <DesktopNotificationToggle />
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50 h-8 text-xs font-medium px-4 rounded-lg">
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

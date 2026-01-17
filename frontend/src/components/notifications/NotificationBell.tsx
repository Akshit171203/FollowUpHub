"use client";

import React, { useState } from "react";
import { useNotifications } from "@/context/notification-context";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { groups, unreadCount, loading, markGroupRead } = useNotifications();
  const [open, setOpen] = useState(false);

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
      <PopoverContent className="w-80 p-0 bg-white border shadow-xl z-50" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold leading-none">Notifications</h4>
          {unreadCount > 0 && (
             <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>
        <ScrollArea className="h-[300px]">
           {loading && groups.length === 0 ? (
               <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
           ) : groups.length === 0 ? (
               <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
           ) : (
               <div className="grid gap-1">
                   {groups.map((group) => (
                       <button
                           key={group.groupKey}
                           className={cn(
                               "text-left p-4 hover:bg-muted/50 transition-colors border-b last:border-0",
                               group.unreadCount > 0 ? "bg-muted/20" : ""
                           )}
                           onClick={() => {
                               if (group.unreadCount > 0) markGroupRead(group.groupKey);
                               // Navigation logic could go here based on group.latestType or metadata
                           }}
                       >
                           <div className="flex justify-between items-start mb-1">
                               <p className={cn("text-sm font-medium", group.unreadCount > 0 && "text-primary")}>
                                   {group.latestTitle}
                               </p>
                               <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                   {formatDistanceToNow(new Date(group.lastActivity), { addSuffix: true })}
                               </span>
                           </div>
                           <p className="text-xs text-muted-foreground line-clamp-2">
                               {group.groupKey} • {group.latestType}
                           </p>
                           {group.unreadCount > 1 && (
                               <Badge variant="secondary" className="mt-2 text-[10px] h-4">
                                   +{group.unreadCount - 1} more
                               </Badge>
                           )}
                           <div 
                             className="absolute top-2 right-2 p-1 hover:bg-zinc-200 rounded-full cursor-pointer"
                             onClick={(e) => {
                               e.stopPropagation();
                               markGroupRead(group.groupKey);
                             }}
                             title="Dismiss"
                           >
                             <div className="w-3 h-3 text-zinc-400">×</div> 
                           </div>
                       </button>
                   ))}
               </div>
           )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

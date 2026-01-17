"use client";

import { useEffect } from "react";
import { useNotifications } from "@/context/notification-context";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { groups, loading, refresh, markGroupRead } = useNotifications();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading && groups.length === 0) {
    return <div className="p-8 text-center">Loading notifications...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 bg-muted/20 rounded-lg">
            No notifications found.
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.groupKey}
              className={cn(
                "group relative flex flex-col gap-2 p-4 rounded-lg border transition-all hover:shadow-sm bg-card",
                group.unreadCount > 0 ? "border-primary/20 bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <Link 
                  href={`/notifications/${group.groupKey}`}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-xs font-mono px-1.5 py-0.5 rounded",
                      group.latestSeverity === "ERROR" || group.latestSeverity === "CRITICAL" ? "bg-red-100 text-red-700" :
                      group.latestSeverity === "WARNING" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    )}>
                      {group.latestType}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(group.lastActivity), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h3 className={cn(
                    "font-medium leading-tight truncate pr-8", 
                    group.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {group.latestTitle}
                  </h3>
                   
                   {group.unreadCount > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{group.unreadCount - 1} more events in this group
                      </p>
                   )}
                </Link>

                {group.unreadCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markGroupRead(group.groupKey);
                    }}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-muted"
                    title="Mark group as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

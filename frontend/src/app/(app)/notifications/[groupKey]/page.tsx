"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useNotifications } from "@/context/notification-context";
import { format } from "date-fns";
import { ArrowLeft, Check, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming sonner is installed, otherwise standard alert

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  metadata: any;
  severity: string;
};

export default function GroupDetailsPage() {
  const { groupKey } = useParams();
  const router = useRouter();
  const { markGroupRead, actionDone, actionSnooze } = useNotifications();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ notifications: NotificationItem[] }>(
        `/api/notifications/groups/${groupKey}`
      );
      if (res.notifications) {
        setItems(res.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [groupKey]);

  const markedRef = useRef<string | null>(null);

  useEffect(() => {
    if (groupKey && markedRef.current !== groupKey) {
      fetchDetails();
      markGroupRead(groupKey as string);
      markedRef.current = groupKey as string;
    }
  }, [groupKey, fetchDetails, markGroupRead]);

  // Real-time updates
  useEffect(() => {
      const socket = getSocket();
      
      const handleNotificationChange = (data: { groupKey: string }) => {
          if (data.groupKey === groupKey || data.groupKey === 'legacy') {
              fetchDetails();
          }
      };

      if (socket.connected) {
          socket.on("notification:changed", handleNotificationChange);
      } else {
          socket.on("connect", () => {
             socket.on("notification:changed", handleNotificationChange);
          });
      }

      return () => {
          socket.off("notification:changed", handleNotificationChange);
      };
  }, [groupKey, fetchDetails]);

  const handleDone = async (id: string) => {
      try {
          await actionDone(id);
          toast.success("Marked as Done");
          // Update local state to reflect change (e.g. disable button)
          // We can just re-fetch or optimistically update
          fetchDetails();
      } catch (err) {
          toast.error("Failed to mark done");
      }
  };

  const handleSnooze = async (id: string) => {
      // Simple prompt for now, or use a modal
      const minutes = prompt("Snooze for how many minutes?", "60");
      if (!minutes) return;
      
      try {
          await actionSnooze(id, parseInt(minutes));
          toast.success(`Snoozed for ${minutes} minutes`);
          fetchDetails();
      } catch (err) {
          toast.error("Failed to snooze");
      }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" className="pl-0 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <h1 className="text-xl font-bold mt-2 break-all">
          {decodeURIComponent(groupKey as string)}
        </h1>
      </div>

      <div className="relative border-l border-border ml-3 space-y-8 pb-8">
        {loading ? (
            <div className="pl-8">Loading history...</div>
        ) : (
            items.map((item) => (
                <div key={item.id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className={cn(
                        "absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-background",
                        item.isRead ? "bg-muted-foreground/30" : "bg-primary"
                    )} />
                    
                    <div className="flex flex-col gap-2 p-4 rounded-lg border bg-card/50">
                        <div className="flex justify-between items-start">
                             <div>
                                 <h4 className="font-medium text-sm">{item.title}</h4>
                                 <p className="text-xs text-muted-foreground mt-0.5">
                                     {format(new Date(item.createdAt), "PPpp")}
                                 </p>
                             </div>
                             <span className={cn(
                                 "text-[10px] font-mono px-1.5 py-0.5 rounded uppercase",
                                 item.severity === "INFO" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                             )}>
                                 {item.severity}
                             </span>
                        </div>
                        
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                            {item.message}
                        </p>

                        {/* Actions */}
                        {item.type === "FOLLOWUP_DUE" && (
                            <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => handleDone(item.id)}>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                </Button>
                                <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => handleSnooze(item.id)}>
                                    <Clock className="w-3.5 h-3.5" /> Snooze
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

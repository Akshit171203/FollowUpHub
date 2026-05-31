"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { 
  RefreshCw, Activity, CalendarDays, Key,
  Bell, AlertTriangle, CheckCircle2, Clock, 
  XCircle, PlusCircle, RotateCcw, Zap,
  ArrowRight, ChevronRight
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

import { getEventTimeline, type FollowUpEvent, type PaginationMeta } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

function fmt(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

function relativeTime(dateIso?: string | null) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

// Event type configuration: icon, colors, and human-readable label
function getEventConfig(type: string) {
  switch (type) {
    case "REMINDER_SENT":
      return {
        icon: Bell,
        bg: "bg-blue-50",
        border: "border-blue-200",
        iconColor: "text-blue-500",
        dotColor: "bg-blue-400",
        label: "Reminder Sent",
        badgeBg: "bg-blue-50 text-blue-600 border-blue-200",
      };
    case "ESCALATED":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-50",
        border: "border-amber-200",
        iconColor: "text-amber-500",
        dotColor: "bg-amber-400",
        label: "Escalated",
        badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
      };
    case "DONE":
    case "COMPLETED":
      return {
        icon: CheckCircle2,
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        iconColor: "text-emerald-500",
        dotColor: "bg-emerald-400",
        label: type === "DONE" ? "Completed" : "Completed",
        badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      };
    case "SNOOZED":
      return {
        icon: Clock,
        bg: "bg-violet-50",
        border: "border-violet-200",
        iconColor: "text-violet-500",
        dotColor: "bg-violet-400",
        label: "Snoozed",
        badgeBg: "bg-violet-50 text-violet-600 border-violet-200",
      };
    case "CANCELLED":
      return {
        icon: XCircle,
        bg: "bg-red-50",
        border: "border-red-200",
        iconColor: "text-red-500",
        dotColor: "bg-red-400",
        label: "Cancelled",
        badgeBg: "bg-red-50 text-red-600 border-red-200",
      };
    case "CREATED":
      return {
        icon: PlusCircle,
        bg: "bg-teal-50",
        border: "border-teal-200",
        iconColor: "text-teal-500",
        dotColor: "bg-teal-400",
        label: "Created",
        badgeBg: "bg-teal-50 text-teal-600 border-teal-200",
      };
    case "RESCHEDULED":
      return {
        icon: RotateCcw,
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        iconColor: "text-indigo-500",
        dotColor: "bg-indigo-400",
        label: "Rescheduled",
        badgeBg: "bg-indigo-50 text-indigo-600 border-indigo-200",
      };
    default:
      return {
        icon: Zap,
        bg: "bg-zinc-50",
        border: "border-zinc-200",
        iconColor: "text-zinc-500",
        dotColor: "bg-zinc-400",
        label: type || "Event",
        badgeBg: "bg-zinc-100 text-zinc-600 border-zinc-200",
      };
  }
}

// Parse the raw log message into something more human-readable
function humanizeMessage(msg: string | null | undefined, eventType: string): string {
  if (!msg) return "";
  
  // "Reminder sent. repeat=true ignoreCount=1 policy=NORMAL"
  if (msg.startsWith("Reminder sent.")) {
    const repeat = msg.includes("repeat=true");
    const ignoreMatch = msg.match(/ignoreCount=(\d+)/);
    const policyMatch = msg.match(/policy=(\w+)/);
    const count = ignoreMatch ? parseInt(ignoreMatch[1]) : 0;
    const policy = policyMatch ? policyMatch[1].toLowerCase() : "normal";
    
    if (repeat && count > 0) {
      return `Follow-up reminder sent again (${count} ${count === 1 ? 'time' : 'times'} ignored, ${policy} policy)`;
    }
    return `Initial follow-up reminder sent (${policy} policy)`;
  }
  
  // "Escalated to level X (ignoreCount=Y)"
  if (msg.startsWith("Escalated to level")) {
    const levelMatch = msg.match(/level (\d+)/);
    const level = levelMatch ? parseInt(levelMatch[1]) : 0;
    const severity = level >= 3 ? "critical" : level >= 2 ? "high" : "moderate";
    return `Escalated to Level ${level} — ${severity} priority`;
  }

  // "Jira Escalation dispatched to manager: email"
  if (msg.includes("Jira Escalation dispatched")) {
    const emailMatch = msg.match(/manager: (.+)/);
    const email = emailMatch ? emailMatch[1] : "manager";
    return `Jira escalation email sent to ${email}`;
  }

  // "Closed or removed in Jira"
  if (msg.includes("Closed or removed in Jira")) {
    return "Auto-resolved: ticket closed or removed in Jira";
  }
  
  return msg;
}

export default function TimelinePage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<FollowUpEvent[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function load(page = currentPage) {
    try {
      setLoading(true);
      const data = await getEventTimeline({ page, limit: 10 });
      setEvents(Array.isArray(data.events) ? data.events : []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load timeline");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  // Track loaded page to prevent duplicate fetch in Strict Mode
  const loadedPage = useRef(0);

  useEffect(() => {
    // Only fetch if we haven't already fetched this page
    if (loadedPage.current === currentPage) return;
    
    loadedPage.current = currentPage;
    load(currentPage);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 pt-6">
        
        {/* Hero Banner */}
        <div className="relative rounded-[2rem] overflow-hidden mb-10 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-sm border border-black/5">
           <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:px-10 md:py-12">
               <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
                 <h1 className="text-3xl md:text-[44px] font-black text-white tracking-tight drop-shadow-sm mb-1 uppercase">
                    EVENT TIMELINE
                 </h1>
                 <p className="text-[14px] md:text-[15px] text-white/95 leading-relaxed font-medium drop-shadow-sm max-w-[600px]">
                    A complete audit log of all automated actions, sync events, and email escalations across your workspaces.
                 </p>
                 <div className="mt-2 flex justify-center md:justify-start">
                    <button 
                      onClick={() => load(currentPage)} 
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-violet-600 hover:bg-zinc-50 text-[14px] font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      Refresh Log
                    </button>
                 </div>
              </div>
              
              {/* Decorative UI Element: Timeline / Log */}
              <div className="shrink-0 hidden md:flex relative">
                 <div className="relative w-64 h-48">
                    {/* Back blurred card */}
                    <div className="absolute top-0 right-0 w-52 h-40 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 z-10 p-6 flex flex-col justify-center">
                       <div className="flex items-center gap-4 mb-5 opacity-60">
                          <div className="w-8 h-8 rounded-full bg-white/40 shrink-0" />
                          <div className="w-24 h-3 bg-white/30 rounded-full" />
                       </div>
                       <div className="flex items-center gap-4 opacity-60">
                          <div className="w-8 h-8 rounded-full bg-white/40 shrink-0" />
                          <div className="w-16 h-3 bg-white/30 rounded-full" />
                       </div>
                    </div>
                    {/* Front solid card */}
                    <div className="absolute top-6 right-8 w-56 h-44 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-20 p-6 flex flex-col gap-4 overflow-hidden relative">
                       <div className="absolute left-[35px] top-[40px] w-[2px] h-[36px] bg-zinc-200"></div>
                       <div className="absolute left-[35px] top-[90px] w-[2px] h-[36px] bg-zinc-200"></div>
                       
                       <div className="flex items-start gap-4">
                          <div className="w-3.5 h-3.5 rounded-full bg-zinc-400 mt-1 shrink-0 shadow-sm relative z-10"></div>
                          <div className="flex flex-col gap-2 flex-1">
                             <div className="w-16 h-2 bg-zinc-200 rounded-full"></div>
                             <div className="w-full h-3 bg-zinc-300 rounded-full"></div>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="w-3.5 h-3.5 rounded-full bg-zinc-500 mt-1 shrink-0 shadow-sm relative z-10"></div>
                          <div className="flex flex-col gap-2 flex-1">
                             <div className="w-20 h-2 bg-zinc-200 rounded-full"></div>
                             <div className="w-3/4 h-3 bg-zinc-300 rounded-full"></div>
                          </div>
                       </div>
                       <div className="flex items-start gap-4">
                          <div className="w-3.5 h-3.5 rounded-full bg-zinc-300 mt-1 shrink-0 shadow-sm relative z-10"></div>
                          <div className="flex flex-col gap-2 flex-1">
                             <div className="w-12 h-2 bg-zinc-200 rounded-full"></div>
                             <div className="w-2/3 h-3 bg-zinc-200 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/40 border border-zinc-200/60 overflow-hidden">
           <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-zinc-500" />
                <h2 className="text-[16px] font-bold text-zinc-900">Activity Log</h2>
              </div>
              {pagination.total > 0 && (
                <span className="text-[13px] font-medium text-zinc-400">
                  {pagination.total} total events
                </span>
              )}
           </div>
           
           <div className="p-0">
            {loading ? (
              <div className="p-12 text-center text-[14px] font-medium text-zinc-500 flex flex-col items-center justify-center gap-3">
                 <RefreshCw className="w-6 h-6 animate-spin text-zinc-400" />
                 Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                   <CalendarDays className="w-7 h-7 text-zinc-300" />
                 </div>
                 <div>
                   <p className="text-[15px] font-semibold text-zinc-900 mb-1">No events yet</p>
                   <p className="text-[13px] text-zinc-500">Events will appear here as your follow-ups are tracked.</p>
                 </div>
              </div>
            ) : (
              <div className="relative">
                {events.map((ev, index) => {
                  const config = getEventConfig(ev.type ?? "EVENT");
                  const Icon = config.icon;
                  const isLast = index === events.length - 1;
                  const humanMsg = humanizeMessage(ev.message, ev.type ?? "");

                  return (
                    <div key={ev.id} className="relative flex gap-5 px-6 md:px-8 py-5 hover:bg-zinc-50/40 transition-colors group">
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center shrink-0 relative">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-transform group-hover:scale-105",
                          config.bg, config.border
                        )}>
                          <Icon className={cn("w-4 h-4", config.iconColor)} />
                        </div>
                        {/* Vertical line */}
                        {!isLast && (
                          <div className="w-[2px] flex-1 bg-gradient-to-b from-zinc-200 to-zinc-100 mt-2 rounded-full" />
                        )}
                      </div>
                      
                      {/* Event content */}
                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide border",
                              config.badgeBg
                            )}>
                              {config.label}
                            </span>
                            {ev.followupId && (
                              <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400">
                                <Key className="w-3 h-3" />
                                <span className="font-mono">{ev.followupId.substring(0, 8)}...</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[12px] font-semibold text-zinc-400" title={fmt(ev.createdAt)}>
                              {relativeTime(ev.createdAt)}
                            </span>
                            <span className="hidden md:inline text-[11px] text-zinc-300 font-medium">
                              {fmt(ev.createdAt)}
                            </span>
                          </div>
                        </div>

                        {humanMsg && (
                          <p className="text-[14px] text-zinc-700 leading-relaxed font-medium mt-1">
                            {humanMsg}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {pagination.total > 0 && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50/30">
                 <Pagination
                   pagination={pagination}
                   onPageChange={handlePageChange}
                   disabled={loading}
                 />
              </div>
            )}
           </div>
        </div>
      </div>
    </div>
  );
}


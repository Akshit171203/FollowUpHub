"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { 
  Bell, 
  Calendar, 
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  Layout,
  MoreHorizontal,
  ArrowUpRight,
  TrendingUp,
  Filter,
  ChevronDown,
  X,
  Check,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { 
  getAllFollowUps, 
  FollowUp, 
  markDone, 
  snoozeFollowUp 
} from "@/lib/followups";
import { 
  getEventTimeline, 
  TimelineEvent 
} from "@/lib/timeline";
import { 
  getUnreadNotifications, 
  getUnreadCount,
  markAllRead,
  markNotificationRead
} from "@/lib/notifications";
import { format } from "date-fns";
import type { Notification } from "@/lib/notifications";
import { profile, logout, User } from "@/lib/auth";
import { listTodos, updateTodo, createTodo, Todo } from "@/lib/todos";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/ProtectedRoute";

// --- Components ---

function KpiTile({ 
  label, 
  value, 
  icon: Icon, 
  color, 
  trend,
  href,
  tooltip,
  children,
  className
}: { 
  label: string, 
  value: string | number, 
  icon: any, 
  color: "indigo" | "emerald" | "rose" | "amber", 
  trend?: "up" | "down" | "neutral",
  href?: string,
  tooltip?: string,
  children?: React.ReactNode,
  className?: string
}) {
  const colorStyles = {
    indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50/50 text-rose-600 border-rose-100",
    amber: "bg-amber-50/50 text-amber-600 border-amber-100",
  };

  const Content = (
    <div className={cn(
      "bg-white rounded-xl p-4 border border-zinc-200/60 shadow-sm flex flex-col h-full min-h-[100px] transition-all group relative overflow-hidden",
      href ? "hover:border-zinc-300 hover:shadow-md cursor-pointer" : "",
      className
    )}>
       {/* Background Decoration */}
       <div className={cn("absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-[0.03] transition-transform group-hover:scale-110", 
         color === 'indigo' ? 'bg-indigo-600' : 
         color === 'emerald' ? 'bg-emerald-600' : 
         color === 'rose' ? 'bg-rose-600' : 'bg-amber-600'
       )}></div>

       <div className="flex items-start justify-between relative z-10">
         <div className={cn("p-2 rounded-lg border", colorStyles[color])}>
           <Icon className="w-4 h-4" />
         </div>
         {trend && (
           <div className={cn("flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
             trend === 'up' ? "bg-emerald-50 text-emerald-700" :
             trend === 'down' ? "bg-rose-50 text-rose-700" : "bg-zinc-50 text-zinc-500"
           )}>
             {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingUp className="w-3 h-3 rotate-180" /> : null}
             {trend === 'up' ? '+2.4%' : trend === 'neutral' ? '-' : '-1.1%'}
           </div>
         )}
       </div>
       <div className="relative z-10 mt-4 flex-1">
         <div className="flex items-center gap-1.5">
            <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-wide">{label}</p>
            {tooltip && (
               <div className="group/tooltip relative">
                 <AlertCircle className="w-3 h-3 text-zinc-300 cursor-help" />
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                   {tooltip}
                 </div>
               </div>
            )}
         </div>
         <h3 className="text-2xl font-bold font-oswald text-zinc-900 tracking-tight mt-0.5">{value}</h3>
         {children}
       </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{Content}</Link>;
  }
  return Content;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 flex flex-col gap-6 animate-pulse">
       <div className="h-8 w-48 bg-zinc-200 rounded-lg"></div>
       <div className="grid grid-cols-4 gap-4">
         {[1,2,3,4].map(i => <div key={i} className="h-[100px] bg-zinc-200 rounded-xl"></div>)}
       </div>
       <div className="grid grid-cols-12 gap-6 flex-1">
         <div className="col-span-8 bg-zinc-200 rounded-xl h-full min-h-[400px]"></div>
         <div className="col-span-4 flex flex-col gap-4">
            <div className="h-[200px] bg-zinc-200 rounded-xl"></div>
            <div className="h-[200px] bg-zinc-200 rounded-xl"></div>
         </div>
       </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() 
    : "JD";
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [recentActivity, setRecentActivity] = useState<TimelineEvent[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoInput, setNewTodoInput] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Notification States
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadList, setUnreadList] = useState<Notification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  // Alerts State
  const [desktopAlertsEnabled, setDesktopAlertsEnabled] = useState(false);

  // Ref to prevent double-fetch in Strict Mode
  const initialized = useRef(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [followUpsData, timelineData, unreadCountData, unreadListData, todosData] = await Promise.all([
          getAllFollowUps({ limit: 1000 }), // Increased limit for accurate KPIs
          getEventTimeline({ limit: 20 }), // Recent activity
          getUnreadCount(),
          getUnreadNotifications(),
          listTodos(format(new Date(), "yyyy-MM-dd")) // Fetch today's todos (Local Time)
        ]);

        const allFollowUps = followUpsData.followups;
        setFollowUps(allFollowUps);
        setRecentActivity(timelineData.events);
        setUnreadCount(unreadCountData);
        setUnreadList(unreadListData);
        setTodos(todosData);

        // --- Chart Data: Daily Trend (Last 14 Days) ---
        const today = new Date();
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (13 - i));
          return d.toISOString().split('T')[0];
        });

        const dailyData = last14Days.map(dateStr => {
          // Created per day
          const createdCount = allFollowUps.filter(f => f.createdAt && f.createdAt.startsWith(dateStr)).length;
          // Completed per day
          const completedCount = allFollowUps.filter(f => f.status === 'DONE' && f.completedAt && f.completedAt.startsWith(dateStr)).length;
          
          return {
            date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: dateStr,
            created: createdCount,
            completed: completedCount
          };
        });
        setChartData(dailyData);
        
        // check permission
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          setDesktopAlertsEnabled(true);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    if (!initialized.current) {
      initialized.current = true;
      fetchData();
    }
  }, []);

  // --- Handlers ---
  
  const handleQuickAddTodo = async () => {
    if (!newTodoInput.trim()) return;
    
    try {
      setIsAddingTodo(true);
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const newTodo = await createTodo({
        title: newTodoInput,
        forDate: todayStr,
      });
      
      setTodos(prev => [newTodo, ...prev]);
      setNewTodoInput("");
      toast.success("Todo added");
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error("Failed to add todo");
    } finally {
      setIsAddingTodo(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setUnreadCount(0);
      setUnreadList([]);
      toast.success("All notifications marked as read");
    } catch (e) {
      toast.error("Failed to mark notifications read");
    }
  };

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await markNotificationRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setUnreadList(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAlerts = async () => {
    if (desktopAlertsEnabled) {
      // Cannot revoke permission programmatically in most browsers, just disable logic if we had it
      // For now, assume state tracks permission mainly.
      toast.info("To disable alerts, please reset permissions in your browser settings.");
      return;
    }
    
    if (typeof Notification === 'undefined') {
      toast.error("This browser does not support desktop notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setDesktopAlertsEnabled(true);
      toast.success("Desktop alerts enabled");
      new Notification("Alerts Enabled", { body: "You will now receive desktop notifications." });
    } else {
      setDesktopAlertsEnabled(false);
      toast.error("Permission denied. Please enable notifications in your browser settings.");
    }
  };

  const handleMarkDone = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markDone(id);
      toast.success("Marked as done");
      // Optimistic update
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'DONE', completedAt: new Date().toISOString() } : f));
    } catch (error) {
       toast.error("Failed to update status");
    }
  };

  const handleSnooze = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await snoozeFollowUp(id, 24 * 60); // Snooze for 1 day
      toast.success("Snoozed for 1 day");
      setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status: 'SNOOZED' } : f));
    } catch (error) {
       toast.error("Failed to snooze");
    }
  };

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const newStatus = todo.status === "DONE" ? "PENDING" : "DONE";
      // Optimistic update
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
      
      await updateTodo(todo.id, { status: newStatus });
      toast.success(newStatus === "DONE" ? "Todo completed" : "Todo reopened");
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      toast.error("Failed to update todo");
      // Revert on failure
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: todo.status } : t));
    }
  };

  // --- Render Helpers ---
  const formatActivity = (event: TimelineEvent) => {
    let title = "Activity Recorded";
    let subtitle = event.message || event.type || "No details";
    let icon = Activity;
    let color = "text-zinc-500 bg-zinc-100";

    if (event.type === 'CREATED') {
      title = "New Follow-up";
      subtitle = `Created by ${user?.name || 'User'}`;
      icon = Plus;
      color = "text-indigo-600 bg-indigo-50";
    } else if (event.type === 'DONE') {
      title = "Task Completed";
      subtitle = "Marked as done";
      icon = CheckCircle2;
      color = "text-emerald-600 bg-emerald-50";
    } else if (event.type === 'SNOOZED') {
      title = "Task Snoozed";
      icon = Clock;
      color = "text-amber-600 bg-amber-50";
    } else if (event.type === 'REMINDER_SENT') {
       title = "Reminder Sent";
       icon = Bell;
       color = "text-indigo-600 bg-indigo-50/50";
    } else if (event.type === 'ESCALATED') {
       title = "Escalated";
       subtitle = "Priority level increased";
       icon = TrendingUp;
       color = "text-rose-600 bg-rose-50";
    }

    // Attempt to make message human readable if it's raw
    if (subtitle.includes("ignoreCount=") || subtitle.includes("repeat=")) {
       subtitle = "System automated action";
    }
    
    return { title, subtitle, icon, color };
  };


  if (loading) return <LoadingSkeleton />;

  // --- Metrics Calculation ---
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const completedFollowUps = followUps.filter(f => f.status === 'DONE');
  const completionRate = followUps.length > 0 ? Math.round((completedFollowUps.length / followUps.length) * 100) : 0;

  const activePending = followUps.filter(f => 
    f.status !== 'DONE' && 
    f.status !== 'CANCELLED' && 
    (f.isActive !== false) && 
    (!f.dueAt || new Date(f.dueAt) > now)
  );

  const overdueItems = followUps.filter(f => 
    f.status !== 'DONE' && 
    f.status !== 'CANCELLED' && 
    (f.isActive !== false) && 
    f.dueAt && new Date(f.dueAt) < now
  );

  const dueThisWeekItems = followUps.filter(f => {
     if (f.status === 'DONE' || f.status === 'CANCELLED') return false;
     if (!f.dueAt) return false;
     const d = new Date(f.dueAt);
     return d >= now && d <= oneWeekFromNow;
  });

  const dueSoonList = [...dueThisWeekItems]
    .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
    .slice(0, 5);

  const overdueList = [...overdueItems]
    .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
    .slice(0, 5);


  return (
    <div className="h-screen overflow-hidden flex flex-col bg-zinc-50/50 font-lato">
      <div className="max-w-[1600px] w-full mx-auto px-6 pt-4 pb-2 flex-1 flex flex-col min-h-0 gap-4">
        
        {/* Row 1: Header + KPI Grid */}
        <div className="flex-none space-y-3">
          <div className="flex md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-oswald text-zinc-900 tracking-tight flex items-center gap-2">
                Dashboard
                
              </h1>
              <p className="text-zinc-500 text-[10px] mt-0.5">Welcome back, {user?.name}.</p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-4">
               
               {/* Notification Bell */}
               <NotificationBell />

               <div className="h-6 w-px bg-zinc-200" />
               
               {/* Profile */}
               <Link href="/settings">
                 <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white cursor-pointer hover:opacity-90 transition-opacity">
                   {initials}
                 </div>
               </Link>
            </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiTile 
              label="Completion" 
              value={`${completionRate}%`} 
              icon={CheckCircle2} 
              color="emerald"
              trend="up"
              tooltip="Percentage of total tasks marked as done"
              className="h-[180px]"
            >
               <div className="mt-4 space-y-2">
                 <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${completionRate}%` }}
                    />
                 </div>
                 <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500 font-medium">Progress</span>
                    <span className="text-zinc-900 font-bold">{completedFollowUps.length} / {followUps.length} Tasks</span>
                 </div>
               </div>
            </KpiTile>

            <KpiTile 
              label="Pending" 
              value={activePending.length} 
              icon={Clock} 
              color="indigo"
              trend="neutral"
              tooltip="Active tasks that are not done"
              href="/followups?status=PENDING"
              className="h-[180px]"
            >
               {activePending.length > 0 && (
                 <div className="mt-2 space-y-1.5 border-t border-indigo-100 pt-2">
                    {activePending.slice(0, 2).map(f => (
                      <div key={f.id} className="flex items-start justify-between group/item">
                         <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-medium text-zinc-900 truncate">{f.title}</p>
                            <p className="text-[9px] text-zinc-400 truncate">{f.target || "No target"}</p>
                         </div>
                         <span className="text-[9px] font-bold text-indigo-500 whitespace-nowrap ml-2">
                            {f.dueAt ? new Date(f.dueAt).toLocaleDateString(undefined, {month:'numeric', day:'numeric'}) : '-'}
                         </span>
                      </div>
                    ))}
                    {activePending.length > 2 && (
                      <p className="text-[9px] text-indigo-400 font-medium">+ {activePending.length - 2} more</p>
                    )}
                 </div>
               )}
            </KpiTile>

             <KpiTile 
               label="Overdue" 
               value={overdueItems.length} 
               icon={AlertCircle} 
               color="rose"
               trend={overdueItems.length > 0 ? "down" : "up"}
               tooltip="Tasks past their due date"
               href="/followups?status=OVERDUE"
               className="h-[180px]"
             >
                {overdueItems.length > 0 && (
                  <div className="mt-2 space-y-1.5 border-t border-rose-100 pt-2">
                     {overdueItems.slice(0, 2).map(f => (
                       <div key={f.id} className="flex items-start justify-between group/item">
                          <div className="min-w-0 flex-1">
                             <p className="text-[10px] font-medium text-zinc-900 truncate">{f.title}</p>
                             {f.target && <p className="text-[9px] text-zinc-400 truncate">{f.target}</p>}
                          </div>
                          <span className="text-[9px] font-bold text-rose-500 whitespace-nowrap ml-2">
                             {new Date(f.dueAt!).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}
                          </span>
                       </div>
                     ))}
                     {overdueItems.length > 2 && (
                       <p className="text-[9px] text-rose-400 font-medium">+ {overdueItems.length - 2} more</p>
                     )}
                  </div>
                )}
             </KpiTile>
             
             <KpiTile 
               label="Due This Week" 
               value={dueThisWeekItems.length} 
               icon={Calendar} 
               color="amber"
               trend="neutral"
               tooltip="Tasks due in the next 7 days"
               className="h-[180px]"
             >
                {dueThisWeekItems.length > 0 && (
                  <div className="mt-2 space-y-1.5 border-t border-amber-100 pt-2">
                     {dueThisWeekItems.slice(0, 2).map(f => (
                       <div key={f.id} className="flex items-start justify-between group/item">
                          <div className="min-w-0 flex-1">
                             <p className="text-[10px] font-medium text-zinc-900 truncate">{f.title}</p>
                             {f.target && <p className="text-[9px] text-zinc-400 truncate">{f.target}</p>}
                          </div>
                          <span className="text-[9px] font-bold text-amber-500 whitespace-nowrap ml-2">
                             {new Date(f.dueAt!).toLocaleDateString(undefined, {weekday: 'short'})}
                          </span>
                       </div>
                     ))}
                     {dueThisWeekItems.length > 2 && (
                       <p className="text-[9px] text-amber-400 font-medium">+ {dueThisWeekItems.length - 2} more</p>
                     )}
                  </div>
                )}
             </KpiTile>
          </div>

        {/* Row 2: Chart & Sidebar */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">
          
          {/* Main Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-zinc-200/60 shadow-sm flex flex-col min-h-0 overflow-hidden h-full">
             <div className="p-3 border-b border-zinc-50 flex items-center justify-between shrink-0">
               <div>
                 <h3 className="text-sm font-bold text-zinc-900">Activity Trend</h3>
                 <div className="flex items-center gap-2 mt-0.5">
                   <p className="text-[10px] text-zinc-500">Last 14 days</p>
                   {/* ... stats ... */}
                 </div>
               </div>
               <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Created
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
                  </div>
               </div>
             </div>
             
             <div className="flex-1 w-full min-h-0 p-2">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: '8px', fontSize: '11px' }}
                      cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="created" name="Created" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-full">
             
             {/* Quick Actions */}
             <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-3 flex flex-col justify-center gap-2 shrink-0">
                 <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider mb-1">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <Link href="/followups/new" className="col-span-2">
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-1.5 group">
                        <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> New Follow-up
                      </button>
                    </Link>
                    <Link href="/templates">
                      <button className="w-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                        <Layout className="w-3.5 h-3.5 text-zinc-400" /> Templates
                      </button>
                    </Link>
                    <Link href="/timeline">
                      <button className="w-full bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                        <Activity className="w-3.5 h-3.5 text-zinc-400" /> Timeline
                      </button>
                    </Link>
                 </div>
             </div>

             {/* Daily Todos */}
             <div className="flex-1 bg-white rounded-xl border border-zinc-200/60 shadow-sm flex flex-col overflow-hidden min-h-0">
                <div className="p-3 border-b border-zinc-50 flex items-center justify-between shrink-0">
                   <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-zinc-50">
                         <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <h3 className="text-xs font-bold text-zinc-900">Daily Todos</h3>
                   </div>
                   <Link href="/todos" className="text-[10px] text-indigo-600 font-medium hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-colors">View All</Link>
                </div>
                
                {/* Quick Add Input */}
                <div className="p-3 pb-0 shrink-0">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Add a new todo..." 
                      className="w-full text-xs pl-3 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                      value={newTodoInput}
                      onChange={(e) => setNewTodoInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTodo()}
                      disabled={isAddingTodo}
                    />
                    <button 
                      onClick={handleQuickAddTodo}
                      disabled={isAddingTodo || !newTodoInput.trim()}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-0 md:p-3 custom-scrollbar">
                   {todos.length > 0 ? (
                     <div className="flex flex-col gap-2">
                        {todos.map(todo => (
                          <div key={todo.id} className={cn(
                             "p-2.5 rounded-lg border border-zinc-100 bg-white hover:bg-zinc-50/50 transition-all flex items-start gap-3 group relative select-none",
                             todo.status === 'DONE' && "bg-zinc-50/30"
                          )}>
                             <button 
                                onClick={() => handleToggleTodo(todo)}
                                className={cn(
                                   "w-4 h-4 mt-0.5 rounded border flex items-center justify-center transition-all shrink-0 active:scale-95",
                                   todo.status === 'DONE' 
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200" 
                                      : "border-zinc-300 bg-white hover:border-indigo-400 hover:shadow-sm"
                                )}
                             >
                                {todo.status === 'DONE' && <Check className="w-3 h-3 stroke-[3]" />}
                             </button>
                             
                             <div className="min-w-0 flex-1">
                                <p className={cn(
                                   "text-[11px] font-medium text-zinc-900 truncate transition-all", 
                                   todo.status === 'DONE' && "line-through text-zinc-400"
                                )}>
                                   {todo.title}
                                </p>
                                {todo.notes && <p className="text-[10px] text-zinc-400 truncate mt-0.5">{todo.notes}</p>}
                                
                                {todo.remindAt && (
                                   <div className={cn(
                                      "mt-1.5 text-[9px] font-medium inline-flex items-center gap-1 px-1.5 py-0.5 rounded border",
                                      todo.status === 'DONE' ? "text-zinc-300 border-zinc-100 bg-transparent" : "text-amber-600 bg-amber-50 border-amber-100"
                                   )}>
                                      <Clock className="w-2.5 h-2.5" />
                                      {new Date(todo.remindAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                   </div>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mb-2">
                           <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-zinc-600">No todos for today</p>
                        <p className="text-[10px] text-zinc-400 mt-1">Add a task above to get started!</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from "recharts";
import { 
  Calendar, 
  MoreHorizontal,
  ChevronDown,
  Plus,
  Link as LinkIcon,
  Sparkles,
  TrendingUp,
  Check,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { getAllFollowUps, FollowUp } from "@/lib/followups";
import { getEventTimeline, TimelineEvent } from "@/lib/timeline";
import { listTodos, updateTodo, createTodo, Todo } from "@/lib/todos";
import { getTemplates, Template } from "@/lib/templates";
import { getJiraTickets } from "@/lib/jira";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/components/ProtectedRoute";

// --- Components ---

import { Skeleton } from "boneyard-js/react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  
  // Data States
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [jiraData, setJiraData] = useState<{ isConnected: boolean; tickets: any[] }>({ isConnected: false, tickets: [] });
  
  const [newTodoInput, setNewTodoInput] = useState("");
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [mainChartData, setMainChartData] = useState<any[]>([]);
  
  const initialized = useRef(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [followUpsData, todosData, timelineData, templatesData, jiraRes] = await Promise.all([
          getAllFollowUps({ limit: 1000 }), 
          listTodos(format(new Date(), "yyyy-MM-dd")),
          getEventTimeline({ limit: 10 }),
          getTemplates(),
          getJiraTickets(1, 5).catch(() => null) // catch error if not configured
        ]);

        const allFollowUps = followUpsData.followups || [];
        setFollowUps(allFollowUps);
        setTodos(todosData || []);
        setTimelineEvents(timelineData?.events || []);
        setTemplates(templatesData || []);
        
        if (jiraRes && jiraRes.settings) {
           setJiraData({ isConnected: jiraRes.settings.isConnected, tickets: jiraRes.tickets || [] });
        }

        // Build chart: last 6 months ending at current month, year-aware
        const now = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Create a map keyed by "YYYY-MM" for accuracy across years
        const monthMap = new Map<string, number>();
        allFollowUps.forEach(f => {
           if (f.createdAt) {
             const d = new Date(f.createdAt);
             const key = `${d.getFullYear()}-${d.getMonth()}`;
             monthMap.set(key, (monthMap.get(key) || 0) + 1);
           }
        });
        
        // Generate the last 6 months dynamically
        const chartMonths: { month: string; value: number }[] = [];
        for (let i = 5; i >= 0; i--) {
           const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
           const key = `${d.getFullYear()}-${d.getMonth()}`;
           chartMonths.push({
              month: monthNames[d.getMonth()],
              value: monthMap.get(key) || 0,
           });
        }
        
        setMainChartData(chartMonths);
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

  const handleToggleTodo = async (todo: Todo) => {
    try {
      const newStatus = todo.status === "DONE" ? "PENDING" : "DONE";
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: newStatus } : t));
      
      await updateTodo(todo.id, { status: newStatus });
      toast.success(newStatus === "DONE" ? "Todo completed" : "Todo reopened");
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      toast.error("Failed to update todo");
      setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, status: todo.status } : t));
    }
  };
  
  // We no longer return early for loading, we wrap the main return instead.

  // --- Metrics Calculation ---
  const now = new Date();
  const completedFollowUps = followUps.filter(f => f.status === 'DONE');
  const activePending = followUps.filter(f => f.status !== 'DONE' && f.status !== 'CANCELLED' && (!f.dueAt || new Date(f.dueAt) > now));
  const overdueItems = followUps.filter(f => f.status !== 'DONE' && f.status !== 'CANCELLED' && f.dueAt && new Date(f.dueAt) < now);

  const total = followUps.length || 1; // avoid div by 0
  const completedPct = Math.round((completedFollowUps.length / total) * 100);

  // Priority Breakdown for active pending tasks
  const highPriority = activePending.filter(f => f.priority === 'HIGH');
  const mediumPriority = activePending.filter(f => f.priority === 'MEDIUM');
  const lowPriority = activePending.filter(f => f.priority === 'LOW' || !f.priority); // default to low if null
  
  const activeTotal = activePending.length || 1;
  const highPct = Math.round((highPriority.length / activeTotal) * 100);
  const mediumPct = Math.round((mediumPriority.length / activeTotal) * 100);
  const lowPct = Math.round((lowPriority.length / activeTotal) * 100);

  const dueToday = activePending.filter(f => {
    if (!f.dueAt) return false;
    const d = new Date(f.dueAt);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const dueThisWeek = activePending.filter(f => {
    if (!f.dueAt) return false;
    const d = new Date(f.dueAt);
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d > now && d <= oneWeek;
  });

  const urgencyTotal = (overdueItems.length + dueToday.length + dueThisWeek.length) || 1;
  const overduePct = Math.round((overdueItems.length / urgencyTotal) * 100);
  const todayPct = Math.round((dueToday.length / urgencyTotal) * 100);
  const weekPct = Math.round((dueThisWeek.length / urgencyTotal) * 100);

  return (
    <Skeleton name="dashboard-page" loading={loading}>
    <div className="min-h-screen bg-white">
    <div className="flex flex-col font-sans w-full max-w-[1300px] mx-auto px-4 md:px-8 pt-6 pb-12 gap-8 relative z-10">
        
      {/* Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 shadow-sm border border-black/5 mb-2"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:px-10 md:py-12">
           <div className="flex flex-col gap-3 max-w-xl">
               <div className="flex items-center gap-3 justify-center md:justify-start">
                 <h1 className="text-3xl md:text-[44px] font-black text-white tracking-tight drop-shadow-sm uppercase mb-1">
                    OVERVIEW
                 </h1>
                 
              </div>
              <p className="text-[14px] md:text-[15px] text-white/95 leading-relaxed font-medium drop-shadow-sm max-w-[600px] mb-2 text-center md:text-left">
                 Your command center. Get a high-level summary of your active follow-ups, priorities, and upcoming tasks.
              </p>
              <div className="flex justify-center md:justify-start">
                 <Link href="/followups/new">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-900 hover:bg-zinc-100 text-[14px] font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer">
                       <Plus className="w-[18px] h-[18px]" /> New Follow-up
                    </button>
                 </Link>
              </div>
           </div>
           
           {/* Decorative UI Element: Stacked Dashboard Cards */}
           <div className="shrink-0 hidden md:flex relative">
              <div className="relative w-64 h-48">
                 {/* Back blurred card */}
                 <div className="absolute top-0 right-0 w-52 h-40 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 z-10 p-6">
                    <div className="flex items-center gap-4 mb-5">
                       <div className="w-8 h-8 rounded-full bg-white/40 shrink-0" />
                       <div className="w-24 h-3 bg-white/30 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-6 h-6 rounded-md bg-white/40 shrink-0" />
                       <div className="w-16 h-3 bg-white/30 rounded-full" />
                    </div>
                 </div>
                 
                 {/* Front solid card */}
                 <div className="absolute top-6 right-8 w-56 h-44 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-20 p-6 flex flex-col gap-5">
                    {/* Mini Pie Chart Ring */}
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full border-[5px] border-indigo-500 border-r-indigo-100 shrink-0 transform -rotate-45" />
                       <div className="flex flex-col gap-2 w-full">
                          <div className="w-16 h-3 bg-zinc-200 rounded-full" />
                          <div className="w-12 h-2.5 bg-zinc-100 rounded-full" />
                       </div>
                    </div>
                    
                    {/* Data Rows */}
                    <div className="flex items-center gap-4 opacity-80 mt-2">
                       <div className="w-6 h-6 rounded-md bg-emerald-400/20 flex items-center justify-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                       </div>
                       <div className="w-20 h-2.5 bg-zinc-100 rounded-full" />
                    </div>
                    <div className="flex items-center gap-4 opacity-80">
                       <div className="w-6 h-6 rounded-md bg-blue-400/20 flex items-center justify-center shrink-0">
                          <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                       </div>
                       <div className="w-14 h-2.5 bg-zinc-100 rounded-full" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Main Content Area (Chart + Sides) */}
      <div className="grid grid-cols-12 gap-6 mt-4">
         
         {/* Main Chart Section (8 cols) */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="col-span-12 xl:col-span-8 bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col min-h-[480px]"
         >
            <div className="flex items-start mb-8">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Follow-ups Performance</h2>
            </div>

            {/* Stat Row - Real Data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
               <div className="border-r border-zinc-100 pr-2 md:pr-4">
                  <p className="text-[12px] font-medium text-zinc-400 mb-2">Total Created</p>
                  <p className="text-[24px] md:text-[28px] font-semibold text-zinc-800">{followUps.length}</p>
               </div>
               <div className="md:border-r border-zinc-100 px-2 md:px-4">
                  <p className="text-[12px] font-medium text-zinc-400 mb-2">Active Pending</p>
                  <p className="text-[24px] md:text-[28px] font-semibold text-zinc-800">{activePending.length}</p>
               </div>
               <div className="border-r border-zinc-100 md:px-4 pr-2 mt-4 md:mt-0">
                  <p className="text-[12px] font-medium text-zinc-900 mb-2 font-semibold">Completed</p>
                  <p className="text-[24px] md:text-[28px] font-semibold text-zinc-900">{completedFollowUps.length}</p>
               </div>
               <div className="md:pl-4 pl-2 mt-4 md:mt-0">
                  <p className="text-[12px] font-medium text-zinc-400 mb-2">Overdue Tasks</p>
                  <p className="text-[24px] md:text-[28px] font-semibold text-zinc-400">{overdueItems.length}</p>
               </div>
            </div>

            <div className="flex-1 w-full relative z-10 mt-auto">
               <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mainChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={0} barCategoryGap="20%">
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 500 }}
                    />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e4e4e7', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', padding: '8px 12px' }}
                      itemStyle={{ color: '#18181b', fontSize: '13px', fontWeight: 600 }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
                       {mainChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === mainChartData.length - 1 ? '#2563eb' : 'url(#barGradient)'} /> 
                       ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Side Panel (4 cols) - Split into two stacked cards */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="col-span-12 xl:col-span-4 flex flex-col gap-6"
         >
            {/* Top Card: Active Pipeline */}
            <div className="bg-white rounded-[32px] p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col justify-between">
               <div className="flex items-start mb-4">
                  <h2 className="text-[18px] font-semibold text-zinc-900 tracking-tight">Active Pipeline</h2>
               </div>
               
               <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-[40px] font-medium text-zinc-900 tracking-tight leading-none">{activePending.length}</h3>
                  <div className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[11px] font-bold flex items-center mt-2">
                     <TrendingUp className="w-3 h-3 mr-1" /> Pending
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-medium text-zinc-500">High Priority</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{highPriority.length}</p>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${highPct}%` }}>
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, white 5px, white 10px)' }}></div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-medium text-zinc-500">Medium Priority</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{mediumPriority.length}</p>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${mediumPct}%` }}>
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, white 5px, white 10px)' }}></div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-medium text-zinc-500">Low Priority</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{lowPriority.length}</p>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${lowPct}%` }}>
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, white 5px, white 10px)' }}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom Card: Urgency Status */}
            <div className="bg-white rounded-[32px] p-6 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col justify-between">
               <div className="flex justify-between items-start mb-4">
                  <h2 className="text-[18px] font-semibold text-zinc-900 tracking-tight">Urgency Overview</h2>
                  <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                     <Clock className="w-4 h-4 text-zinc-400" />
                  </div>
               </div>
               
               <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-[40px] font-medium text-zinc-900 tracking-tight leading-none">{overdueItems.length}</h3>
                  <div className="bg-rose-50 text-rose-600 px-2 py-1 rounded-full text-[11px] font-bold flex items-center mt-2">
                     Overdue
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-medium text-zinc-500">Overdue Items</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{overdueItems.length}</p>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${overduePct}%` }}>
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, white 5px, white 10px)' }}></div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-medium text-zinc-500">Due Today</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{dueToday.length}</p>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${todayPct}%` }}>
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, white 5px, white 10px)' }}></div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <div className="flex justify-between items-end mb-1">
                        <p className="text-[13px] font-medium text-zinc-500">Due This Week</p>
                        <p className="text-[13px] font-semibold text-zinc-900">{dueThisWeek.length}</p>
                     </div>
                     <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full relative overflow-hidden transition-all duration-1000" style={{ width: `${weekPct}%` }}>
                           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, white 5px, white 10px)' }}></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Bottom Row - Domain Specific Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
         
         {/* 1. Recent Activity Timeline */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-[32px] p-8 border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[320px] flex flex-col"
         >
            <div className="flex items-start mb-6">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Recent Activity</h2>
            </div>
            
            <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar pr-2">
               {timelineEvents.length > 0 ? (
                  <div className="flex flex-col">
                     {timelineEvents.map((event, index) => {
                        const isLast = index === timelineEvents.length - 1;
                        const eventType = (event.type || "").toLowerCase();
                        
                        // Pick icon and color based on event type
                        let IconToUse = Clock;
                        let bgClass = "bg-zinc-100 text-zinc-500";
                        if (eventType.includes("complete") || eventType.includes("done")) {
                           IconToUse = Check;
                           bgClass = "bg-emerald-100 text-emerald-600";
                        } else if (eventType.includes("create") || eventType.includes("new")) {
                           IconToUse = Plus;
                           bgClass = "bg-blue-100 text-blue-600";
                        } else if (eventType.includes("alert") || eventType.includes("escalate")) {
                           IconToUse = Clock; // Reusing clock, or could use alert
                           bgClass = "bg-rose-100 text-rose-600";
                        }

                        return (
                           <div key={event.id} className="flex gap-4 group cursor-pointer">
                              <div className="flex flex-col items-center">
                                 <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110", bgClass)}>
                                    <IconToUse className="w-4 h-4" />
                                 </div>
                                 {!isLast && <div className="w-[2px] h-full bg-zinc-100 my-1 group-hover:bg-zinc-200 transition-colors" />}
                              </div>
                              <div className={cn("pb-6 flex-1", isLast && "pb-2")}>
                                 <p className="text-[14px] font-semibold text-zinc-800 leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                                    {event.message || event.type || "System Activity"}
                                 </p>
                                 <p className="text-[12px] font-medium text-zinc-500">
                                    {event.createdAt ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }) : "Unknown time"}
                                 </p>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-60">
                     <Clock className="w-8 h-8 text-zinc-400 mb-3" />
                     <p className="text-[14px] font-medium text-zinc-500">No recent activity</p>
                  </div>
               )}
            </div>
         </motion.div>

         {/* 2. Jira Status */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-[32px] p-8 h-[320px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group"
         >
            {/* Subtle background watermark */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] group-hover:scale-105 transition-all duration-700">
               <Briefcase className="w-64 h-64" />
            </div>

            <div className="flex justify-between items-start relative z-10 mb-6">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Jira Integration</h2>
               <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                  <Briefcase className="w-5 h-5 text-zinc-400" />
               </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
               {jiraData.isConnected ? (
                  <div className="bg-zinc-50/60 border border-zinc-100/80 rounded-3xl p-6 flex flex-col items-center text-center shadow-sm backdrop-blur-sm">
                     <div className="flex items-center gap-2 mb-4 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/50">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[12px] font-bold uppercase tracking-wider">Connected</span>
                     </div>
                     <p className="text-[52px] font-black text-zinc-900 leading-none tracking-tight mb-1">{jiraData.tickets.length}</p>
                     <p className="text-[13px] font-semibold text-zinc-500">Open Tickets Imported</p>
                  </div>
               ) : (
                  <div className="flex flex-col items-start bg-zinc-50/60 border border-zinc-100/80 rounded-3xl p-6 shadow-sm backdrop-blur-sm">
                     <div className="flex items-center gap-2 mb-3 bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-zinc-200/50">
                        <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
                        <span className="text-[12px] font-bold uppercase tracking-wider">Not Connected</span>
                     </div>
                     <p className="text-[13px] text-zinc-600 mb-5 leading-relaxed font-medium">Sync your Jira board to automate follow-ups on stalled tickets.</p>
                     <button className="text-[13px] font-bold bg-zinc-900 text-white px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors w-full shadow-sm active:scale-95 cursor-pointer">
                        Connect Jira
                     </button>
                  </div>
               )}
            </div>
         </motion.div>

         {/* 3. Daily Todos */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-[32px] p-8 h-[320px] flex flex-col border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
         >
            <div className="flex items-start mb-6">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Daily Todos</h2>
            </div>

            {/* Add Todo Input */}
            <div className="mb-4 relative group/input">
              <input 
                type="text" 
                placeholder="What needs to be done?" 
                className="w-full text-[13px] pl-4 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-blue-500/50 focus:bg-white transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                value={newTodoInput}
                onChange={(e) => setNewTodoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAddTodo()}
                disabled={isAddingTodo}
              />
              <button 
                onClick={handleQuickAddTodo}
                disabled={isAddingTodo || !newTodoInput.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-blue-500 hover:bg-blue-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
               {todos.length > 0 ? (
                  <div className="flex flex-col gap-2">
                     {todos.map(todo => (
                        <div key={todo.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer group" onClick={() => handleToggleTodo(todo)}>
                           <button 
                              className={cn(
                                 "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0",
                                 todo.status === 'DONE' 
                                    ? "bg-blue-500 border-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.4)]" 
                                    : "border-zinc-300 group-hover:border-blue-400 text-transparent group-hover:text-blue-400"
                              )}
                           >
                              <Check className={cn("w-3 h-3 stroke-[3]", todo.status !== 'DONE' && "opacity-0 group-hover:opacity-100")} />
                           </button>
                           
                           <p className={cn(
                              "text-[13px] font-semibold transition-all flex-1 truncate", 
                              todo.status === 'DONE' ? "line-through text-zinc-400" : "text-zinc-700"
                           )}>
                              {todo.title}
                           </p>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-60">
                     <CheckCircle2 className="w-6 h-6 text-zinc-400 mb-2" />
                     <p className="text-[13px] font-medium text-zinc-500">You're all caught up!</p>
                  </div>
               )}
            </div>
         </motion.div>

      </div>
    </div>
    </div>
    </Skeleton>
  );
}

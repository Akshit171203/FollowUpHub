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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-transparent p-6 flex flex-col gap-6 animate-pulse w-full max-w-[1400px] mx-auto">
       <div className="h-12 w-64 bg-white rounded-xl shadow-sm"></div>
       <div className="grid grid-cols-12 gap-6 flex-1">
         <div className="col-span-12 xl:col-span-8 bg-white rounded-[32px] min-h-[450px] shadow-sm"></div>
         <div className="col-span-12 xl:col-span-4 bg-white rounded-[32px] min-h-[450px] shadow-sm"></div>
       </div>
    </div>
  );
}

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
  
  if (loading) return <LoadingSkeleton />;

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
    <div className="flex flex-col font-sans w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-12 gap-6 relative z-10">
        
      {/* Header Row */}
      <motion.div 
         initial={{ opacity: 0, y: -10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6, ease: "easeOut" }}
         className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2"
      >
         <div className="flex items-center gap-3">
            <h1 className="text-[40px] font-medium text-zinc-900 tracking-tight">
               Overview
            </h1>
            <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-colors">
               <LinkIcon className="w-4 h-4 text-zinc-500" />
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-2">
            <Link href="/followups/new">
               <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 hover:bg-black transition-all duration-200 cursor-pointer">
                  <Plus className="w-4 h-4 text-white" />
                  <span className="text-[14px] font-semibold">New Follow-up</span>
               </div>
            </Link>
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
            <div className="flex justify-between items-start mb-8">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Follow-ups Performance</h2>
               <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-zinc-400" />
               </div>
            </div>

            {/* Stat Row - Real Data */}
            <div className="grid grid-cols-4 gap-4 mb-10">
               <div className="border-r border-zinc-100 pr-4">
                  <p className="text-[12px] font-medium text-zinc-400 mb-2">Total Created</p>
                  <p className="text-[28px] font-semibold text-zinc-800">{followUps.length}</p>
               </div>
               <div className="border-r border-zinc-100 px-4">
                  <p className="text-[12px] font-medium text-zinc-400 mb-2">Active Pending</p>
                  <p className="text-[28px] font-semibold text-zinc-800">{activePending.length}</p>
               </div>
               <div className="border-r border-zinc-100 px-4">
                  <p className="text-[12px] font-medium text-zinc-900 mb-2 font-semibold">Successfully Completed</p>
                  <p className="text-[28px] font-semibold text-zinc-900">{completedFollowUps.length}</p>
               </div>
               <div className="pl-4">
                  <p className="text-[12px] font-medium text-zinc-400 mb-2">Overdue Tasks</p>
                  <p className="text-[28px] font-semibold text-zinc-400">{overdueItems.length}</p>
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
               <div className="flex justify-between items-start mb-4">
                  <h2 className="text-[18px] font-semibold text-zinc-900 tracking-tight">Active Pipeline</h2>
                  <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                     <MoreHorizontal className="w-4 h-4 text-zinc-400" />
                  </div>
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
                  <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
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
            <div className="flex justify-between items-start mb-6">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Recent Activity</h2>
               <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-zinc-400" />
               </div>
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
            className="bg-white rounded-[32px] p-8 h-[320px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between"
         >
            <div className="flex justify-between items-start">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Jira Integration</h2>
               <div className="w-9 h-9 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                  <Briefcase className="w-5 h-5 text-zinc-400" />
               </div>
            </div>
            
            <div className="mt-4 flex-1 flex flex-col justify-end">
               {jiraData.isConnected ? (
                  <>
                     <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[14px] font-semibold text-emerald-600">Connected & Synced</span>
                     </div>
                     <p className="text-[48px] font-medium text-zinc-900 leading-none">{jiraData.tickets.length}</p>
                     <p className="text-[14px] font-medium text-zinc-500 mt-2">Open tickets imported</p>
                  </>
               ) : (
                  <div className="flex flex-col items-start">
                     <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-300"></div>
                        <span className="text-[14px] font-semibold text-zinc-500">Not Connected</span>
                     </div>
                     <p className="text-[14px] text-zinc-600 mb-5 leading-relaxed">Sync your Jira board to automate follow-ups on stalled tickets seamlessly.</p>
                     <button className="text-[14px] font-semibold bg-zinc-900 text-white px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors w-full">
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
            <div className="flex justify-between items-start mb-6">
               <h2 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Daily Todos</h2>
               <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-zinc-400" />
               </div>
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
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-blue-500 hover:bg-blue-50 disabled:opacity-50 transition-colors"
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
  );
}

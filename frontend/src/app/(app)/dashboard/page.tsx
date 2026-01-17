"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
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
  ChevronDown
} from "lucide-react";

import { 
  getAllFollowUps, 
  FollowUp 
} from "@/lib/followups";
import { 
  getEventTimeline, 
  TimelineEvent 
} from "@/lib/timeline";
import { 
  getUnreadNotifications, 
  Notification 
} from "@/lib/notifications";
import { profile, logout, User } from "@/lib/auth";
import { cn } from "@/lib/utils";

// --- Premium Component: Sparkline (Mock SVG for visual polish) ---
function Sparkline({ color = "indigo", trend = "up" }: { color?: string, trend?: "up" | "down" | "flat" }) {
  const stroke = color === 'indigo' ? '#6366f1' : color === 'rose' ? '#f43f5e' : '#10b981';
  // Simple path depending on trend
  const d = trend === 'up' 
    ? "M1 18 L10 14 L20 16 L30 8 L40 10 L50 2" 
    : trend === 'down' 
    ? "M1 2 L10 6 L20 4 L30 12 L40 10 L50 18"
    : "M1 10 L10 8 L20 12 L30 8 L40 12 L50 10";

  return (
    <svg width="52" height="20" viewBox="0 0 52 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
      <path d={d} stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// --- Premium Component: KPI Tile ---
function KpiTile({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendLabel, 
  color = "indigo" 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  trend?: "up" | "down" | "neutral"; 
  trendLabel?: string;
  color?: "indigo" | "rose" | "emerald" | "amber";
}) {
  const colorMap = {
    indigo: "text-indigo-600 bg-indigo-50 ring-indigo-100",
    rose: "text-rose-600 bg-rose-50 ring-rose-100",
    emerald: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    amber: "text-amber-600 bg-amber-50 ring-amber-100",
  };
  
  return (
    <div className="group relative bg-white p-5 rounded-2xl border border-zinc-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.04)] hover:border-zinc-300/60 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center ring-1 inset ring-inset transition-colors", colorMap[color])}>
           <Icon className="w-5 h-5" />
        </div>
        {trend && (
           <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-5 right-5">
             <ArrowUpRight className="w-4 h-4 text-zinc-300" />
           </div>
        )}
      </div>
      
      <div>
        <p className="text-sm font-medium text-zinc-500 mb-1">{label}</p>
        <div className="flex items-end justify-between">
           <h3 className="text-3xl font-bold text-zinc-900 font-oswald tracking-tight">{value}</h3>
           <Sparkline color={color} trend={trend === 'down' ? 'down' : 'up'} />
        </div>
        
        {trendLabel && (
          <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-1.5 text-xs">
            <span className={cn(
              "font-semibold",
              trend === 'up' && "text-emerald-600",
              trend === 'down' && "text-rose-600",
              trend === 'neutral' && "text-zinc-500"
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
            </span>
            <span className="text-zinc-500 font-medium">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userData, followUpsData, timelineData] = await Promise.all([
          profile(),
          getAllFollowUps({ limit: 100 }),
          getEventTimeline({ limit: 20 })
        ]);

        setUser(userData.user);
        setFollowUps(followUpsData.followups);
        setTimeline(timelineData.events);

        // Process chart data: Last 7 days
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        const dailyData = last7Days.map(dateStr => {
          const count = timelineData.events.filter(e => e.createdAt?.startsWith(dateStr)).length;
          return {
            date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            activities: count,
            completed: Math.floor(count * 0.6) // Mock second line
          };
        });
        setChartData(dailyData);

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-600 border-r-transparent"></div>
          <p className="text-sm text-zinc-500 font-medium font-lato animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // --- Metrics Calculation ---
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const activeFollowUps = followUps.filter(f => f.status !== 'DONE' && f.status !== 'CANCELLED');
  const completedFollowUps = followUps.filter(f => f.status === 'DONE');
  const completionRate = followUps.length > 0 ? Math.round((completedFollowUps.length / followUps.length) * 100) : 0;
  const overdueCount = activeFollowUps.filter(f => f.dueAt && new Date(f.dueAt) < now).length;
  const dueThisWeekCount = activeFollowUps.filter(f => {
    if (!f.dueAt) return false;
    const d = new Date(f.dueAt);
    return d >= now && d <= oneWeekFromNow;
  }).length;
  const highPriority = activeFollowUps.filter(f => f.priority === 'HIGH');
  const upcomingDeadlines = activeFollowUps
    .filter(f => f.dueAt)
    .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
    .slice(0, 5);


  return (
    <div className="h-screen overflow-hidden flex flex-col bg-zinc-50/50 font-lato">
      <div className="max-w-[1400px] w-full mx-auto px-5 pt-4 pb-2 flex-1 flex flex-col min-h-0 gap-4">
        
        {/* Header & KPI Row Combined for Density */}
        <div className="flex-none space-y-3">
          <div className="flex md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-oswald text-zinc-900 tracking-tight flex items-center gap-2">
                Dashboard
                <div className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">Live</span>
                </div>
              </h1>
              <p className="text-zinc-500 text-[10px] mt-0.5">Welcome back, {user?.name}.</p>
            </div>
            <div className="flex items-center gap-2">
               <button className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg shadow-sm transition-colors">
                 Download Report
               </button>
            </div>
          </div>

          {/* Compact KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiTile 
              label="Completion" 
              value={`${completionRate}%`} 
              icon={CheckCircle2} 
              color="emerald"
              trend="up"
            />
            <KpiTile 
              label="Pending" 
              value={activeFollowUps.length} 
              icon={Clock} 
              color="indigo"
              trend="neutral"
            />
            <KpiTile 
              label="Overdue" 
              value={overdueCount} 
              icon={AlertCircle} 
              color="rose"
              trend={overdueCount > 0 ? "down" : "neutral"}
            />
            <KpiTile 
              label="Due Week" 
              value={dueThisWeekCount} 
              icon={Calendar} 
              color="amber"
              trend="up"
            />
          </div>
        </div>

        {/* Main Content: 3-Column Dense Grid (Fills remaining height) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">
          
          {/* Col 1: Chart (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-zinc-200/60 shadow-sm flex flex-col min-h-0">
             <div className="p-3 border-b border-zinc-50 flex items-center justify-between shrink-0">
               <div>
                 <h3 className="text-xs font-bold text-zinc-900">Activity Overview</h3>
                 <p className="text-[9px] text-zinc-500">Tasks created vs completed</p>
               </div>
               <select className="bg-zinc-50 border border-zinc-200 text-[9px] font-medium text-zinc-700 rounded-md px-1.5 py-0.5 outline-none">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
               </select>
             </div>

             <div className="flex-1 w-full min-h-0 p-3">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f4f4f5" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 500 }}
                      dy={5}
                    />
                    <YAxis 
                       axisLine={false}
                       tickLine={false}
                       tick={{ fill: '#a1a1aa', fontSize: 9 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '6px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: '6px', fontSize: '11px' }}
                      cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activities" 
                      stroke="#6366f1" 
                      strokeWidth={1.5}
                      fillOpacity={1} 
                      fill="url(#colorActivity)" 
                    />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>

          {/* Col 2: Upcoming Deadlines (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-zinc-200/60 shadow-sm flex flex-col min-h-0">
             <div className="p-3 border-b border-zinc-50 flex items-center justify-between shrink-0">
               <h3 className="text-xs font-bold text-zinc-900">Deadlines</h3>
               <Link href="/followups" className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-700">See All</Link>
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
               {upcomingDeadlines.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3">
                    <p className="text-[10px] text-zinc-400">No deadlines.</p>
                  </div>
               ) : upcomingDeadlines.map((f) => (
                 <div key={f.id} className="group p-2 rounded-lg hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-all cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-md flex flex-col items-center justify-center shrink-0 border",
                        f.dueAt && new Date(f.dueAt) < new Date() ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-zinc-50 border-zinc-100 text-zinc-600"
                      )}>
                        <span className="text-[8px] font-bold uppercase">{f.dueAt ? new Date(f.dueAt).toLocaleString('en-US', { month: 'short' }) : '-'}</span>
                        <span className="text-xs font-bold leading-none">{f.dueAt ? new Date(f.dueAt).getDate() : '?'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-zinc-900 truncate group-hover:text-indigo-600 transition-colors">{f.title}</p>
                        <p className="text-[9px] text-zinc-500 truncate mt-px">{f.target || 'No target'}</p>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Col 3: Actions & Priorty (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
             
             {/* Quick Actions (Compact) */}
             <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm p-3 shrink-0">
               <h3 className="text-[10px] font-bold text-zinc-900 mb-2 uppercase tracking-wider">Quick Actions</h3>
               <div className="space-y-1.5">
                 <Link href="/followups/new">
                   <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md text-[11px] font-semibold shadow-sm shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-1.5">
                     <Plus className="w-3 h-3" /> New Follow-up
                   </button>
                 </Link>
                 <div className="flex gap-1.5">
                   <Link href="/templates" className="flex-1">
                     <button className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 py-1.5 rounded-md text-[10px] font-bold transition-colors">
                       Templates
                     </button>
                   </Link>
                   <Link href="/timeline" className="flex-1">
                     <button className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 py-1.5 rounded-md text-[10px] font-bold transition-colors">
                       Timeline
                     </button>
                   </Link>
                 </div>
               </div>
             </div>

             {/* High Priority (Fill remaining height with scroll) */}
             <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="p-3 border-b border-zinc-50 shrink-0">
                  <h3 className="text-[11px] font-bold text-zinc-900 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div> High Priority
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
                  {highPriority.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-3">
                       <CheckCircle2 className="w-5 h-5 text-zinc-300 mb-1" />
                       <p className="text-[10px] text-zinc-900 font-medium">All clear!</p>
                       <p className="text-[9px] text-zinc-500">No high priority.</p>
                    </div>
                  ) : (
                    highPriority.map(f => (
                       <div key={f.id} className="p-2 hover:bg-rose-50/30 rounded-md border border-transparent hover:border-rose-100 transition-all cursor-pointer group">
                         <div className="flex items-start gap-2">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                            <div className="min-w-0">
                               <p className="text-[11px] font-semibold text-zinc-900 group-hover:text-rose-700 truncate">{f.title}</p>
                               <p className="text-[9px] text-zinc-500 truncate mt-px">Due {f.dueAt ? new Date(f.dueAt).toLocaleDateString() : 'ASAP'}</p>
                            </div>
                         </div>
                       </div>
                    ))
                  )}
                </div>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}

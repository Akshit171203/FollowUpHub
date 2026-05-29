"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  MoreVertical,
  User,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  CheckCircle2,
  Check,
  Clock,
  PauseCircle,
  Archive,
  Star,
  Pin,
  Hourglass,
  Flame,
  BellOff
} from "lucide-react";

import {
  getAllFollowUps,
  markDone,
  snoozeFollowUp,
  type FollowUp,
} from "@/lib/followups";

import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { FollowUpDetail } from "@/components/followups/FollowUpDetail";

// --- Types ---
type TabType = 'ALL' | 'OVERDUE' | 'PENDING' | 'SNOOZED' | 'COMPLETED';

// --- Helper Components ---

function FilterTab({ 
  label, 
  count, 
  isActive, 
  onClick,
  icon: Icon
}: { 
  label: string; 
  count: number; 
  isActive: boolean; 
  onClick: () => void;
  icon?: any;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-[13px] font-semibold select-none",
        isActive 
          ? "bg-[#3A3F47] text-white" 
          : "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
      )}
    >
      {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-zinc-500")} />}
      <span>{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center transition-colors",
        isActive ? "bg-[#25324B] text-blue-300" : "bg-[#272A29] text-zinc-400"
      )}>
        {count}
      </span>
    </button>
  );
}

function FollowUpCard({ 
  item, 
  onMarkDone, 
  onSnooze,
  onViewDetails 
}: { 
  item: FollowUp; 
  onMarkDone: (id: string) => void;
  onSnooze: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  const isDone = item.status === 'DONE';
  const priority = (item.priority || 'MEDIUM').toUpperCase();
  const isOverdue = item.dueAt && new Date(item.dueAt) < new Date() && !isDone;
  
  // Status and Priority colors
  const statusColor = isDone ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      item.status === 'SNOOZED' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      
  const priorityColor = priority === 'URGENT' || priority === 'HIGH' ? "text-red-400" :
                        priority === 'MEDIUM' ? "text-yellow-500" : "text-blue-400";
  
  return (
    <div 
      onClick={() => onViewDetails(item.id)}
      className="group relative bg-[#1A1D1C] border border-white/5 shadow-inner shadow-white/5 rounded-2xl p-5 hover:bg-[#202422] hover:border-white/10 transition-all duration-200 flex flex-col gap-4 cursor-pointer"
    >
      {/* Top Row: Title + Priority + Context Menu */}
      <div className="flex items-start justify-between gap-3">
         <div className="flex items-start gap-3 min-w-0">
             <div className="mt-0.5">
                 <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-4 h-4 shrink-0", priorityColor)}>
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v11zm0 0v7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
             </div>
             <h3 className="font-semibold text-zinc-100 tracking-wide leading-snug line-clamp-2 text-[15px] group-hover:text-blue-400 transition-colors">
                {item.title}
             </h3>
         </div>
         
         <div className="flex items-center shrink-0 -mt-1 -mr-1" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md text-zinc-500 hover:bg-white/10 hover:text-zinc-300 transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-zinc-800 bg-[#222524] text-zinc-200">
                <DropdownMenuItem onClick={() => onViewDetails(item.id)} className="rounded-lg hover:bg-white/5 focus:bg-white/5">View Details</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                {!isDone && (
                  <>
                    <DropdownMenuItem onClick={() => onSnooze(item.id)} className="rounded-lg hover:bg-white/5 focus:bg-white/5">
                      Snooze 1 Day
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkDone(item.id)} className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-400/10 rounded-lg">
                      Mark as Done
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </div>

      {/* Target / Assignee Line */}
      {item.target && (
         <div className="flex items-center gap-2 text-[13px] text-zinc-400 bg-black/20 self-start px-2.5 py-1 rounded-md border border-white/5 ml-7">
            <User className="w-3.5 h-3.5 opacity-70" />
            <span className="font-medium truncate max-w-[200px]">{item.target}</span>
         </div>
      )}

      {/* Micro-Badges Row */}
      <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 ml-7">
         {/* Status Badge */}
         <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border", statusColor)}>
             <span className="w-1.5 h-1.5 rounded-full bg-current" />
             <span className="capitalize">{item.status?.toLowerCase() || 'pending'}</span>
         </div>

         {/* Date Badge */}
         <div className={cn(
             "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border",
             isOverdue ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/5 text-zinc-300 border-white/5"
         )}>
            <Calendar className="w-3.5 h-3.5 opacity-80" />
            <span>{item.dueAt ? new Date(item.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due'}</span>
         </div>

         {/* Level Badge */}
         {item.escalationLevel && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
               <Flame className="w-3.5 h-3.5 opacity-80" />
               <span>Level {item.escalationLevel}</span>
            </div>
         )}

         {/* Ignores Badge */}
         {(item.ignoreCount !== undefined && item.ignoreCount > 0) && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-zinc-800 text-zinc-300 border border-white/5">
               <BellOff className="w-3.5 h-3.5 opacity-80" />
               <span>{item.ignoreCount} ignores</span>
            </div>
         )}
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function FollowUpsPage() {
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Dialog State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllFollowUps({ limit: 2000 }); 
      setAllItems(res.followups);
    } catch (e) {
      toast.error("Failed to load followups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkDone = async (id: string) => {
    try {
      await markDone(id);
      toast.success("Task completed");
      setAllItems(prev => prev.map(f => f.id === id ? { ...f, status: 'DONE', completedAt: new Date().toISOString() } : f));
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      await snoozeFollowUp(id, 24 * 60);
      toast.success("Snoozed for 1 day");
      setAllItems(prev => prev.map(f => f.id === id ? { ...f, status: 'SNOOZED' } : f));
    } catch (e) {
      toast.error("Failed to snooze");
    }
  };

  const handleViewDetails = (id: string) => {
      setSelectedId(id);
      setIsDialogOpen(true);
  };

  // --- Filtering Logic ---
  const filteredItems = useMemo(() => {
    let items = allItems;
    const now = new Date();

    // 1. Text Search
    if (searchQuery.trim()) {
       const q = searchQuery.toLowerCase();
       items = items.filter(i => 
         i.title.toLowerCase().includes(q) || 
         i.notes?.toLowerCase().includes(q) ||
         i.target?.toLowerCase().includes(q)
       );
    }

    // 2. Tab Filter
    switch (activeTab) {
      case 'OVERDUE':
        return items.filter(i => i.status !== 'DONE' && i.dueAt && new Date(i.dueAt) < now && i.status !== 'SNOOZED');
      case 'PENDING':
        return items.filter(i => i.status !== 'DONE' && i.status !== 'SNOOZED' && (!i.dueAt || new Date(i.dueAt) >= now));
      case 'SNOOZED':
        return items.filter(i => i.status === 'SNOOZED');
      case 'COMPLETED':
        return items.filter(i => i.status === 'DONE');
      case 'ALL':
      default:
        return items;
    }
  }, [allItems, activeTab, searchQuery]);

  // Apply secondary filters separately so count badges aren't affected by Priority Filter
  const finalizedItems = useMemo(() => {
    let items = filteredItems;
    if (priorityFilter) {
       items = items.filter(i => i.priority === priorityFilter);
    }
    return items;
  }, [filteredItems, priorityFilter]);

  // --- Counts ---
  const counts = useMemo(() => {
    const now = new Date();
    return {
      ALL: allItems.length,
      OVERDUE: allItems.filter(i => i.status !== 'DONE' && i.dueAt && new Date(i.dueAt) < now && i.status !== 'SNOOZED').length,
      PENDING: allItems.filter(i => i.status !== 'DONE' && i.status !== 'SNOOZED' && (!i.dueAt || new Date(i.dueAt) >= now)).length,
      SNOOZED: allItems.filter(i => i.status === 'SNOOZED').length,
      COMPLETED: allItems.filter(i => i.status === 'DONE').length,
    };
  }, [allItems]);

  return (
    <div className="md:h-screen min-h-[100dvh] flex flex-col bg-[#121413] relative overflow-hidden font-sans">
      
      {/* Dark Earthy Background Mesh matching reference */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-900/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-10 pb-6 relative z-10">
         <div className="flex flex-col gap-8 max-w-[1100px] mx-auto">
            {/* Combined Hero Banner with Title */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 p-6 md:p-8 shadow-lg border border-white/10">
               <div className="relative z-10 max-w-xl">
                  <h1 className="text-3xl md:text-[36px] font-extrabold text-white mb-2 tracking-tight">FOLLOW UPS</h1>
                  <p className="text-white/85 text-[15px] leading-relaxed max-w-lg font-medium mb-5">
                    Master your communications — track active discussions, set smart snooze reminders, and never let an important conversation slip through the cracks.
                  </p>
                  <Link href="/followups/new">
                     <button className="flex items-center gap-2 pl-5 pr-6 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl text-[14px] font-bold transition-all active:scale-95 shadow-md">
                        <Plus className="w-[18px] h-[18px]" /> Create follow-up
                     </button>
                  </Link>
               </div>
               
               {/* Decorative UI Element: Communication Cards */}
               <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-12">
                  <div className="relative w-40 h-32">
                     {/* Back blurred card */}
                     <div className="absolute top-2 right-0 w-32 h-24 bg-black/20 backdrop-blur-md rounded-xl shadow-xl border border-white/20 z-10 p-3 transform rotate-6">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-4 h-4 rounded-full bg-white/30" />
                           <div className="w-16 h-2 bg-white/20 rounded-full" />
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-white/30" />
                           <div className="w-12 h-2 bg-white/20 rounded-full" />
                        </div>
                     </div>
                     {/* Front solid card */}
                     <div className="absolute top-4 right-8 w-32 h-28 bg-[#1A1D1C] rounded-xl shadow-2xl border border-white/10 z-20 p-3 flex flex-col gap-3 transform -rotate-3">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                           </div>
                           <div className="w-16 h-2 bg-zinc-700 rounded-full" />
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                           <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />
                           <div className="w-12 h-2 bg-zinc-700 rounded-full" />
                        </div>
                        <div className="flex items-center gap-2 opacity-60">
                           <div className="w-4 h-4 rounded-full border-2 border-zinc-600" />
                           <div className="w-10 h-2 bg-zinc-700 rounded-full" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Controls Bar: Tabs & Search */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
               {/* Segmented Tabs */}
               <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto bg-[#181A19]/80 p-1.5 rounded-full border border-white/5">
                  <FilterTab 
                    label="All" 
                    count={counts.ALL} 
                    isActive={activeTab === 'ALL'} 
                    onClick={() => setActiveTab('ALL')}
                    icon={LayoutGrid} 
                  />
                  <FilterTab 
                    label="Overdue" 
                    count={counts.OVERDUE} 
                    isActive={activeTab === 'OVERDUE'} 
                    onClick={() => setActiveTab('OVERDUE')}
                    icon={Clock} 
                  />
                  <FilterTab 
                    label="Pending" 
                    count={counts.PENDING} 
                    isActive={activeTab === 'PENDING'} 
                    onClick={() => setActiveTab('PENDING')}
                    icon={CheckCircle2} 
                  />
                  <FilterTab 
                    label="Snoozed" 
                    count={counts.SNOOZED} 
                    isActive={activeTab === 'SNOOZED'} 
                    onClick={() => setActiveTab('SNOOZED')}
                    icon={PauseCircle} 
                  />
                   <FilterTab 
                    label="Completed" 
                    count={counts.COMPLETED} 
                    isActive={activeTab === 'COMPLETED'} 
                    onClick={() => setActiveTab('COMPLETED')}
                    icon={CheckCircle2} 
                  />
               </div>

               {/* Search & Utility */}
               <div className="flex items-center gap-3 w-full lg:w-auto pb-2 lg:pb-0 shrink-0">
                  <div className="relative group w-full lg:w-[220px]">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Search by title, target..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-11 pr-4 py-2.5 bg-[#181A19]/80 border border-transparent hover:border-white/5 rounded-full text-[14px] text-zinc-200 outline-none focus:border-white/20 transition-all font-medium placeholder:text-zinc-500"
                     />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm",
                        priorityFilter 
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" 
                          : "bg-[#181A19]/80 border border-transparent hover:border-white/5 text-zinc-400 hover:text-zinc-200"
                      )}>
                         <Filter className="w-4 h-4" /> 
                         {priorityFilter ? `${priorityFilter.charAt(0)}${priorityFilter.slice(1).toLowerCase()}` : "Filter"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#222524] border-white/5 text-zinc-200 rounded-xl">
                       <DropdownMenuItem onClick={() => setPriorityFilter(null)} className="rounded-lg hover:bg-white/5 focus:bg-white/5">
                          All Priorities
                       </DropdownMenuItem>
                       <DropdownMenuSeparator className="bg-white/5" />
                       <DropdownMenuItem onClick={() => setPriorityFilter('URGENT')} className="rounded-lg hover:bg-white/5 focus:bg-white/5 text-red-400">
                          Urgent
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setPriorityFilter('HIGH')} className="rounded-lg hover:bg-white/5 focus:bg-white/5 text-red-400">
                          High Priority
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setPriorityFilter('MEDIUM')} className="rounded-lg hover:bg-white/5 focus:bg-white/5 text-yellow-500">
                          Medium Priority
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setPriorityFilter('LOW')} className="rounded-lg hover:bg-white/5 focus:bg-white/5 text-blue-400">
                          Low Priority
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 md:px-8 pb-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent relative z-10">
         <div className="max-w-[1100px] mx-auto h-full">
         {finalizedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-600">
               <div className="w-20 h-20 bg-zinc-800/50 rounded-[24px] border border-white/5 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-zinc-500" />
               </div>
               <p className="text-xl font-bold text-zinc-300 tracking-tight">No items found</p>
               <p className="text-[15px] font-medium mt-1">Try adjusting your filters or search query.</p>
            </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-20">
              {finalizedItems.map(item => (
                <FollowUpCard 
                  key={item.id} 
                  item={item} 
                  onMarkDone={handleMarkDone}
                  onSnooze={handleSnooze}
                  onViewDetails={handleViewDetails}
                />
              ))}
           </div>
         )}
         </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="max-w-2xl bg-white dark:bg-zinc-950">
             <DialogTitle className="sr-only">Follow-up Details</DialogTitle>
             {selectedId && (
                 <FollowUpDetail 
                    id={selectedId} 
                    onClose={() => setIsDialogOpen(false)}
                    onUpdate={() => {
                        loadData(); 
                    }}
                 />
             )}
         </DialogContent>
      </Dialog>
    </div>
  );
}

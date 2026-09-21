"use client";

import { Suspense } from "react";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  BellOff,
  Send,
  Sparkles
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
import { AiQuickCreateDialog } from "@/components/followups/AiQuickCreateDialog";

import { Skeleton } from "boneyard-js/react";

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
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all text-[13px] font-semibold select-none border cursor-pointer snap-start",
        isActive 
          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
          : "bg-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-transparent"
      )}
    >
      {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-zinc-500")} />}
      <span>{label}</span>
      <span className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center transition-colors",
        isActive ? "bg-blue-200/50 text-blue-700" : "bg-zinc-100 text-zinc-500"
      )}>
        {count}
      </span>
    </button>
  );
}

function FollowUpCard({ item, onViewDetails, onMarkDone, onSnooze }: { 
  item: FollowUp, 
  onViewDetails: (id: string) => void,
  onMarkDone: (id: string) => void,
  onSnooze: (id: string) => void
}) {
  const isDone = item.status === 'DONE';
  const priority = (item.priority || 'MEDIUM').toUpperCase();
  const isOverdue = item.dueAt && new Date(item.dueAt) < new Date() && !isDone;
  
  // Minimalist status indicators
  const statusDot = isDone ? "bg-emerald-500" :
                    item.status === 'SNOOZED' ? "bg-amber-500" :
                    "bg-blue-500";
                      
  const priorityIconColor = priority === 'URGENT' || priority === 'HIGH' ? "text-zinc-700" :
                            priority === 'MEDIUM' ? "text-zinc-500" : "text-zinc-400";
  
  return (
    <div 
      onClick={() => onViewDetails(item.id)}
      className="group relative bg-white border border-zinc-200/80 shadow-sm rounded-xl p-4 md:p-5 hover:border-zinc-300 hover:shadow-md transition-all duration-200 flex flex-col gap-3 cursor-pointer"
    >
      {/* Top Row: Title + Context Menu */}
      <div className="flex items-start justify-between gap-3">
         <div className="flex items-start gap-3 min-w-0">
             <div className="mt-1">
                 <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-[14px] h-[14px] shrink-0", priorityIconColor)}>
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v11zm0 0v7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
             </div>
             <h3 className={cn("font-medium tracking-tight leading-snug line-clamp-2 text-[15px] transition-colors", isDone ? "text-zinc-400 line-through" : "text-zinc-900 group-hover:text-blue-600")}>
                {item.title}
             </h3>
         </div>
         
         <div className="flex items-center shrink-0 -mt-1 -mr-1" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-all cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-zinc-200 bg-white text-zinc-800">
                <DropdownMenuItem onClick={() => onViewDetails(item.id)} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50">View Details</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100" />
                {!isDone && (
                  <>
                    <DropdownMenuItem onClick={() => onSnooze(item.id)} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50">
                      Snooze 1 Day
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkDone(item.id)} className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 rounded-lg">
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
         <div className="flex items-center gap-2 text-[13px] text-zinc-500 self-start ml-[26px]">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium truncate max-w-[200px]">{item.target}</span>
         </div>
      )}

      {/* Clean Badges Row */}
      <div className="flex flex-wrap items-center gap-3 mt-auto pt-2 ml-[26px]">
         {/* Status */}
         <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-600">
             <span className={cn("w-2 h-2 rounded-full shadow-sm", statusDot)} />
             <span className="capitalize">{item.status?.toLowerCase() || 'pending'}</span>
         </div>

         {/* Date */}
         <div className={cn(
             "flex items-center gap-1.5 text-[13px] font-medium",
             isOverdue ? "text-red-600" : "text-zinc-500"
         )}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{item.dueAt ? new Date(item.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due'}</span>
         </div>

         {/* Level Badge (Only show if escalated) */}
         {(item.escalationLevel ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
               <Flame className="w-3.5 h-3.5" />
               <span>Level {item.escalationLevel}</span>
            </div>
         )}

         {/* Ignores */}
         {((item.ignoreCount ?? 0) > 0) && (
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-400">
               <BellOff className="w-3.5 h-3.5" />
               <span>{item.ignoreCount} ignores</span>
            </div>
         )}
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function FollowUpsPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center p-8">Loading...</div>}>
      <FollowUpsContent />
    </Suspense>
  );
}

function FollowUpsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, priorityFilter]);

  // Dialog State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

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
    
    // Automatically open detail view if navigated with ?id=xxx
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get('id');
    if (viewId) {
      setSelectedId(viewId);
      setIsDialogOpen(true);
      // Clean up URL after opening
      window.history.replaceState({}, '', '/followups');
    }
  }, []);

  const handleMarkDone = async (id: string) => {
    try {
      await markDone(id);
      toast.success("Task completed", {
        action: { label: "View", onClick: () => router.push(`/followups?id=${id}`) }
      });
      setAllItems(prev => prev.map(f => f.id === id ? { ...f, status: 'DONE', completedAt: new Date().toISOString() } : f));
    } catch (e) {
      toast.error("Failed to update");
    }
  };

  const handleSnooze = async (id: string) => {
    try {
      await snoozeFollowUp(id, 24 * 60);
      toast.success("Snoozed for 1 day", {
        action: { label: "View", onClick: () => router.push(`/followups?id=${id}`) }
      });
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

  const totalPages = Math.ceil(finalizedItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return finalizedItems.slice(start, start + ITEMS_PER_PAGE);
  }, [finalizedItems, currentPage]);

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
    <Skeleton name="followups-page" loading={loading}>
    <div className="min-h-screen bg-white">
      <div className="flex flex-col font-sans w-full max-w-[1300px] mx-auto px-4 md:px-8 pt-6 pb-12 gap-8 relative z-10">
            {/* Hero Banner */}
            <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-2 bg-gradient-to-br from-indigo-500 via-blue-500 to-emerald-400 shadow-sm border border-black/5">
               <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-8 md:px-10 md:py-12">
                  <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
                     <h1 className="text-3xl md:text-[44px] font-black text-white tracking-tight drop-shadow-sm uppercase mb-1">
                        FOLLOW UPS
                     </h1>
                     <p className="text-[14px] md:text-[15px] text-white/95 leading-relaxed font-medium drop-shadow-sm max-w-[600px] mb-4">
                        Master your communications — track active discussions, set smart snooze reminders, and never let an important conversation slip through the cracks.
                     </p>
                     <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <Link href="/followups/new">
                           <button className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-zinc-50 text-zinc-900 rounded-xl text-[14px] font-bold transition-all active:scale-95 shadow-sm cursor-pointer">
                              <Plus className="w-[18px] h-[18px]" /> Create follow-up
                           </button>
                        </Link>
                        <button
                           onClick={() => setIsQuickCreateOpen(true)}
                           className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-[14px] font-bold transition-all active:scale-95 shadow-md cursor-pointer border border-zinc-800"
                        >
                           <Sparkles className="w-[16px] h-[16px]" /> AI Quick Add
                        </button>
                     </div>
                  </div>
                  
                  {/* Decorative UI Element: Communication Cards */}
                  <div className="shrink-0 hidden md:flex relative">
                     <div className="relative w-64 h-48">
                        {/* Back blurred card */}
                        <div className="absolute top-0 right-0 w-52 h-40 bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 z-10 p-6 flex flex-col gap-4">
                           <div className="flex items-center gap-4 mb-2">
                              <div className="w-8 h-8 rounded-full bg-white/30" />
                              <div className="w-24 h-3 bg-white/20 rounded-full" />
                           </div>
                           <div className="flex gap-4 opacity-50">
                              <div className="w-6 h-6 rounded-full bg-white/30 shrink-0" />
                              <div className="flex-1 bg-white/10 rounded-xl p-3 h-12" />
                           </div>
                        </div>
                        {/* Front solid card (Message UI) */}
                        <div className="absolute top-6 right-8 w-56 h-44 bg-[#1A1D1C] rounded-2xl shadow-2xl border border-white/10 z-20 p-5 flex flex-col">
                           <div className="flex justify-between items-center mb-5">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                 <Send className="w-4 h-4 text-blue-400" strokeWidth={2.5} />
                              </div>
                              <div className="w-12 h-2 bg-zinc-700 rounded-full" />
                           </div>
                           
                           {/* Received bubble */}
                           <div className="flex gap-3 mb-3">
                              <div className="w-6 h-6 rounded-full bg-zinc-800 shrink-0" />
                              <div className="flex-1 bg-zinc-800 rounded-2xl rounded-tl-sm p-3 flex flex-col gap-2 border border-white/5">
                                 <div className="w-full h-1.5 bg-zinc-600 rounded-full" />
                                 <div className="w-2/3 h-1.5 bg-zinc-600 rounded-full" />
                              </div>
                           </div>
                           
                           {/* Sent bubble */}
                           <div className="flex justify-end">
                              <div className="w-3/4 bg-blue-600/90 rounded-2xl rounded-tr-sm p-3 flex flex-col gap-2 border border-blue-500/30">
                                 <div className="w-full h-1.5 bg-blue-300 rounded-full" />
                                 <div className="w-3/4 h-1.5 bg-blue-300 rounded-full" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Controls Bar: Tabs & Search */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
               {/* Segmented Tabs */}
               <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full lg:w-auto bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm snap-x">
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
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Search by title, target..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-11 pr-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-full text-[14px] text-zinc-900 outline-none focus:border-zinc-400 transition-all font-medium placeholder:text-zinc-400 shadow-sm"
                     />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-colors shadow-sm cursor-pointer shrink-0",
                        priorityFilter 
                          ? "bg-blue-50 text-blue-600 border border-blue-200" 
                          : "bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900"
                      )}>
                         <Filter className="w-4 h-4" /> 
                         {priorityFilter ? `${priorityFilter.charAt(0)}${priorityFilter.slice(1).toLowerCase()}` : "Filter"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white border-zinc-200 text-zinc-800 rounded-xl shadow-xl">
                       <DropdownMenuItem onClick={() => setPriorityFilter(null)} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50">
                          All Priorities
                       </DropdownMenuItem>
                       <DropdownMenuSeparator className="bg-zinc-100" />
                       <DropdownMenuItem onClick={() => setPriorityFilter('URGENT')} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50 text-red-600">
                          Urgent
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setPriorityFilter('HIGH')} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50 text-red-600">
                          High Priority
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setPriorityFilter('MEDIUM')} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50 text-yellow-600">
                          Medium Priority
                       </DropdownMenuItem>
                       <DropdownMenuItem onClick={() => setPriorityFilter('LOW')} className="rounded-lg hover:bg-zinc-50 focus:bg-zinc-50 text-blue-600">
                          Low Priority
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>

         {/* Main Content Area */}
         {finalizedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
               <div className="w-20 h-20 bg-zinc-50 rounded-[24px] border border-zinc-200 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-zinc-400" />
               </div>
               <p className="text-xl font-bold text-zinc-800 tracking-tight">No items found</p>
               <p className="text-[15px] font-medium mt-1">Try adjusting your filters or search query.</p>
            </div>
         ) : (
           <>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
                {paginatedItems.map(item => (
                  <FollowUpCard 
                    key={item.id} 
                    item={item} 
                    onMarkDone={handleMarkDone}
                    onSnooze={handleSnooze}
                    onViewDetails={handleViewDetails}
                  />
                ))}
             </div>
             
             {/* Pagination Controls */}
             {totalPages > 1 && (
               <div className="flex items-center justify-center gap-4 pb-20">
                 <button
                   onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                   disabled={currentPage === 1}
                   className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-[14px] font-medium shadow-sm bg-white"
                 >
                   Previous
                 </button>
                 <span className="text-[14px] font-semibold text-zinc-600">
                   Page {currentPage} of {totalPages}
                 </span>
                 <button
                   onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                   disabled={currentPage === totalPages}
                   className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors text-[14px] font-medium shadow-sm bg-white"
                 >
                   Next
                 </button>
               </div>
             )}
           </>
         )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="max-w-[950px] sm:max-w-[950px] w-[95vw] p-0 overflow-hidden border border-zinc-200/50 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.15)] rounded-[20px] bg-white sm:rounded-[20px]">
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

      <AiQuickCreateDialog
         open={isQuickCreateOpen}
         onOpenChange={setIsQuickCreateOpen}
         onCreated={loadData}
      />
    </div>
    </Skeleton>
  );
}

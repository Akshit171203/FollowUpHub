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
  Clock,
  PauseCircle,
  Archive,
  Star,
  Pin
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
        "flex items-center gap-2 px-1 pb-3 pt-3 border-b-2 transition-all text-sm font-medium select-none",
        isActive 
          ? "border-blue-600 text-zinc-900" 
          : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-200"
      )}
    >
      {Icon && <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-zinc-400")} />}
      <span>{label}</span>
      <span className={cn(
        "bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center",
        isActive && "bg-blue-50 text-blue-700"
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
  const isHighPriority = priority === 'HIGH' || priority === 'URGENT';
  const isUrgent = priority === 'URGENT';
  
  return (
    <div 
      onClick={() => onViewDetails(item.id)}
      className="group bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 hover:shadow-lg transition-all duration-200 flex flex-col gap-4 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="block group/title">
            <h3 className="font-bold text-zinc-900 truncate text-[15px] group-hover/title:text-blue-600 transition-colors">
              {item.title}
            </h3>
          </div>
          {item.target && (
             <div className="mt-1">
               <span className="text-[11px] text-zinc-500 font-medium">
                  {item.target}
               </span>
             </div>
          )}
        </div>
        
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewDetails(item.id)}>View Details</DropdownMenuItem>
                <DropdownMenuSeparator />
                {!isDone && (
                  <>
                    <DropdownMenuItem onClick={() => onSnooze(item.id)}>
                      Snooze 1 Day
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMarkDone(item.id)} className="text-emerald-600 focus:text-emerald-700">
                      Mark as Done
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid for New Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 bg-zinc-50/50 p-2 rounded-lg border border-zinc-100/50">
          {item.reminderPolicy && (
             <div className="flex flex-col">
                <span className="font-semibold text-zinc-700 truncate">{item.reminderPolicy}</span>
             </div>
          )}
          {(item.ignoreCount !== undefined && item.ignoreCount !== null) && (
             <div className="flex flex-col">
                <span className="font-semibold text-zinc-700">{item.ignoreCount}x</span>
             </div>
          )}
          {(item.escalationLevel !== undefined && item.escalationLevel !== null) && (
             <div className="flex flex-col">
                <span className="font-semibold text-zinc-700">Lvl {item.escalationLevel}</span>
             </div>
          )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 mt-auto">
          {/* Deadline Badge */}
         <div className={cn(
           "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border",
           item.dueAt && new Date(item.dueAt) < new Date() && !isDone
             ? "bg-red-50 text-red-600 border-red-100" // Overdue
             : "bg-zinc-50 text-zinc-600 border-zinc-100" // Normal
         )}>
           <Calendar className="w-3 h-3" />
           <span>
             {item.dueAt ? new Date(item.dueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No Due Date'}
           </span>
         </div>
      </div>

      {/* Tags / Badges */}
      <div className="flex items-center gap-2 mt-1 flex-wrap">
         {isHighPriority && (
            <span className={cn(
               "text-[10px] font-bold px-2 py-0.5 rounded border",
               isUrgent 
                  ? "bg-red-50 text-red-700 border-red-100" 
                  : "bg-amber-50 text-amber-700 border-amber-100"
            )}>
               {priority} Priority
            </span>
         )}
         <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded border",
            item.status === 'DONE' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
            item.status === 'SNOOZED' ? "bg-orange-50 text-orange-700 border-orange-100" :
            "bg-blue-50 text-blue-700 border-blue-100"
         )}>
            {item.status || 'PENDING'}
         </span>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function FollowUpsPage() {
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState<FollowUp[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

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
    <div className="md:h-screen min-h-[100dvh] flex flex-col bg-white md:overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="px-4 md:px-8 pt-6 md:pt-8 pb-4">
         <div className="flex flex-col gap-6">
            {/* Title & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight">Follow Ups</h1>
                <p className="text-zinc-500 text-sm mt-1 font-medium">Manage and track your communications</p>
              </div>

              <div className="flex items-center gap-3">
                 <div className="flex items-center bg-zinc-100/50 p-1 rounded-lg border border-zinc-200">
                    <button 
                       onClick={() => setViewMode('LIST')}
                       className={cn("p-1.5 rounded-md transition-all", viewMode === 'LIST' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
                    >
                       <ListIcon className="w-4 h-4" />
                    </button>
                    <button 
                       onClick={() => setViewMode('GRID')}
                       className={cn("p-1.5 rounded-md transition-all", viewMode === 'GRID' ? "bg-white shadow-sm text-zinc-900" : "text-zinc-400 hover:text-zinc-600")}
                    >
                       <LayoutGrid className="w-4 h-4" />
                    </button>
                 </div>
                 
                 <Link href="/followups/new">
                    <button className="flex items-center gap-2 pl-4 pr-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95">
                       <Plus className="w-4 h-4" /> Create new follow-up
                    </button>
                 </Link>
              </div>
            </div>

            {/* Controls Bar: Tabs & Search */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-zinc-100">
               {/* Tabs */}
               <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full lg:w-auto">
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
               <div className="flex items-center gap-3 w-full lg:w-auto pb-2 lg:pb-0">
                  <div className="relative group w-full lg:w-[280px]">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                     <input 
                       type="text" 
                       placeholder="Search follow-ups..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-zinc-400"
                     />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                     <Filter className="w-4 h-4" /> Filter
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-zinc-50/50 p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
         {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] text-zinc-400">
               <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 opacity-20" />
               </div>
               <p className="text-lg font-semibold text-zinc-600">No items found</p>
               <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
         ) : viewMode === 'GRID' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <FollowUpCard 
                  key={item.id} 
                  item={item} 
                  onMarkDone={handleMarkDone}
                  onSnooze={handleSnooze}
                  onViewDetails={handleViewDetails}
                />
              ))}
           </div>
         ) : (
           <div className="flex flex-col gap-3">
              {filteredItems.map(item => (
                <div 
                  key={item.id} 
                  className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleViewDetails(item.id)}
                >
                   <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 sm:mt-0 shrink-0", item.status === 'DONE' ? "bg-emerald-500" : "bg-blue-500")} />
                      <span className="font-bold text-zinc-800 line-clamp-2">{item.title}</span>
                   </div>
                   <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-zinc-500 ml-5 sm:ml-0 overflow-hidden w-full sm:w-auto shrink-0">
                      <span className="truncate">{item.target || "-"}</span>
                      <span className="shrink-0">{item.dueAt ? new Date(item.dueAt).toLocaleDateString() : '-'}</span>
                   </div>
                </div>
              ))}
           </div>
         )}
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

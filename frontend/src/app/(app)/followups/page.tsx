"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  MoreHorizontal, 
  RotateCw, 
  Filter,
  FileText,
  Plus
} from "lucide-react";

import {
  getAllFollowUps,
  markDone,
  snoozeFollowUp,
  type FollowUp,
  type PaginationMeta,
} from "@/lib/followups";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function fmtDate(dateIso?: string | null) {
  if (!dateIso) return "—";
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getPriorityColor(priority: string) {
  switch (priority?.toUpperCase()) {
    case "URGENT": return "bg-rose-100 text-rose-700 border-rose-200";
    case "HIGH": return "bg-orange-100 text-orange-700 border-orange-200";
    case "MEDIUM": return "bg-blue-100 text-blue-700 border-blue-200";
    case "LOW": return "bg-slate-100 text-slate-700 border-slate-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function FollowUpsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FollowUp[]>([]);
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
      const result = await getAllFollowUps({ page, limit: 100 }); // Fetch more for now to fill list
      setItems(Array.isArray(result.followups) ? result.followups : []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to fetch follow-ups");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  async function onDone(id: string) {
    try {
      await markDone(id);
      toast.success("Marked as done");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to mark done");
    }
  }

  async function onSnooze(id: string) {
    try {
      await snoozeFollowUp(id, 60); // Snooze for 1 hour default
      toast.success("Snoozed for 1 hour");
      load();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to snooze");
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">My Follow-ups</h1>
          <p className="text-zinc-500 mt-1">Manage, snooze, and track your active tasks.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/templates">
              <FileText className="w-4 h-4" />
              Templates
            </Link>
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" asChild>
            <Link href="/followups/new">
              <Plus className="w-4 h-4" />
              Create FollowUp
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-orange-50/50">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Pending</p>
              <h3 className="text-3xl font-bold text-zinc-900">12</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Upcoming</p>
              <h3 className="text-3xl font-bold text-zinc-900">24</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-green-50/50">
          <CardContent className="p-6 flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Completed</p>
              <h3 className="text-3xl font-bold text-zinc-900">158</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">All Follow-ups</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-zinc-600 border-zinc-200">
              <Filter className="w-3.5 h-3.5" />
              Status: All
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-600" onClick={() => load()}>
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="divide-y divide-zinc-100">
          {items.length === 0 && !loading ? (
            <div className="p-12 text-center text-zinc-500">
              No follow-ups found. Create your first one!
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-4 sm:px-6 hover:bg-zinc-50/50 transition-colors group flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  {/* Status Circle */}
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    item.status === 'DONE' ? 'border-green-500 bg-green-50' : 'border-zinc-300'
                  }`}>
                    {item.status === 'DONE' && <div className="h-2.5 w-2.5 rounded-full bg-green-500" />}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <h4 className={`text-base font-semibold text-zinc-900 truncate ${item.status === 'DONE' ? 'line-through text-zinc-400' : ''}`}>
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className={`rounded-md text-[10px] uppercase font-bold px-1.5 py-0.5 border ${getPriorityColor(item.priority || "")}`}>
                        {item.priority}
                      </Badge>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {fmtDate(item.dueAt)}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500 truncate max-w-[200px]">
                        {item.target || "No target"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-zinc-700">
                         {item.status === 'DONE' ? 'View Details' : 'Actions'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/followups/${item.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      {item.status !== 'DONE' && (
                        <>
                          <DropdownMenuItem onClick={() => onSnooze(item.id)}>
                            Snooze 1 Hour
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDone(item.id)} className="text-green-600 focus:text-green-600">
                            Mark Complete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/30 text-center">
             <Button variant="ghost" size="sm" className="text-indigo-600 font-medium hover:text-indigo-700 hover:bg-indigo-50">
               Show more follow-ups
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}

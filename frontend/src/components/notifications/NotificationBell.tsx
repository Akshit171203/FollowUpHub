"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/context/notification-context";
import { 
  Bell, 
  Settings, 
  Check, 
  AlertTriangle, 
  Clock, 
  Info,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Briefcase
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DesktopNotificationToggle } from "@/components/notifications/DesktopNotificationToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const getIconForType = (type: string = '') => {
  const t = type.toLowerCase();
  if (t.includes('alert') || t.includes('escalate')) {
    return { Icon: AlertTriangle, bg: 'bg-[#2C2C2E]', color: 'text-[#A1A1AA]' };
  }
  if (t.includes('reminder') || t.includes('snooze')) {
    return { Icon: Clock, bg: 'bg-[#2C2C2E]', color: 'text-[#A1A1AA]' };
  }
  if (t.includes('done') || t.includes('complete')) {
    return { Icon: Check, bg: 'bg-[#2C2C2E]', color: 'text-[#A1A1AA]' };
  }
  if (t.includes('auth') || t.includes('security')) {
    return { Icon: ShieldCheck, bg: 'bg-emerald-900/40', color: 'text-[#34C759]' };
  }
  if (t.includes('payment') || t.includes('transfer')) {
    return { Icon: CreditCard, bg: 'bg-[#2C2C2E]', color: 'text-[#A1A1AA]' };
  }
  if (t.includes('jira') || t.includes('ticket')) {
    return { Icon: Briefcase, bg: 'bg-blue-900/40', color: 'text-blue-500' };
  }
  return { Icon: Check, bg: 'bg-[#2C2C2E]', color: 'text-[#A1A1AA]' }; // default to check like in screenshot
};

const PRO_TIPS = [
  "Teams that consistently follow up within 24 hours close 30% more deals!",
  "Snoozing a task until you have bandwidth is better than ignoring it completely.",
  "Using templates for recurring follow-ups saves an average of 4 hours per week.",
  "Prioritizing your follow-ups ensures high-impact items don't slip through the cracks.",
  "Regular communication builds trust. A simple check-in can work wonders.",
  "Escalation helps bring attention to unresolved issues before they become critical.",
  "The best follow-ups are concise, clear, and include a direct call to action."
];

export function NotificationBell({ triggerMode = 'icon', isCollapsed = false }: { triggerMode?: 'icon' | 'sidebar', isCollapsed?: boolean } = {}) {
  const { groups, unreadCount, loading, markGroupRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [mounted, setMounted] = useState(false);
  const [randomTip, setRandomTip] = useState(PRO_TIPS[0]);

  useEffect(() => {
    setMounted(true);
    setRandomTip(PRO_TIPS[Math.floor(Math.random() * PRO_TIPS.length)]);
  }, []);

  useEffect(() => {
    if (open) {
      setRandomTip(PRO_TIPS[Math.floor(Math.random() * PRO_TIPS.length)]);
    }
  }, [open]);

  const filteredGroups = activeTab === 'all' 
    ? groups 
    : groups.filter(g => g.unreadCount > 0);

  return (
    <>
      {/* Full-screen Background Blur Overlay */}
      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
           {open && (
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 z-[60] bg-zinc-900/5 backdrop-blur-[3px] pointer-events-none"
              />
           )}
        </AnimatePresence>,
        document.body
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {triggerMode === 'sidebar' ? (
            <div 
              className={cn(
                "flex items-center rounded-xl transition-all text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/70 cursor-pointer outline-none w-full",
                isCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3"
              )}
              title={isCollapsed ? "Notifications" : undefined}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <Bell className={cn("transition-colors", isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]")} />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              {!isCollapsed && <span className="text-[14px] font-semibold whitespace-nowrap">Notifications</span>}
            </div>
          ) : (
            <button className="w-8 h-8 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors relative cursor-pointer outline-none z-50">
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </button>
          )}
        </PopoverTrigger>
      
      <PopoverContent 
        className="w-[480px] p-0 bg-white/95 backdrop-blur-3xl border border-zinc-200/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] z-[70] rounded-[24px] flex flex-col overflow-hidden" 
        side="right"
        align="end"
        sideOffset={16}
        alignOffset={-60}
        collisionPadding={16}
      >
        {/* Header */}
        <div className="pt-6 px-6 pb-2 relative bg-gradient-to-b from-white to-white/60">
           <div className="flex items-center justify-between mb-5">
             <h4 className="text-[20px] font-semibold text-zinc-900 tracking-tight">Notifications</h4>
             <DesktopNotificationToggle iconOnly />
           </div>

           {/* Tabs & Mark All Read */}
           <div className="flex items-center justify-between border-b border-zinc-200/50 w-full">
              <div className="flex gap-6">
                 <button 
                   onClick={() => setActiveTab('all')}
                   className={cn(
                     "pb-4 text-[14px] font-medium transition-all relative",
                     activeTab === 'all' ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                   )}
                 >
                   All
                   {activeTab === 'all' && (
                     <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full" />
                   )}
                 </button>
                 <button 
                   onClick={() => setActiveTab('unread')}
                   className={cn(
                     "pb-4 text-[14px] font-medium transition-all relative flex items-center gap-2",
                     activeTab === 'unread' ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
                   )}
                 >
                   Unread
                   <span className={cn(
                     "text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors",
                     activeTab === 'unread' ? "bg-zinc-100 text-zinc-900" : "bg-zinc-50 text-zinc-400"
                   )}>
                     {unreadCount}
                   </span>
                   {activeTab === 'unread' && (
                     <motion.div layoutId="notif-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-900 rounded-t-full" />
                   )}
                 </button>
              </div>
              <button 
                 onClick={() => {
                   groups.forEach(g => { if(g.unreadCount > 0) markGroupRead(g.groupKey) });
                 }}
                 className="pb-4 text-[13px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                 Mark all as read
              </button>
           </div>
        </div>

        {/* Content List */}
        <ScrollArea className="h-[460px]">
           {loading && groups.length === 0 ? (
               <div className="p-8 text-center flex flex-col items-center gap-4 mt-12">
                   <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 animate-pulse">
                     <Bell className="w-5 h-5" />
                   </div>
                   <p className="text-[13px] font-medium text-zinc-500">Loading notifications...</p>
               </div>
           ) : filteredGroups.length === 0 ? (
               <div className="p-12 text-center flex flex-col items-center justify-center h-full gap-4 mt-10">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 flex items-center justify-center text-emerald-500 border border-emerald-100">
                     <Check className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-[15px] font-semibold text-zinc-900 mb-1">All caught up!</p>
                     <p className="text-[13px] text-zinc-500 text-center max-w-[200px]">You have no new notifications.</p>
                   </div>
               </div>
           ) : (
               <div className="flex flex-col pb-4">
                   {filteredGroups.map((group) => {
                       const { Icon, bg, color } = getIconForType(group.latestType);
                       const isUnread = group.unreadCount > 0;
                       
                       return (
                           <div
                               key={group.groupKey}
                               onClick={() => {
                                   if (isUnread) markGroupRead(group.groupKey);
                               }}
                               className="w-full text-left py-4 px-6 hover:bg-zinc-50/80 transition-all flex gap-4 cursor-pointer relative group border-b border-zinc-100/60 last:border-0"
                           >
                               {/* Unread indicator bar */}
                               {isUnread && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-blue-500 rounded-r-full" />
                               )}

                               {/* Icon Area */}
                               <div className="relative shrink-0 mt-0.5">
                                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200/50", bg, color)}>
                                     <Icon className="w-5 h-5" />
                                  </div>
                               </div>

                               {/* Content Area */}
                               <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <p className={cn(
                                     "text-[14px] leading-relaxed pr-2 transition-colors",
                                     isUnread ? "text-zinc-900 font-medium" : "text-zinc-600 font-normal"
                                  )}>
                                     {group.latestTitle || "Notification"}
                                  </p>
                                  
                                  <p className="text-[12px] text-zinc-400 mt-1 flex items-center gap-2 font-medium">
                                     {format(new Date(group.lastActivity), "MMM d, yyyy 'at' h:mm a")}
                                     {group.unreadCount > 1 && (
                                        <>
                                          <span className="w-1 h-1 rounded-full bg-zinc-300"></span>
                                          <span>+{group.unreadCount - 1} more</span>
                                        </>
                                     )}
                                  </p>
                               </div>
                           </div>
                       );
                   })}
               </div>
           )}
        </ScrollArea>

        {/* Exciting Fact Strip */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-t border-emerald-100/50 px-6 py-5 flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 mt-0.5">
             <Sparkles className="w-5 h-5 text-emerald-600" />
           </div>
           <p className="text-[14px] font-medium text-emerald-900 leading-relaxed">
             <span className="font-bold block mb-0.5">Pro Tip</span>
             {randomTip}
           </p>
        </div>
      </PopoverContent>
    </Popover>
    </>
  );
}

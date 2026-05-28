"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Zap, Database, Activity } from "lucide-react";

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info" | "critical";
  title: string;
  message: string;
  timestamp: Date;
}

const demoNotifications: Omit<Notification, "id" | "timestamp">[] = [
  { type: "warning", title: "Follow-up Overdue", message: "Client meeting follow-up is 2 hours overdue" },
  { type: "critical", title: "Escalation Triggered", message: "JIRA-402 has been escalated to your manager" },
  { type: "success", title: "Task Completed", message: "HR follow-up marked as complete" },
  { type: "info", title: "Reminder Sent", message: "Email reminder sent for project review" },
];

export default function RealTimeDemo() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Initial notifications state (start full)
    const initialNotifs = [...demoNotifications, demoNotifications[0]].slice(0, 4).map((notif, i) => ({
      ...notif,
      id: `initial-${i}`,
      timestamp: new Date(Date.now() - (10000 - i * 5000))
    })).reverse();
    setNotifications(initialNotifs);

    // Automatically inject live notifications
    const notifInterval = setInterval(() => {
      const randomNotif = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
      const newNotif: Notification = {
        ...randomNotif,
        id: `notif-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      
      // Keep up to 4 notifications to fill the terminal height
      setNotifications(prev => [newNotif, ...prev].slice(0, 4));
    }, 2800); 

    return () => clearInterval(notifInterval);
  }, []);

  return (
    <section className="relative w-full bg-[#030303] overflow-hidden py-24 lg:py-32 px-4 border-t border-white/5 font-sans">
      {/* Lighting / Atmosphere */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* LEFT SIDE: Typography & Metrics */}
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 border border-white/10 shadow-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-300">Live Engine</span>
            </div>

            <h2 className="font-inter text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] leading-tight mb-6">
              <span className="text-white font-medium">Live </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                Intelligence.
              </span>
            </h2>
            
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-xl font-light">
              A realtime orchestration layer that never sleeps. Instant synchronization across your entire workspace, powered by an intelligent event stream.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 mt-10"
          >
            {/* Feature 1 */}
            <div className="group relative flex gap-6 items-center transition-all duration-300">
               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] group-hover:bg-white/10">
                  <Zap className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                   <h4 className="text-gray-300 group-hover:text-white font-medium text-[17px] tracking-wide transition-colors duration-300">Ultra-Low Latency</h4>
                   <span className="text-[9px] font-mono bg-white/5 text-gray-400 group-hover:text-gray-200 px-2.5 py-0.5 rounded-full border border-white/10 group-hover:border-white/20 uppercase tracking-widest transition-colors duration-300">&lt;1ms</span>
                 </div>
               </div>
            </div>

            {/* Feature 2 */}
            <div className="group relative flex gap-6 items-center transition-all duration-300">
               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] group-hover:bg-white/10">
                  <Database className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                   <h4 className="text-gray-300 group-hover:text-white font-medium text-[17px] tracking-wide transition-colors duration-300">Redis-Powered Sync</h4>
                   <span className="text-[9px] font-mono bg-white/5 text-gray-400 group-hover:text-gray-200 px-2.5 py-0.5 rounded-full border border-white/10 group-hover:border-white/20 uppercase tracking-widest transition-colors duration-300">Enterprise</span>
                 </div>
               </div>
            </div>

            {/* Feature 3 */}
            <div className="group relative flex gap-6 items-center transition-all duration-300">
               <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] group-hover:bg-white/10">
                  <Activity className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                   <h4 className="text-gray-300 group-hover:text-white font-medium text-[17px] tracking-wide transition-colors duration-300">Persistent Event Stream</h4>
                   <span className="text-[9px] font-mono bg-white/5 text-gray-400 group-hover:text-gray-200 px-2.5 py-0.5 rounded-full border border-white/10 group-hover:border-white/20 uppercase tracking-widest transition-colors duration-300">Reliable</span>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Visualizer */}
        <div className="relative w-full mt-12 lg:mt-0 perspective-1000">
          <div className="relative bg-[#050505] border border-white/10 rounded-[1.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden transition-all duration-500 transform-gpu hover:rotate-0 rotate-y-[-2deg] rotate-x-[1deg]">
            
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_20%,transparent_100%)] pointer-events-none" />
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />

            {/* Terminal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/[0.01] relative z-10">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                   <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                 </div>
                 <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
                 <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40" />
               </div>
               <div className="flex items-center gap-4 text-[10px] font-mono text-white/30 tracking-[0.2em]">
                  /VAR/LOG/EVENTS.STREAM
               </div>
            </div>

            {/* Sync Activity Heatmap */}
            <div className="px-6 py-5 border-b border-white/5 bg-white/[0.005] relative z-10">
               <div className="flex items-center justify-between mb-4">
                 <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                   Sync Activity Heatmap
                 </div>
                 <div className="text-[9px] font-mono text-gray-600 tracking-widest">REALTIME</div>
               </div>
               
               <div className="w-full flex gap-1 flex-wrap opacity-80">
                 {Array.from({ length: 112 }).map((_, i) => (
                   <motion.div
                     key={i}
                     className="w-2 h-2 rounded-[1px] bg-white/5"
                     animate={{
                       backgroundColor: ["rgba(255,255,255,0.05)", "rgba(59,130,246,0.6)", "rgba(168,85,247,0.4)", "rgba(255,255,255,0.05)"]
                     }}
                     transition={{
                       duration: 3 + ((i * 7) % 40) / 10,
                       repeat: Infinity,
                       delay: ((i * 13) % 50) / 10,
                       ease: "easeInOut"
                     }}
                   />
                 ))}
               </div>
            </div>

          {/* Notifications Stream with Timeline */}
          <div className="relative h-[340px] p-6 [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]">
            
            {/* Glowing Vertical Line */}
            <div className="absolute left-[39px] top-6 bottom-0 w-px bg-white/5">
              <motion.div 
                animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 -translate-x-1/2 w-[2px] h-24 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_12px_rgba(168,85,247,0.8)] rounded-full"
              />
            </div>

            <div className="space-y-6 relative z-10 flex flex-col h-full">
              <AnimatePresence initial={false}>
                {notifications.map((notif, index) => (
                  <NotificationItem key={notif.id} notification={notif} isLatest={index === 0} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          </div>
        </div>
      </div>
    </section>
  );
}

function NotificationItem({ notification, isLatest }: { notification: Notification; isLatest: boolean }) {
  const getColors = () => {
    switch (notification.type) {
      case "success": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "warning": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "error":
      case "critical": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      case "info": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default: return "text-gray-400 bg-white/5 border-white/10";
    }
  };

  const getDotColor = () => {
    switch (notification.type) {
      case "success": return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]";
      case "warning": return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]";
      case "error":
      case "critical": return "bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]";
      case "info": return "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]";
      default: return "bg-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className={`relative pl-10 ${isLatest ? 'opacity-100' : 'opacity-50'}`}
    >
      <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border border-white/10 bg-[#050505] flex items-center justify-center z-10`}>
        <div className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
        {isLatest && (
           <div className={`absolute inset-0 rounded-full ${getDotColor()} animate-ping opacity-50`} />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${getColors().split(' ')[0]}`}>
            {notification.type}
          </span>
          <span className="text-[10px] font-mono text-gray-600">
            {notification.timestamp.toISOString().split('T')[1].replace('Z', '')}
          </span>
          {isLatest && (
            <span className="text-[10px] font-mono text-emerald-400/80 ml-auto bg-emerald-500/10 px-1.5 rounded">
              +0.42ms
            </span>
          )}
        </div>
        <h4 className="text-gray-200 font-medium text-[13px]">{notification.title}</h4>
        <p className="text-gray-500 text-[11px] font-mono">{notification.message}</p>
      </div>
    </motion.div>
  );
}

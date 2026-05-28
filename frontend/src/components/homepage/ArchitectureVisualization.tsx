"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaJira, FaSlack, FaGoogle, FaGithub } from "react-icons/fa";
import { Activity, Database, Network, Server, Zap, Globe } from "lucide-react";

// --- Data Models (Monochrome Shades) ---
const sources = [
  { id: "jira", title: "Jira", sub: "Ticket Webhooks", icon: FaJira, hex: "#111827" }, // gray-900
  { id: "slack", title: "Slack", sub: "Channel Events", icon: FaSlack, hex: "#374151" }, // gray-700
  { id: "github", title: "GitHub", sub: "PR Triggers", icon: FaGithub, hex: "#4B5563" }, // gray-600
];

const storage = [
  { id: "postgres", title: "PostgreSQL", sub: "Primary Datastore", icon: Database, hex: "#1F2937" }, // gray-800
  { id: "redis", title: "Redis", sub: "Event Cache & Queue", icon: Zap, hex: "#4B5563" }, // gray-600
];

// --- Subcomponents ---

const NodeCard = ({ title, sub, icon: Icon, hex, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative h-[88px] w-full"
  >
    {/* Hover Outer Glow */}
    <div 
      className="absolute -inset-0.5 opacity-0 group-hover:opacity-[0.10] blur-md transition-all duration-500 rounded-2xl" 
      style={{ background: `linear-gradient(to right, ${hex}, transparent)` }}
    />
    
    <div className="relative h-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all overflow-hidden">
       {/* Inner subtle ambient glow */}
       <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] blur-2xl pointer-events-none transition-opacity group-hover:opacity-[0.06]" style={{ backgroundColor: hex }} />
       
       <div className="w-12 h-12 flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
          <Icon className="w-7 h-7" style={{ color: hex }} />
       </div>
       
       <div className="flex-1 relative z-10">
          <div className="flex items-center justify-between mb-0.5">
             <h4 className="text-slate-900 text-[15px] font-semibold tracking-wide">{title}</h4>
             <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse shadow-[0_0_8px_rgba(148,163,184,0.5)]" />
          </div>
          <p className="text-slate-500 text-[12px] font-medium leading-tight">{sub}</p>
       </div>
    </div>
  </motion.div>
);

const HorizontalPipe = ({ color, delay, reverse = false }: { color: string, delay: number, reverse?: boolean }) => (
  <div className="w-full h-[2px] bg-slate-200 relative overflow-hidden rounded-full">
    <motion.div 
      className="absolute h-full w-[50%] rounded-full"
      style={{ 
        background: `linear-gradient(to ${reverse ? 'left' : 'right'}, transparent, ${color}, transparent)`, 
        boxShadow: `0 0 10px ${color}, 0 0 5px ${color}`
      }}
      initial={{ left: reverse ? '100%' : '-50%' }}
      animate={{ left: reverse ? '-50%' : '100%' }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay }}
    />
  </div>
);

const InternalModule = ({ title, sub, icon: Icon, metric, statusColor, sparkline }: any) => (
  <div className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 transition-all shadow-sm">
    <div className="flex items-center gap-3.5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-200 shadow-inner transition-transform group-hover:scale-105">
        <Icon className="w-4 h-4 text-slate-700" />
      </div>
      <div>
        <h4 className="text-slate-800 text-[13px] font-bold tracking-wide">{title}</h4>
        <p className="text-slate-500 text-[11px] font-medium mt-0.5">{sub}</p>
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-1.5">
       <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor} animate-pulse`} />
          <span className="text-[10px] font-mono font-medium text-slate-500">{metric}</span>
       </div>
       <div className="flex gap-[3px] items-end h-3">
          {sparkline.map((height: number, i: number) => (
             <div 
               key={i} 
               className="w-1 rounded-sm bg-slate-200 group-hover:bg-slate-300 transition-colors"
               style={{ height: `${height}px` }}
             />
          ))}
       </div>
    </div>
  </div>
);

// --- Main Component ---
export default function EcosystemVisualization() {
  return (
    <section className="relative w-full min-h-screen bg-slate-50 overflow-hidden font-inter py-32 flex flex-col justify-center">
      
      {/* Clean Light Background with Purplish Gradient matching SS1 */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        <div className="absolute w-[1000px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-multiply" />
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] invert" />
      </div>

      <div className="relative w-full z-10 flex flex-col gap-24 px-4 sm:px-6 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="w-full flex flex-col items-center text-center z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-600">Intelligent Pipeline</span>
            </div>

            <h2 className="font-inter text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] leading-tight mb-6">
              <span className="text-slate-900 font-medium">The Data </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                Ecosystem.
              </span>
            </h2>
            
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-3xl font-light">
              A high-performance orchestration layer. Real-time events from your stack stream into a central nervous system that never sleeps.
            </p>
          </motion.div>
        </div>

        {/* 5-COLUMN LASER PIPELINE LAYOUT */}
        <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-4 lg:gap-0 relative">
          
          {/* COLUMN 1: Sources */}
          <div className="flex flex-col justify-center gap-6 w-full lg:w-[280px] shrink-0 z-10 relative">
            {/* Subtle category label */}
            <div className="hidden lg:block absolute -top-8 left-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">Event Sources</div>
            {sources.map((item, idx) => (
              <NodeCard key={item.id} {...item} delay={idx * 0.1} />
            ))}
          </div>

          {/* COLUMN 2: Left Laser Pipes */}
          <div className="hidden lg:flex flex-col justify-center gap-6 w-16 xl:w-28 shrink-0">
            {sources.map((item, idx) => (
              <div key={`pipe-l-${item.id}`} className="h-[88px] flex items-center">
                <HorizontalPipe color={item.hex} delay={idx * 0.3} />
              </div>
            ))}
          </div>

          {/* COLUMN 3: Central Core Engine */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative w-full lg:w-[420px] z-20 shrink-0 my-10 lg:my-0"
          >
            {/* Subtle outer shadow */}
            <div className="absolute -inset-1 bg-slate-200/50 blur-xl opacity-50 rounded-[2.5rem]" />
            
            <div className="relative rounded-[2rem] bg-white border border-slate-200 shadow-2xl flex flex-col p-8 overflow-hidden h-full min-h-[460px]">
              
              {/* Internal Grid & Ambient Glows */}
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] invert pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full">
                 {/* Header */}
                 <div className="flex items-start justify-between pb-6 border-b border-slate-100 mb-6">
                    <div className="flex items-start gap-3.5">
                       <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-md">
                          <Server className="w-5 h-5 text-white" />
                       </div>
                       <div>
                         <h3 className="text-slate-900 text-[15px] font-bold uppercase tracking-widest mb-1">Core Engine</h3>
                         <p className="text-slate-500 text-[11px] leading-relaxed max-w-[240px]">
                           High-throughput orchestration layer processing events in real-time.
                         </p>
                       </div>
                    </div>
                 </div>
                 
                 {/* Processing Modules */}
                 <div className="flex-1 flex flex-col justify-between gap-3">
                    <InternalModule icon={Network} title="Webhook Receiver" sub="Ingests Jira Events" metric="12ms avg" statusColor="bg-emerald-500" sparkline={[4, 7, 5, 10, 6, 8, 5]} />
                    <InternalModule icon={Activity} title="SLA Rules Engine" sub="Evaluates Ticket Staleness" metric="85K ops/s" statusColor="bg-blue-500" sparkline={[6, 9, 8, 12, 7, 9, 10]} />
                    <InternalModule icon={Server} title="Escalation Manager" sub="Routes Alerts to Teams" metric="< 1ms lat" statusColor="bg-purple-500" sparkline={[3, 4, 3, 5, 4, 3, 4]} />
                    <InternalModule icon={Database} title="State Synchronizer" sub="Maintains Ticket State" metric="Synced" statusColor="bg-emerald-500" sparkline={[8, 7, 9, 8, 7, 8, 9]} />
                 </div>
              </div>
            </div>
          </motion.div>

          {/* COLUMN 4: Right Laser Pipes */}
          <div className="hidden lg:flex flex-col justify-center gap-6 w-16 xl:w-28 shrink-0">
            {storage.map((item, idx) => (
              <div key={`pipe-r-${item.id}`} className="h-[88px] flex items-center">
                <HorizontalPipe color={item.hex} delay={idx * 0.4} />
              </div>
            ))}
          </div>

          {/* COLUMN 5: Storage */}
          <div className="flex flex-col justify-center gap-6 w-full lg:w-[280px] shrink-0 z-10 relative">
            <div className="hidden lg:block absolute -top-8 right-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">Persistence</div>
            {storage.map((item, idx) => (
              <NodeCard key={item.id} {...item} delay={idx * 0.2 + 0.5} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

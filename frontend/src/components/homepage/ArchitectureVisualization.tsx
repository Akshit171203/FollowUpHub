"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaJira, FaSlack, FaGoogle, FaGithub } from "react-icons/fa";
import { Activity, Database, Network, Server, Zap, Globe } from "lucide-react";

// --- Data Models ---
const sources = [
  { id: "jira", title: "Jira", sub: "Ticket Webhooks", icon: FaJira, hex: "#4C9AFF" },
  { id: "slack", title: "Slack", sub: "Channel Events", icon: FaSlack, hex: "#E01E5A" },
  { id: "github", title: "GitHub", sub: "PR Triggers", icon: FaGithub, hex: "#64748b" }, // slate-500 for better visibility in light mode
];

const storage = [
  { id: "postgres", title: "PostgreSQL", sub: "Primary Datastore", icon: Database, hex: "#06b6d4" }, // cyan-500
  { id: "redis", title: "Redis", sub: "Event Cache & Queue", icon: Zap, hex: "#ef4444" }, // red-500
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
      className="absolute -inset-0.5 opacity-0 group-hover:opacity-[0.15] blur-md transition-all duration-500 rounded-2xl" 
      style={{ background: `linear-gradient(to right, ${hex}, transparent)` }}
    />
    
    <div className="relative h-full p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-4 hover:border-slate-300 transition-all overflow-hidden">
       {/* Inner subtle ambient glow */}
       <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] blur-2xl pointer-events-none transition-opacity group-hover:opacity-[0.08]" style={{ backgroundColor: hex }} />
       
       <div 
         className="w-12 h-12 rounded-lg flex items-center justify-center border shadow-inner relative z-10 transition-transform group-hover:scale-105"
         style={{ backgroundColor: `${hex}10`, borderColor: `${hex}30`, boxShadow: `inset 0 0 12px ${hex}10` }}
       >
          <Icon className="w-6 h-6" style={{ color: hex }} />
       </div>
       
       <div className="flex-1 relative z-10">
          <div className="flex items-center justify-between mb-0.5">
             <h4 className="text-slate-900 text-[15px] font-semibold tracking-wide">{title}</h4>
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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

const InternalModule = ({ title, sub, icon: Icon, hex }: any) => (
  <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
    <div 
      className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105"
      style={{ backgroundColor: `${hex}10`, borderColor: `${hex}25`, boxShadow: `inset 0 0 12px ${hex}15` }}
    >
      <Icon className="w-5 h-5" style={{ color: hex }} />
    </div>
    <div>
      <h4 className="text-slate-800 text-[14px] font-semibold">{title}</h4>
      <p className="text-slate-500 text-[11px] font-medium mt-0.5">{sub}</p>
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
        <div className="w-full text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white mb-8 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-600">Intelligent Pipeline</span>
            </div>

            <h2 className="font-inter text-[3rem] sm:text-[4rem] lg:text-[4.5rem] tracking-[-0.03em] leading-[1] text-center">
              <span className="text-slate-900 font-medium">
                The Data{" "}
              </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                Ecosystem
              </span>
            </h2>
            
            <p className="mt-8 text-slate-600 text-lg md:text-xl leading-[1.6] mx-auto font-light">
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
                 <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shadow-sm">
                          <Server className="w-5 h-5 text-blue-600" />
                       </div>
                       <div>
                         <h3 className="text-slate-900 text-[15px] font-bold uppercase tracking-widest">Core Engine</h3>
                         <div className="text-slate-500 text-[10px] font-mono mt-0.5 tracking-wider">FOLLOWUPHUB-V2.0</div>
                       </div>
                    </div>
                    <div className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-mono uppercase font-bold flex items-center gap-1.5 shadow-sm">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       99.99% OK
                    </div>
                 </div>
                 
                 {/* Processing Modules */}
                 <div className="flex-1 flex flex-col justify-between gap-2">
                    <InternalModule icon={Globe} title="Edge Network" sub="Global Request Routing" hex="#0284c7" />
                    <InternalModule icon={Network} title="WebSocket Mesh" sub="Real-time Client Sync" hex="#059669" />
                    <InternalModule icon={Server} title="Express Router" sub="Event Ingestion & API" hex="#7c3aed" />
                    <InternalModule icon={Activity} title="Worker Pool" sub="Async Background Jobs" hex="#ea580c" />
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

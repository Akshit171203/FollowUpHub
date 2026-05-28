"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, Mail, Play, Check, Workflow, Zap, Clock, Activity } from "lucide-react";
import { useState, useEffect } from "react";

const JiraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#2684FF]">
    <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.94 4.34 4.34 4.34V2H11.53zM2 11.5c0 2.4 1.97 4.34 4.35 4.34h1.78v1.72c0 2.4 1.94 4.34 4.34 4.34v-10.4H2z" />
    <path d="M11.53 11.5c0 2.4 1.97 4.34 4.35 4.34h1.78v1.72c0 2.4 1.94 4.34 4.34 4.34v-10.4h-10.4z" opacity=".6" />
  </svg>
);

export default function JiraIntegrationSection() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4); 
    }, 3500); 
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="integration" className="relative w-full bg-[#FAFAFA] py-24 md:py-32 overflow-hidden font-sans border-y border-gray-100">
      
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none opacity-40" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none opacity-30" />

      <div className="max-w-[1350px] mx-auto w-full relative z-10 px-4 md:px-8">
        
        {/* Header */}
        <div className="w-full flex flex-col items-center text-center z-20 mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-600">Intelligent Automation</span>
            </div>

            <h2 className="font-inter text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] leading-tight mb-6">
              <span className="text-slate-900 font-medium">Put Your Escalations On </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                Autopilot.
              </span>
            </h2>
            
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-3xl font-light">
              FollowUpHub continuously monitors your Jira workspace. Create custom SLA rules that automatically alert the right team the second a critical issue goes stale.
            </p>
          </motion.div>
        </div>

        {/* The Node Editor App Window Mockup */}
        <div className="w-full rounded-[24px] border border-white/10 bg-[#0A0C10] shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative z-20">
          
          {/* Fake Window Header */}
          <div className="h-12 bg-[#0A0C10] border-b border-white/5 flex items-center px-4 select-none">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]/80 border border-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]/80 border border-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]/80 border border-[#27c93f]" />
            </div>
          </div>

          {/* Node Canvas Area */}
          <div className="flex-1 relative bg-[#020305] overflow-hidden flex items-center justify-center p-8 pt-16 pb-28 xl:pt-20 xl:pb-32">
             {/* Dot Grid Background */}
             <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-100" />

             {/* Workflow Container */}
             <div className="relative z-20 flex flex-col xl:flex-row items-center gap-4 xl:gap-6 w-full max-w-[1150px] justify-between">
                
                {/* NODE 1: TRIGGER */}
                <NodeCard 
                   icon={<JiraIcon />} 
                   title="Jira Webhook" 
                   subtitle="Trigger" 
                   active={step >= 0}
                   borderColor={step >= 0 ? "border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]" : "border-white/10"}
                >
                   <p className="text-[11.5px] text-slate-400 mb-4 leading-relaxed font-medium">
                      Listens continuously for any ticket status changes across your connected Jira workspaces.
                   </p>
                   <div className="text-[11px] text-slate-300 font-mono bg-[#0A0C10] p-3.5 rounded-lg border border-white/10 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                         <span>Event:</span> 
                         <span className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">issue.updated</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span>Ticket:</span> 
                         <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/20">ENG-4092</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span>Status:</span> 
                         <span className="text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">In Progress</span>
                      </div>
                   </div>
                   {step === 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-[#0A0C10] text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                      >
                         <Activity size={12} /> LISTENING FOR EVENTS
                      </motion.div>
                   )}
                </NodeCard>

                {/* CONNECTOR 1 */}
                <Connector active={step >= 1} />

                {/* NODE 2: FILTER */}
                <NodeCard 
                   icon={<Filter size={18} className="text-purple-400" />} 
                   title="Condition Match" 
                   subtitle="Rules Engine" 
                   active={step >= 1}
                   borderColor={step >= 1 ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/10"}
                >
                   <p className="text-[11.5px] text-slate-400 mb-4 leading-relaxed font-medium">
                      Evaluates the incoming ticket against your custom SLA thresholds and priority rules.
                   </p>
                   <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[11px] bg-[#0A0C10] p-3 rounded-lg border border-white/10">
                         <span className="text-slate-300 font-medium">Priority</span>
                         <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">== Highest</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] bg-[#0A0C10] p-3 rounded-lg border border-white/10">
                         <span className="text-slate-300 font-medium">Time in Status</span>
                         <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded border border-white/20">&gt; 48 hours</span>
                      </div>
                   </div>
                   {step === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-[#0A0C10] text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                      >
                         <Zap size={12} /> CONDITIONS MET
                      </motion.div>
                   )}
                </NodeCard>

                {/* CONNECTOR 2 */}
                <Connector active={step >= 2} />

                {/* NODE 3: ACTION */}
                <NodeCard 
                   icon={<Mail size={18} className="text-emerald-400" />} 
                   title="Send Email" 
                   subtitle="Action" 
                   active={step >= 2}
                   borderColor={step >= 2 ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-white/10"}
                >
                   <p className="text-[11.5px] text-slate-400 mb-4 leading-relaxed font-medium">
                      Automatically dispatches an urgent alert to the designated on-call team or manager.
                   </p>
                   <div className="text-[11px] text-slate-300 bg-[#0A0C10] p-3.5 rounded-lg border border-white/10 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                         <span className="text-slate-400">To:</span>
                         <span className="text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">mgr@company.com</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-slate-400">Template:</span>
                         <span className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/20">SLA_Warning_v2</span>
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                         <span className="text-slate-400">Urgency:</span>
                         <span className="text-red-400 font-mono font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">High</span>
                      </div>
                   </div>
                   {step === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-14 left-1/2 -translate-x-1/2 bg-[#0A0C10] text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                      >
                         <Check size={12} /> ESCALATION SENT
                      </motion.div>
                   )}
                </NodeCard>

             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Sub-components for cleaner structure

function NodeCard({ icon, title, subtitle, active, borderColor, children }: any) {
  return (
    <div className={`relative w-full sm:w-[340px] xl:w-[320px] shrink-0 rounded-2xl bg-[#050505] p-5 lg:p-6 transition-all duration-500 z-20 border ${borderColor} ${active ? 'scale-105' : 'scale-100 opacity-60'}`}>

       <div className="flex items-center gap-4 mb-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border ${borderColor} transition-colors duration-500`}>
             {icon}
          </div>
          <div className="flex flex-col">
             <div className="text-white font-bold text-[15px] tracking-wide">{title}</div>
             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</div>
          </div>
       </div>

       {children}
       
       {/* Connection Ports (Dots on the sides) */}
       <div className={`hidden xl:block absolute top-1/2 -left-[7px] -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#050505] border-2 ${borderColor}`} />
       <div className={`hidden xl:block absolute top-1/2 -right-[7px] -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#050505] border-2 ${borderColor}`} />
       
       {/* Mobile/Vertical Connection Ports */}
       <div className={`xl:hidden absolute -top-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#050505] border-2 ${borderColor}`} />
       <div className={`xl:hidden absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#050505] border-2 ${borderColor}`} />
    </div>
  )
}

function Connector({ active }: any) {
  return (
    <div className="flex items-center justify-center h-10 xl:h-auto xl:flex-1 relative shrink-0 z-10 w-10 xl:w-auto">
      
      {/* Track Lines - Extended to bridge the flex gaps */}
      <div className="hidden xl:block absolute top-1/2 left-[-24px] right-[-24px] h-[2px] bg-white/10 -translate-y-1/2" />
      <div className="xl:hidden absolute top-[-16px] bottom-[-16px] left-1/2 w-[2px] bg-white/10 -translate-x-1/2" />

      {/* Animated Flow Pulse */}
      {active && (
        <>
           <motion.div 
             className="hidden xl:block absolute top-1/2 left-[-24px] right-[-24px] h-[2px] bg-white -translate-y-1/2 origin-left z-10"
             initial={{ scaleX: 0 }}
             animate={{ scaleX: 1 }}
             transition={{ duration: 0.6, ease: "easeOut" }}
           />
           <motion.div 
             className="xl:hidden absolute top-[-16px] bottom-[-16px] left-1/2 w-[2px] bg-white -translate-x-1/2 origin-top z-10"
             initial={{ scaleY: 0 }}
             animate={{ scaleY: 1 }}
             transition={{ duration: 0.6, ease: "easeOut" }}
           />
        </>
      )}
    </div>
  )
}

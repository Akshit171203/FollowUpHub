"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Key,
  Database,
  Zap,
  CheckCircle2,
} from "lucide-react";

// --- Custom Animated Visuals for Bento Cards ---
const AuthVisual = () => (
  <div className="absolute right-0 top-0 bottom-0 w-[55%] flex items-center justify-end pr-4 md:pr-8 pointer-events-none opacity-100">
    <div className="relative w-full max-w-[280px]">
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full" />
      
      <div className="relative z-10 bg-[#030508]/80 backdrop-blur-md border border-blue-500/20 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden scale-[0.95] md:scale-100 origin-right">
        
        {/* Header Bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/5 border-b border-blue-500/10">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[9px] font-mono text-blue-400/80 uppercase tracking-widest">Auth.Guard</span>
        </div>

        <div className="p-4 space-y-4">
          {/* Animated JWT Token */}
          <div className="font-mono text-[9px] leading-[1.6] break-all bg-[#0A0D14] rounded-lg p-3 border border-white/5 relative overflow-hidden">
            <motion.span 
              animate={{ color: ["#64748b", "#f87171", "#64748b"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0 }}
              className="text-slate-500"
            >
              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
            </motion.span>
            <span className="text-slate-700">.</span>
            <motion.span 
              animate={{ color: ["#64748b", "#c084fc", "#64748b"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1.3 }}
              className="text-slate-500"
            >
              eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
            </motion.span>
            <span className="text-slate-700">.</span>
            <motion.span 
              animate={{ color: ["#64748b", "#60a5fa", "#64748b"] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2.6 }}
              className="text-slate-500"
            >
              SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
            </motion.span>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
          </div>

          {/* User Payload Extraction */}
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
             <div className="flex flex-col">
                <span className="text-[8px] font-mono text-slate-500 uppercase">Decoded Subject</span>
                <span className="text-[10px] font-mono text-emerald-400">akshit@followuphub</span>
             </div>
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
             </motion.div>
          </div>
        </div>
      </div>

    </div>
  </div>
);

const RedisVisual = () => (
  <div className="absolute top-0 inset-x-0 h-[200px] flex items-center justify-center pointer-events-none opacity-100 overflow-hidden">
    {/* Ambient Glow */}
    <div className="absolute inset-0 bg-red-500/5 blur-[50px] rounded-full" />
    
    {/* Cyber Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef44440a_1px,transparent_1px),linear-gradient(to_bottom,#ef44440a_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)]" />

    <div className="relative z-10 bg-[#030508]/80 backdrop-blur-md border border-red-500/20 rounded-xl p-3 flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.1)] scale-[1.2] origin-center">
      {/* Incoming Requests */}
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[8px] font-mono text-slate-500">REQ_{i}</span>
            <div className="w-12 h-[2px] bg-slate-800 rounded-full overflow-hidden relative">
              <motion.div 
                animate={{ x: ["-100%", "200%"] }} 
                transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-red-400 to-transparent rounded-full" 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Redis Shield Line */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-red-500/20 blur-[8px] rounded-full" />
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-red-500 to-transparent relative">
          <motion.div 
            animate={{ height: ["0%", "40%", "0%"], top: ["0%", "30%", "100%"] }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 -translate-x-1/2 w-[2px] bg-red-400 rounded-full shadow-[0_0_12px_rgba(248,113,113,1)]"
          />
        </div>
      </div>

      {/* Blocked Status */}
      <div className="flex flex-col gap-1.5">
         <div className="px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-md text-[8px] font-mono text-red-400 flex items-center gap-1.5">
           <div className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
           <span className="leading-none">LIMIT_HIT</span>
         </div>
         <div className="px-2 py-1.5 bg-slate-800/50 border border-white/5 rounded-md text-[8px] font-mono text-slate-500 flex items-center gap-1.5">
           <span className="leading-none text-red-500/50">429</span>
           <span className="leading-none">DROPPED</span>
         </div>
      </div>
    </div>
  </div>
);

const AESVisual = () => (
  <div className="absolute top-0 inset-x-0 h-[200px] flex items-center justify-center pointer-events-none opacity-100 pt-6">
    <div className="relative flex items-center justify-center w-full scale-[1.2] origin-center">
       <div className="absolute inset-0 bg-purple-500/20 blur-[50px] rounded-full" />
       <div className="relative z-10 w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(168,85,247,0.2)]">
         <Key className="w-8 h-8 text-purple-400" />
       </div>
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute w-[140px] h-[140px] border border-purple-500/20 rounded-full border-t-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.1)]" />
       <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute w-[180px] h-[180px] border border-purple-500/10 rounded-full border-b-purple-400/50" />
    </div>
  </div>
);

const SQLVisual = () => (
  <div className="absolute left-0 top-0 bottom-0 w-[45%] flex items-center justify-start pl-6 md:pl-10 pointer-events-none opacity-100">
    <div className="relative w-full max-w-[260px]">
      <div className="absolute inset-0 bg-cyan-500/10 blur-[60px] rounded-full" />
      <div className="bg-[#030508]/90 border border-white/10 rounded-2xl p-6 font-mono text-[12px] leading-[1.8] w-full shadow-2xl relative z-10 backdrop-blur-sm">
         <div className="flex gap-2 mb-5 border-b border-white/5 pb-3">
           <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
           <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
           <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
         </div>
         <div className="text-slate-300">
           <span className="text-purple-400">await</span> db.<span className="text-blue-400">select</span>().<span className="text-blue-400">from</span>(users)<br/>
           &nbsp;&nbsp;.<span className="text-blue-400">where</span>(<br/>
           &nbsp;&nbsp;&nbsp;&nbsp;eq(users.email, <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.2)]">inputEmail</span>)<br/>
           &nbsp;&nbsp;);
         </div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-[30%] w-full animate-[scan_3s_linear_infinite]" />
      </div>
    </div>
  </div>
);

// --- Component Definition ---

const BentoCard = ({ 
  children, 
  className = "", 
  visual 
}: { 
  children: React.ReactNode; 
  className?: string; 
  visual?: React.ReactNode 
}) => (
  <div className={`group relative overflow-hidden rounded-[2rem] bg-[#0A0D14]/80 backdrop-blur-xl border border-white/10 transition-all duration-500 hover:border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_48px_rgba(6,182,212,0.1)] ${className}`}>
    {visual}
    <div className="relative z-10 p-8 md:p-10 h-full flex flex-col pointer-events-auto">
      {children}
    </div>
  </div>
);

export default function SecuritySection() {
  return (
    <section className="relative w-full min-h-screen bg-[#030508] overflow-hidden font-inter py-32 flex items-center">
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px] -translate-y-1/2" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZUZpbHRlcikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" style={{ mixBlendMode: "overlay" }} />
      </div>

      <div className="relative w-full max-w-[1200px] mx-auto z-10 px-6 sm:px-12 flex flex-col gap-24">
        
        {/* HEADER */}
        <div className="w-full flex flex-col z-20 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] backdrop-blur-md mb-8 shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-300">Zero-Trust Foundation</span>
            </div>

            <h2 className="font-inter text-[3rem] sm:text-[4rem] lg:text-[4.5rem] tracking-[-0.03em] leading-[1]">
              <span className="text-white font-medium">The Security Layer </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-fuchsia-400">
                Behind FollowUpHub.
              </span>
            </h2>
            
            <p className="mt-8 text-slate-400 text-lg md:text-xl leading-[1.6] max-w-2xl font-light">
              We don't sugarcoat security. Our infrastructure is built on a rigorous, enterprise-grade foundation designed to protect your tokens, enforce strict rate limits, and sanitize every query.
            </p>
          </motion.div>
        </div>

        {/* BENTO GRID (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 auto-rows-fr">
          
          {/* Card 1: Auth (Span 2) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="md:col-span-2 h-full">
            <BentoCard visual={<AuthVisual />}>
              <div className="md:w-[45%] flex flex-col h-full justify-end pt-56 md:pt-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 mb-8 bg-blue-400/10 text-blue-400 border-blue-400/20 shadow-[inset_0_0_20px_rgba(96,165,250,0.15)] group-hover:scale-110 group-hover:brightness-125">
                  <Lock size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-100 text-xl font-semibold tracking-wide mb-3">Secure Authentication</h3>
                <p className="text-slate-400 font-light leading-relaxed text-[15px]">HTTP-only cookie-based JWT sessions with bcryptjs password hashing.</p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Card 2: Redis (Span 1) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full">
            <BentoCard visual={<RedisVisual />}>
              <div className="mt-auto flex flex-col pt-48">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 mb-8 bg-red-400/10 text-red-400 border-red-400/20 shadow-[inset_0_0_20px_rgba(248,113,113,0.15)] group-hover:scale-110 group-hover:brightness-125">
                  <Zap size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-100 text-xl font-semibold tracking-wide mb-3">Redis Rate Limiting</h3>
                <p className="text-slate-400 font-light leading-relaxed text-[15px]">Custom Redis-backed middleware to prevent abuse on APIs.</p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Card 3: AES (Span 1) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="h-full">
            <BentoCard visual={<AESVisual />}>
              <div className="mt-auto flex flex-col pt-48">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 mb-8 bg-purple-400/10 text-purple-400 border-purple-400/20 shadow-[inset_0_0_20px_rgba(192,132,252,0.15)] group-hover:scale-110 group-hover:brightness-125">
                  <Key size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-100 text-xl font-semibold tracking-wide mb-3">AES-256 Encryption</h3>
                <p className="text-slate-400 font-light leading-relaxed text-[15px]">Military-grade encryption for storing third-party Jira tokens.</p>
              </div>
            </BentoCard>
          </motion.div>

          {/* Card 4: SQL (Span 2) */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="md:col-span-2 h-full">
            <BentoCard visual={<SQLVisual />}>
              <div className="md:w-[50%] md:ml-auto flex flex-col h-full justify-end pt-56 md:pt-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 mb-8 bg-cyan-400/10 text-cyan-400 border-cyan-400/20 shadow-[inset_0_0_20px_rgba(34,211,238,0.15)] group-hover:scale-110 group-hover:brightness-125">
                  <Database size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-slate-100 text-xl font-semibold tracking-wide mb-3">SQL Injection Defense</h3>
                <p className="text-slate-400 font-light leading-relaxed text-[15px]">Type-safe Drizzle ORM executing strict parameterized queries.</p>
              </div>
            </BentoCard>
          </motion.div>

        </div>

      </div>

      {/* Global CSS for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(500%); }
        }
      `}} />
    </section>
  );
}

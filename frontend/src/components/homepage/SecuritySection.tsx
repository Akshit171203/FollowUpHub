"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Key, Database, Zap, User, Server, Check } from "lucide-react";

// --- Architectural Monochrome Visuals ---

const AuthVisual = () => (
  <div className="relative w-full h-[350px] lg:h-full lg:absolute lg:right-0 lg:top-0 lg:w-[55%] flex items-center justify-center pointer-events-none overflow-hidden">
    {/* Minimal Grid Background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
    
    <div className="relative z-10 w-[85%] max-w-[400px] flex flex-col gap-5">
      {/* Network Flow Diagram */}
      <div className="flex justify-between items-center w-full relative">
         <div className="w-20 p-2.5 bg-[#050505] border border-white/10 rounded-lg flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10">
            <div className="w-6 h-6 rounded bg-white/5 mb-2 flex items-center justify-center"><User className="w-3 h-3 text-slate-300" /></div>
            <span className="text-[9px] font-mono text-slate-500">CLIENT</span>
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-center relative h-full">
            <div className="w-full h-[1px] bg-white/10 absolute top-1/2 -translate-y-1/2" />
            <motion.div 
               animate={{ left: ["0%", "100%"] }} 
               transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
               className="w-1.5 h-1.5 rounded-full bg-white absolute top-1/2 -translate-y-1/2 shadow-[0_0_10px_white] -ml-1" 
            />
            <span className="text-[9px] font-mono text-slate-400 bg-[#020305] px-2 relative -top-4">POST /auth</span>
         </div>
         
         <div className="w-20 p-2.5 bg-[#050505] border border-white/10 rounded-lg flex flex-col items-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-10">
            <div className="w-6 h-6 rounded bg-white/5 mb-2 flex items-center justify-center"><Server className="w-3 h-3 text-slate-300" /></div>
            <span className="text-[9px] font-mono text-slate-500">SERVER</span>
         </div>
      </div>
      
      {/* JWT Construction Box */}
      <div className="w-full bg-[#050505] border border-white/10 rounded-xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative mt-2">
         <div className="absolute -top-2.5 left-5 bg-white text-black px-2 py-0.5 text-[9px] font-bold tracking-[0.2em] rounded-sm">
           TOKEN GENERATOR
         </div>
         <div className="flex flex-col gap-3 mt-2">
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
               <span className="text-slate-500">HEADER</span>
               <span className="text-slate-300">{"{ alg: 'HS256' }"}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/5 pb-2">
               <span className="text-slate-500">PAYLOAD</span>
               <span className="text-slate-300">{"{ sub: 'user_1' }"}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono">
               <span className="text-slate-500">SIGNATURE</span>
               <span className="text-white">HMAC-SHA256(secret)</span>
            </div>
         </div>
      </div>
    </div>
  </div>
);

const SQLVisual = () => (
  <div className="relative w-full h-[350px] lg:h-full lg:absolute lg:right-0 lg:top-0 lg:w-[55%] flex items-center justify-center pointer-events-none overflow-hidden">
    
    <div className="relative z-10 w-[85%] max-w-[400px] flex flex-col gap-5 items-center">
      
      {/* Malicious Query Block */}
      <div className="flex gap-3 items-center w-full">
         <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
         <div className="flex-1 bg-[#050505] border border-white/10 rounded-lg p-3 font-mono text-[10px] shadow-lg">
            <span className="text-slate-500">SELECT * FROM users WHERE id =</span> <span className="text-slate-300 line-through">'1' OR '1'='1'</span>
         </div>
      </div>
      
      {/* Central Sanitizer Node */}
      <div className="flex flex-col items-center relative w-full">
         <div className="w-[1px] h-6 bg-white/20" />
         <div className="bg-white border border-white px-6 py-2.5 rounded-lg flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.15)] z-10">
            <Shield className="w-4 h-4 text-black" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-black">QUERY SANITIZER</span>
         </div>
         <div className="w-[1px] h-6 bg-white/20" />
      </div>

      {/* Safe Query Block */}
      <div className="flex gap-3 items-center w-full">
         <div className="w-2 h-2 rounded-full border border-white/40" />
         <div className="flex-1 bg-[#050505] border border-white/5 rounded-lg p-3 font-mono text-[10px] opacity-70">
            <span className="text-slate-500">SELECT * FROM users WHERE id =</span> <span className="text-white bg-white/10 px-1.5 py-0.5 rounded ml-1">$1</span>
         </div>
      </div>

    </div>
  </div>
);

const AESVisual = () => (
  <div className="relative w-full h-[320px] lg:h-full lg:absolute lg:right-0 lg:top-0 lg:w-[55%] flex items-center justify-center pointer-events-none overflow-hidden">
    
    <div className="absolute inset-0 flex items-center justify-center opacity-30">
       <div className="w-[250px] h-[250px] border-[0.5px] border-white/20 rounded-full flex items-center justify-center border-dashed animate-[spin_60s_linear_infinite]">
         <div className="w-[180px] h-[180px] border-[0.5px] border-white/10 rounded-full flex items-center justify-center animate-[spin_40s_linear_infinite_reverse]" />
       </div>
    </div>
    
    <div className="relative z-10 flex flex-col items-center gap-6">
       {/* Incoming Raw Data */}
       <div className="flex gap-1.5">
         {['D', 'A', 'T', 'A'].map((char, i) => (
            <div key={i} className="w-7 h-7 rounded bg-[#050505] border border-white/10 flex items-center justify-center text-[9px] font-mono text-slate-500 shadow-md">
               {char}
            </div>
         ))}
       </div>

       {/* Cryptographic Core */}
       <div className="relative flex items-center justify-center my-2">
         <div className="absolute w-[1px] h-10 bg-gradient-to-b from-white/20 to-transparent -top-10" />
         <div className="bg-[#050505] p-5 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.05)] relative z-10">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/20" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-white/20" />
            <Key className="w-6 h-6 text-white" />
         </div>
         <div className="absolute w-[1px] h-10 bg-gradient-to-t from-white/20 to-transparent -bottom-10" />
       </div>

        {/* Outgoing Encrypted Data */}
        <div className="flex gap-1.5">
          {['F', '4', 'A', '9', 'B', '2', 'E', '7'].map((char, i) => (
             <motion.div 
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity }}
                className="w-7 h-7 rounded bg-white border border-white/20 flex items-center justify-center text-[10px] font-mono text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)]"
             >
                {char}
             </motion.div>
          ))}
        </div>
     </div>
  </div>
);

const RedisVisual = () => (
  <div className="relative w-full h-[350px] lg:h-full lg:absolute lg:right-0 lg:top-0 lg:w-[55%] flex items-center justify-center pointer-events-none overflow-hidden">
    
    <div className="relative z-10 w-[85%] max-w-[420px] bg-[#050505] border border-white/10 rounded-xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
       {/* Header */}
       <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
             <span className="text-[10px] font-bold tracking-[0.2em] text-white">REDIS EDGE NODE</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">99.9% HIT RATE</span>
       </div>
       
       {/* Real-time Rate Graph */}
       <div className="h-20 flex items-end gap-1 mb-6 border-b border-white/5 pb-3">
          {Array.from({length: 35}).map((_, i) => {
             const isSpike = i === 24 || i === 25 || i === 26;
             // Deterministic pseudo-random heights to prevent hydration mismatch
             const baseHeight = 10 + ((i * 7) % 20); 
             const animHeight = 10 + (((i + 5) * 11) % 20);
             
             return (
               <motion.div 
                  key={i}
                  initial={{ height: baseHeight }}
                  animate={{ height: isSpike ? 60 : animHeight }}
                  transition={{ duration: 0.4, repeat: Infinity, repeatType: 'mirror', delay: i * 0.05 }}
                  className={`flex-1 rounded-t-sm ${isSpike ? 'bg-white' : 'bg-white/10'}`}
               />
             )
          })}
       </div>

       {/* Log Entries */}
       <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-[9px] font-mono">
             <span className="text-slate-300">IP: 103.44.55.2</span>
             <span className="bg-white text-black px-2 py-0.5 rounded font-bold">RATE_LIMIT_EXCEEDED</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono">
             <span className="text-slate-600">IP: 45.33.22.11</span>
             <span className="bg-white/5 text-slate-500 px-2 py-0.5 rounded">REQ_ALLOWED</span>
          </div>
       </div>
    </div>
  </div>
);

// --- Component Definition ---

const BentoCard = ({ children, className = "", idx }: { children: React.ReactNode; className?: string; idx: number }) => {
  return (
    <div 
      className={`group relative w-full rounded-[2.5rem] bg-[#020305] border border-white/5 overflow-hidden transition-all duration-700 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_15px_30px_rgba(0,0,0,0.15)] ${className}`}
    >
      {/* Inner Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* Subtle Grid Background inside card */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] invert pointer-events-none" />
      
      {children}
    </div>
  );
};

export default function SecuritySection() {
  const cards = [
    {
      title: "Secure Authentication",
      badge: "IDENTITY LAYER",
      description: "Stateless, HTTP-only cookie-based JWT sessions. Passwords are hashed with bcryptjs and tokens are signed using high-entropy secrets.",
      features: ["HTTP-Only Cookies", "Bcrypt Password Hashing", "Stateless Architecture"],
      icon: Lock,
      visual: <AuthVisual />,
      color: "slate"
    },
    {
      title: "SQL Injection Defense",
      badge: "DATA INTEGRITY",
      description: "Type-safe Drizzle ORM ensures every query is strictly parameterized, making injection attacks mathematically impossible.",
      features: ["Type-Safe Queries", "Prepared Statements", "Strict Parameterization"],
      icon: Database,
      visual: <SQLVisual />,
      color: "slate"
    },
    {
      title: "Bank-Grade Encryption",
      badge: "CRYPTOGRAPHY",
      description: "Sensitive data like API keys are encrypted at rest using AES-256-GCM. We never store raw keys, keeping your connections secure.",
      features: ["AES-256-GCM Standard", "Encrypted at Rest", "Zero Raw Keys Stored"],
      icon: Key,
      visual: <AESVisual />,
      color: "slate"
    },
    {
      title: "Edge Rate Limiting",
      badge: "NETWORK DEFENSE",
      description: "Distributed Redis firewall immediately drops malicious requests and enforces strict rate limits across all global edge nodes.",
      features: ["Global Distributed Cache", "DDoS Mitigation", "Dynamic IP Blocking"],
      icon: Zap,
      visual: <RedisVisual />,
      color: "slate"
    }
  ];

  const getColorClass = (color: string) => {
    return 'bg-white text-black';
  };

  return (
    <section className="relative w-full bg-[#FAFAFA] font-inter pt-32 pb-64">
      
      {/* Master Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.05)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#slate-900_1px,transparent_1px),linear-gradient(to_bottom,#slate-900_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.02]" />
      </div>

      <div className="relative w-full max-w-[1300px] mx-auto z-10 px-6 sm:px-12 flex flex-col items-center">
        
        {/* CENTERED HEADER */}
        <div className="w-full flex flex-col items-center text-center z-20 mb-16 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-600">Zero-Trust Architecture</span>
            </div>

            <h2 className="font-inter text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] leading-tight mb-6">
              <span className="text-slate-900 font-medium">Built for Defense. </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                Already.
              </span>
            </h2>
            
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-3xl font-light">
              We don't sugarcoat security. Built on an enterprise-grade foundation designed to protect your tokens, enforce strict rate limits, and sanitize every single query.
            </p>
          </motion.div>
        </div>

        {/* CENTERED STACKING CARDS */}
        <div className="w-full flex flex-col relative">
          
          {cards.map((card, idx) => {
            const Icon = card.icon;
            // Calculate the sticky top position so they stack nicely in the center of the screen
            // 6rem gives enough space below the fixed header/navbar of the actual site
            const stickyTop = `calc(6rem + ${idx * 2.5}rem)`;

            return (
              <div 
                key={idx} 
                className="sticky w-full mb-12 lg:mb-24 transition-all duration-500"
                style={{ top: stickyTop }}
              >
                <BentoCard idx={idx} className="flex flex-col lg:flex-row min-h-[450px]">
                  
                  {/* Text Content (Left) */}
                  <div className="w-full lg:w-[45%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center z-20">
                    
                    {/* Minimal Top Element */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                        <Icon className="w-4 h-4 text-slate-200" strokeWidth={2} />
                      </div>
                      <div className="h-[1px] w-6 bg-white/10" />
                      <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-slate-500">
                        {card.badge}
                      </span>
                    </div>
                    
                    {/* Title & Description */}
                    <div className="mb-8">
                      <h3 className="text-2xl sm:text-3xl lg:text-[2rem] font-medium text-white mb-4 tracking-tight">
                        {card.title}
                      </h3>
                      <p className="text-slate-400 text-[15px] sm:text-base leading-relaxed max-w-md font-light">
                        {card.description}
                      </p>
                    </div>

                    {/* Sleek Feature Checklist */}
                    <div className="flex flex-col gap-3">
                      {card.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-3 text-[13.5px] text-slate-400/90 font-light tracking-wide">
                          <Check className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Visual (Right) */}
                  {card.visual}
                  
                </BentoCard>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

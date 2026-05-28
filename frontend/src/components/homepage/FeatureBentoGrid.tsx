"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Mail,
  GripVertical,
  FileText,
  Sparkles
} from "lucide-react";
import { FaJira, FaSlack } from "react-icons/fa";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function FeatureBentoGrid() {
  return (
    <section className="py-24 px-4 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-600">Platform Capabilities</span>
            </div>

            <h2 className="font-inter text-4xl sm:text-5xl lg:text-7xl tracking-[-0.02em] leading-tight mb-6">
              <span className="text-slate-900 font-medium">Everything </span>
              <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
                You Need.
              </span>
            </h2>
            
            <p className="text-slate-500 text-lg sm:text-xl leading-relaxed max-w-5xl font-light">
              A complete suite of features designed to keep you on top of every follow-up, task, and deadline.
            </p>
          </motion.div>
        </div>

        {/* Row 1: 3 equal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Card 1 — Intelligent Reminder Engine */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            {/* Visual mockup */}
            <div className="bg-gradient-to-br from-[#f5f3ff] to-[#faf5ff] rounded-[1.5rem] p-6 mb-6 h-[250px] relative overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)]" />
              <div className="relative z-10 w-full max-w-[220px] mx-auto space-y-3">
                {[
                  { label: "NORMAL", time: "60m interval", intensity: 1, color: "text-blue-500", bg: "bg-blue-500", ping: false },
                  { label: "PERSISTENT", time: "15m interval", intensity: 2, color: "text-violet-500", bg: "bg-violet-500", ping: false },
                  { label: "AGGRESSIVE", time: "5m interval", intensity: 3, color: "text-purple-600", bg: "bg-purple-600", ping: true },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="relative bg-white rounded-xl p-3 shadow-[0_8px_20px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-2 h-2 rounded-full ${item.bg} relative`}>
                        {item.ping && <div className={`absolute inset-0 rounded-full ${item.bg} animate-ping opacity-75`} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-gray-900 tracking-wider">{item.label}</span>
                        <span className="text-[9px] font-mono text-gray-400">{item.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 relative z-10">
                      {[1, 2, 3].map(level => (
                        <div key={level} className={`w-1.5 h-3 rounded-full ${level <= item.intensity ? item.bg : 'bg-gray-100'}`} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Intelligent Reminder Engine
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Automatic escalation from Normal to Aggressive. Never let a task slip through the cracks.
              </p>
            </div>
          </motion.div>

          {/* Card 2 — Jira Integration */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            {/* Visual mockup */}
            <div className="bg-gradient-to-br from-[#f5f3ff] to-[#faf5ff] rounded-[1.5rem] p-5 mb-6 h-[250px] relative overflow-hidden flex flex-col justify-center">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
              
              <div className="relative z-10 flex items-start justify-between w-full max-w-[240px] mx-auto mt-[-24px]">
                
                {/* Left Side (Jira) */}
                <div className="flex flex-col items-center gap-3 relative">
                  <div className="relative z-10">
                    <FaJira className="w-11 h-11 text-[#0052CC] drop-shadow-sm" />
                    <div className="absolute -top-1 -right-2 w-5 h-5 bg-[#0052CC] text-white text-[9px] font-bold flex items-center justify-center rounded-full border-[2.5px] border-white shadow-sm">3</div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 tracking-widest">WORKSPACE</span>
                </div>

                {/* Center Sync Indicator */}
                <div className="flex flex-col justify-center items-center flex-1 px-3 h-[44px]">
                   <div className="w-full relative flex flex-col items-center gap-2">
                     <span className="text-[8px] font-bold text-blue-500/80 tracking-[0.2em] uppercase">Webhooks</span>
                     {/* Single animated line */}
                     <div className="h-[2.5px] w-full bg-blue-100 rounded-full overflow-hidden relative">
                        <motion.div 
                          className="absolute top-0 bottom-0 left-0 w-1/3 bg-blue-500 rounded-full"
                          animate={{ x: ["-100%", "300%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                     </div>
                     <span className="text-[8px] font-bold text-purple-500/80 tracking-[0.2em] uppercase">REST API</span>
                   </div>
                </div>

                {/* Right Side (App) */}
                <div className="flex flex-col items-center gap-3 relative">
                  <div className="relative z-10">
                    <Image 
                      src="/FollowUpHubIcon.png" 
                      alt="FollowUpHub" 
                      width={44} 
                      height={44} 
                      className="w-11 h-11 object-contain drop-shadow-md"
                    />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 tracking-widest">ENGINE</span>
                </div>

              </div>


            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Jira Integration
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Bi-directional sync with automatic ticket mapping and encrypted credentials.
              </p>
            </div>
          </motion.div>

          {/* Card 3 — Slack Escalation */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            {/* Visual mockup */}
            <div className="bg-gradient-to-br from-[#fdf4ff] to-[#f5f3ff] rounded-[1.5rem] p-6 mb-6 h-[250px] relative overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.08)_0%,transparent_70%)]" />
              <div className="relative z-10 w-full max-w-[220px] mx-auto space-y-4">
                {/* Slack message bubble */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#4A154B] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <FaSlack className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-800 mb-1">FollowUpHub</p>
                      <p className="text-[11px] text-gray-500 leading-snug">ENG-402 escalated to Level 2. Attention required.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 px-2">
                  {[80, 60].map((w, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                      style={{ width: `${w}%`, transformOrigin: "left" }}
                      className="h-1.5 bg-fuchsia-200/60 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Slack Escalation
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Critical alerts sent directly to your team channels when tickets reach escalation level 2+.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Row 2: 2 cards (wide + narrow) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          {/* Card 4 — Real-Time Notifications (wide) */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="md:col-span-3 bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            {/* Visual mockup */}
            <div className="bg-gradient-to-br from-[#f8f5ff] to-[#f3f0ff] rounded-[1.5rem] p-6 mb-6 min-h-[220px] relative overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.15)_0%,transparent_70%)]" />
              
              <div className="relative z-10 max-w-sm mx-auto w-full space-y-3">
                {[
                  {
                    title: "Follow-up Overdue",
                    msg: "Client meeting is 2 hours overdue",
                    dot: "bg-violet-400"
                  },
                  {
                    title: "Escalation Level 2",
                    msg: "JIRA-402 escalated to your manager",
                    dot: "bg-purple-400"
                  },
                  {
                    title: "Task Completed",
                    msg: "HR follow-up marked as complete",
                    dot: "bg-fuchsia-400"
                  },
                ].map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-center gap-4 bg-white/60 backdrop-blur-md rounded-2xl px-5 py-3.5 shadow-sm border border-white"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800 leading-tight mb-0.5">{n.title}</p>
                      <p className="text-[11px] text-gray-500 truncate">{n.msg}</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                      className={`w-2 h-2 rounded-full ${n.dot} flex-shrink-0 shadow-[0_0_8px_currentColor] opacity-80`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Real-Time Notifications
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed max-w-lg">
                Instant push via Socket.IO with Redis adapter. In-app, email, and Slack — all synchronized in real time.
              </p>
            </div>
          </motion.div>

          {/* Card 5 — Dashboard Analytics (narrow) */}
          <motion.div
            custom={4}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="md:col-span-2 bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            {/* Visual mockup */}
            <div className="bg-[#fcfdff] rounded-[1.5rem] p-0 mb-6 min-h-[220px] relative overflow-hidden flex flex-col justify-end border border-gray-50">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(#f1f5f9_1px,transparent_1px),linear-gradient(90deg,#f1f5f9_1px,transparent_1px)] bg-[length:30px_30px]" />
              
              {/* Tooltip */}
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
                className="absolute z-30 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 px-3 py-2 pointer-events-none right-4 top-4"
              >
                <div className="text-[9px] text-gray-500 font-medium mb-1">June 27</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                    <span className="text-[13px] font-bold text-gray-900">$3,128</span>
                  </div>
                  <span className="text-[10px] text-[#4f46e5] font-bold flex items-center">
                    ↑ 42.1%
                  </span>
                </div>
              </motion.div>

              {/* Cursor Pointer */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.8, type: "spring", damping: 15 }}
                className="absolute z-30 pointer-events-none"
                style={{ left: "85%", top: "28%", transform: "translate(-4px, -4px)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4L11.082 22.4098C11.3197 23.0282 12.1866 23.0766 12.4851 22.4883L15.4214 16.702C15.5435 16.4614 15.7337 16.2625 15.9678 16.1337L21.5794 13.0456C22.1558 12.7285 22.0911 11.8711 21.4651 11.6241L4 4Z" fill="white" stroke="black" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              {/* X Axis Labels */}
              <div className="absolute bottom-2 w-full flex justify-between px-3 z-20">
                <span className="text-[9px] font-medium text-gray-400 bg-[#fcfdff]/80 px-1 rounded">June 15</span>
                <span className="text-[9px] font-medium text-gray-400 bg-[#fcfdff]/80 px-1 rounded">June 20</span>
                <span className="text-[9px] font-medium text-gray-400 bg-[#fcfdff]/80 px-1 rounded">June 25</span>
                <span className="text-[9px] font-medium text-gray-400 bg-[#fcfdff]/80 px-1 rounded">June 31</span>
              </div>

              {/* Glowing Animated Line */}
              <motion.div
                className="absolute inset-0 z-10"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                whileInView={{ clipPath: "inset(0 0 0 0)" }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
              >
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(99, 102, 241, 0.2)" />
                      <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                    </linearGradient>
                  </defs>
                  <path 
                     d="M 0,95 C 7.5,95 7.5,10 15,10 C 25,10 25,80 35,80 C 45,80 45,50 55,50 C 62.5,50 62.5,80 70,80 C 77.5,80 77.5,28 85,28 C 92.5,28 92.5,45 100,45 L100,100 L0,100 Z" 
                     fill="url(#lineGrad)" 
                  />
                  <path 
                     d="M 0,95 C 7.5,95 7.5,10 15,10 C 25,10 25,80 35,80 C 45,80 45,50 55,50 C 62.5,50 62.5,80 70,80 C 77.5,80 77.5,28 85,28 C 92.5,28 92.5,45 100,45" 
                     fill="none" 
                     stroke="#6366f1" 
                     strokeWidth="2" 
                     vectorEffect="non-scaling-stroke"
                     strokeLinecap="round"
                  />
                </svg>
              </motion.div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Dashboard Analytics
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-4">
                Real-time performance insights tracking conversion rates, automated task execution, and agent response times across all connected workspaces.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-violet-50 text-violet-600 text-[10px] font-bold rounded-md tracking-wide uppercase">
                  Live Data
                </span>
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-md tracking-wide uppercase border border-gray-100">
                  Custom Metrics
                </span>
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-md tracking-wide uppercase border border-gray-100">
                  Export Ready
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 3: 3 equal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 6 — Drag & Drop To-Dos */}
          <motion.div
            custom={5}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            <div className="bg-gradient-to-br from-[#f4f1ff] to-[#faf5ff] rounded-[1.5rem] p-6 mb-6 min-h-[220px] relative overflow-hidden flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.12)_0%,transparent_70%)]" />
              <div className="relative z-10 w-full max-w-[200px] space-y-2">
                {/* Background placeholder */}
                <div className="w-full h-[46px] rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50" />
                
                {/* Static items */}
                <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-white">
                  <GripVertical className="w-4 h-4 text-gray-300" />
                  <span className="text-[12px] font-medium text-gray-700">Send follow-up email</span>
                  <div className="w-2 h-2 rounded-full bg-purple-400 ml-auto" />
                </div>
                <div className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-white">
                  <GripVertical className="w-4 h-4 text-gray-300" />
                  <span className="text-[12px] font-medium text-gray-700">Update Jira ticket</span>
                  <div className="w-2 h-2 rounded-full bg-fuchsia-400 ml-auto" />
                </div>

                {/* Actively Dragging Item */}
                <motion.div 
                  animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[-15px] left-2 w-[105%] bg-white rounded-2xl p-3 flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(139,92,246,0.3)] border border-violet-100 z-10 cursor-grabbing"
                >
                  <GripVertical className="w-4 h-4 text-violet-400" />
                  <span className="text-[12px] font-bold text-gray-900">Review client proposal</span>
                  <div className="w-2 h-2 rounded-full bg-violet-500 ml-auto animate-pulse" />
                </motion.div>
              </div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Drag & Drop To-Dos
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Daily task management with incredibly smooth and satisfying reordering.
              </p>
            </div>
          </motion.div>

          {/* Card 7 — Email Templates */}
          <motion.div
            custom={6}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            <div className="bg-gradient-to-br from-[#fcf5ff] to-[#f5f3ff] rounded-[1.5rem] p-6 mb-6 min-h-[220px] relative overflow-hidden flex flex-col justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1)_0%,transparent_70%)]" />
              <div className="relative z-10 max-w-[200px] mx-auto w-full">
                {/* Email mockup */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white mb-4">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100/50">
                    <Mail className="w-4 h-4 text-fuchsia-500" />
                    <span className="text-[11px] font-semibold text-gray-700">Follow-up Reminder</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 bg-fuchsia-100/50 rounded-full w-full" />
                    <div className="h-1.5 bg-fuchsia-100/50 rounded-full w-4/5" />
                    <div className="h-1.5 bg-fuchsia-100/50 rounded-full w-3/5" />
                  </div>
                  <div className="mt-4 bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-xl px-3 py-2 text-center shadow-sm">
                    <span className="text-[10px] font-semibold text-white tracking-wider uppercase">View Follow-up →</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Email Templates
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Customizable, beautiful HTML email templates for reminders and digests.
              </p>
            </div>
          </motion.div>

          {/* Card 8 — Follow-up Templates */}
          <motion.div
            custom={7}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-[2rem] p-2 pb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
          >
            <div className="bg-gradient-to-br from-[#f5f3ff] to-[#f8f5ff] rounded-[1.5rem] p-6 mb-6 min-h-[220px] relative overflow-hidden flex flex-col justify-center items-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
              
              <div className="relative z-10 w-[160px] h-[130px] mt-4">
                {/* Back card */}
                <motion.div 
                   initial={{ rotate: -15, x: -25, y: 15 }}
                   whileInView={{ rotate: -15, x: -25, y: 15 }}
                   className="absolute inset-0 bg-white/40 backdrop-blur-sm rounded-2xl border border-white p-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="w-1/2 h-2 bg-purple-200/50 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-gray-100/50 rounded-full" />
                    <div className="w-4/5 h-1.5 bg-gray-100/50 rounded-full" />
                  </div>
                </motion.div>

                {/* Middle card */}
                <motion.div 
                   initial={{ rotate: 12, x: 25, y: 5 }}
                   whileInView={{ rotate: 12, x: 25, y: 5 }}
                   className="absolute inset-0 bg-white/70 backdrop-blur-md rounded-2xl border border-white p-4 flex flex-col justify-between shadow-sm"
                >
                  <div className="w-1/2 h-2 bg-fuchsia-200 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                    <div className="w-4/5 h-1.5 bg-gray-100 rounded-full" />
                  </div>
                </motion.div>

                {/* Front card */}
                <motion.div 
                   initial={{ rotate: 0, x: 0, y: 0 }}
                   whileInView={{ rotate: 0, x: 0, y: 0 }}
                   whileHover={{ y: -5, scale: 1.05 }}
                   className="absolute inset-0 bg-white rounded-2xl border border-violet-100 p-4 shadow-[0_15px_35px_rgb(139,92,246,0.15)] flex flex-col z-10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 leading-tight">Client<br/>Check-In</span>
                  </div>
                  <div className="space-y-1.5 mt-auto">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                    <div className="w-full h-1.5 bg-gray-100 rounded-full" />
                    <div className="w-2/3 h-1.5 bg-gray-100 rounded-full" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-gray-400">Reused 142x</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-violet-50 text-violet-600">HIGH</span>
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="px-5">
              <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
                Follow-up Templates
              </h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">
                Reusable blueprints with default priority, policy, and due offset for quick creation.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

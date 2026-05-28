"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#020305] overflow-hidden pt-16 font-sans border-t border-white/[0.04]">
      
      {/* Background Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
         <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col items-center">
        
        {/* Call to Action Section (Premium Glass Card) */}
        <div className="relative w-full max-w-6xl mx-auto mb-16">
          {/* Subtle glow behind the card */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-3xl rounded-[2.5rem]" />
          
          <div className="relative border border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] p-10 sm:p-14 lg:p-16 flex flex-col items-center justify-center text-center shadow-2xl">
             
             <h2 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-6">
               Ready to never <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">drop the ball</span> again?
             </h2>
             <p className="text-slate-400 text-lg sm:text-xl max-w-2xl font-light mb-10">
               Automate your escalation policies, track tasks in real-time, and ensure every follow-up reaches resolution.
             </p>
             
             <div className="flex justify-center w-full sm:w-auto">
               <Link href="/signup" className="group flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white text-[#03050A] font-semibold text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] w-full sm:w-auto">
                 Get Started Free
                 <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </Link>
             </div>
          </div>
        </div>
      </div>

      {/* Edge-to-Edge Massive Logo */}
      <div className="relative z-10 w-full mt-4 translate-y-[27%] select-none">
        <svg className="w-full h-auto" viewBox="0 0 1000 150" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="footerTextGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <text 
            x="50%" 
            y="50%" 
            dominantBaseline="middle" 
            textAnchor="middle" 
            className="font-black" 
            style={{ fontSize: '135px', letterSpacing: '-0.04em' }}
            fill="url(#footerTextGradient)"
          >
            FOLLOWUPHUB
          </text>
        </svg>
      </div>
    </footer>
  );
}

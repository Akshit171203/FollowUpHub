"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#020305] overflow-hidden pt-32 pb-8 font-sans border-t border-white/[0.04]">
      
      {/* Background Atmospheric Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
         <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 sm:px-12 flex flex-col items-center">
        
        {/* Call to Action Section (Centered for maximum impact) */}
        <div className="flex flex-col items-center justify-center text-center mb-32 relative">
           <h2 className="text-5xl sm:text-6xl lg:text-[4.5rem] font-medium tracking-tight text-white mb-6">
             Ready to never <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-fuchsia-400">drop the ball</span> again?
           </h2>
           <p className="text-slate-400 text-lg sm:text-xl max-w-xl font-light mb-12">
             Automate your escalation policies, track tasks in real-time, and ensure every follow-up reaches resolution.
           </p>
           
           <div className="flex justify-center mt-8">
             <Link href="/signup" className="group flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-white/90 text-[#03050A] font-semibold text-[15px] hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)]">
               Get Started
               <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
             </Link>
           </div>
        </div>

        {/* Edge-to-Edge Massive Logo */}
        <div className="w-full mt-10 mb-8 select-none">
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

        {/* Bottom Bar */}
        <div className="flex justify-center items-center text-xs font-light text-slate-500 pt-6 w-full border-t border-white/5">
           <p>© {new Date().getFullYear()} FollowUpHub Inc. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}

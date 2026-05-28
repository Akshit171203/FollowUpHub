"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AbstractNetworkVisual from "./AbstractNetworkVisual";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-8 overflow-hidden bg-[#03050A] text-slate-300 font-inter pt-20">

      {/* ATMOSPHERE, LIGHTING & SPLINE-ALTERNATIVE */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <AbstractNetworkVisual />
        
        {/* Film Grain / Noise Texture (enhanced) */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZUZpbHRlcikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')" }}
        />
        
        {/* Subtle grid base */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_20%,transparent_100%)] pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full z-10 flex flex-col items-center text-center mt-[-5vh]">
        <div className="flex flex-col items-center">
          {/* Main heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="font-inter text-5xl md:text-[6rem] lg:text-[7.5rem] font-medium tracking-[-0.03em] leading-[1] mb-8 text-white relative"
          >
            <span className="text-white font-medium relative z-10">Never Drop<br /></span>
            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500 relative z-10">
              The Ball Again.
            </span>
          </motion.h1>

          {/* Minimal copy */}
          <motion.p 
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Automated escalation policies, real-time tracking, and a visual dashboard to ensure every task and follow-up reaches resolution.
          </motion.p>

          {/* Premium Dual CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-5 mt-2 w-full max-w-md mx-auto sm:max-w-none"
          >
            {/* Secondary CTA */}
            <Link href="#features" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/5 border border-white/10 backdrop-blur-md text-slate-200 font-medium text-[15px] px-8 py-3.5 rounded-full hover:text-white transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] w-full sm:w-auto"
              >
                Explore Features
              </motion.button>
            </Link>

            {/* Primary CTA */}
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(255,255,255,0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-white text-[#03050A] font-semibold text-[15px] px-8 py-3.5 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 w-full sm:w-auto group"
              >
                Get Started Free
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

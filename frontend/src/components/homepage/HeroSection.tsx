"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 lg:px-8 overflow-hidden bg-[#03050A] text-slate-300 font-inter pt-20">

      {/* ATMOSPHERE & LIGHTING */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft, massive cinematic radial glow */}
        <motion.div 
          animate={{ opacity: [0.1, 0.15, 0.1] }} 
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-900/20 rounded-full blur-[200px]" 
        />
        
        {/* Grain/Noise Texture for filmic quality */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZUZpbHRlcikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />
      </div>

      <div className="relative max-w-7xl mx-auto w-full z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.04] bg-white/[0.01] backdrop-blur-md mb-10">
            <Sparkles className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-slate-400">
              Intelligent CRM Platform
            </span>
          </div>

          {/* Main heading */}
          <h1 className="font-inter text-5xl md:text-[6rem] lg:text-[7.5rem] font-medium tracking-[-0.03em] leading-[1] mb-8 text-white">
            Never Drop<br />
            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-purple-400 to-fuchsia-400">
              The Ball Again
            </span>
          </h1>

          {/* Minimal copy */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-16 font-light leading-relaxed tracking-tight">
            Automated escalation policies, real-time tracking, and a visual dashboard to ensure every task and follow-up reaches resolution.
          </p>

          {/* Minimal Luxury CTA Buttons */}
          <div className="flex justify-center mt-8">
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,1)", color: "#000" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="bg-white/90 text-[#03050A] font-semibold text-[15px] tracking-wide px-10 py-4 rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] transition-all flex items-center gap-2"
              >
                Get Started
                <Sparkles className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

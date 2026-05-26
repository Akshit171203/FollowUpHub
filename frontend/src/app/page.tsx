"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import HeroSection from "@/components/homepage/HeroSection";
import FeatureBentoGrid from "@/components/homepage/FeatureBentoGrid";
import RealTimeDemo from "@/components/homepage/RealTimeDemo";
import ArchitectureVisualization from "@/components/homepage/ArchitectureVisualization";
import SecuritySection from "@/components/homepage/SecuritySection";
import Footer from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#03050A] font-sans text-slate-300 antialiased selection:bg-cyan-500/30">
      {/* Navigation - Floating Modern UI */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 md:px-0">
        <div className="bg-[#0A0C10]/95 backdrop-blur-3xl border border-white/10 rounded-full px-4 md:px-6 py-2.5 flex items-center justify-between shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center shrink-0">
              <img 
                src="/FollowUpHub.png" 
                alt="FollowUpHub" 
                className="h-6 md:h-7 w-auto object-contain drop-shadow-md brightness-0 invert"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {['Features', 'Demo', 'Architecture', 'Security'].map((item) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-300 text-slate-300 hover:text-white hover:bg-white/5"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-2">
            <Link
              href="/login"
              className="hidden sm:block text-[13px] font-medium px-4 py-2 rounded-full transition-all duration-300 text-slate-300 hover:text-white hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="font-semibold text-[13px] px-5 py-2 rounded-full transition-all bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
              >
                Get Started
              </motion.button>
            </Link>
            <button className="md:hidden p-2 text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content - Cinematic Scroll */}
      <main className="flex flex-col">
        <HeroSection />

        <div id="features" className="scroll-mt-24">
          <FeatureBentoGrid />
        </div>

        <div id="demo" className="scroll-mt-24">
          <RealTimeDemo />
        </div>

        <div id="architecture" className="scroll-mt-24">
          <ArchitectureVisualization />
        </div>

        <div id="security" className="scroll-mt-24">
          <SecuritySection />
        </div>
      </main>

      {/* Premium Footer */}
      <Footer />
    </div>
  );
}

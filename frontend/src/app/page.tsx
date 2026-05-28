"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, ChevronDown } from "lucide-react";
import { useState } from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeatureBentoGrid from "@/components/homepage/FeatureBentoGrid";
import RealTimeDemo from "@/components/homepage/RealTimeDemo";
import JiraIntegrationSection from "@/components/homepage/JiraIntegrationSection";
import ArchitectureVisualization from "@/components/homepage/ArchitectureVisualization";
import SecuritySection from "@/components/homepage/SecuritySection";
import Footer from "@/components/homepage/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#03050A] font-sans text-slate-300 antialiased selection:bg-cyan-500/30">
      {/* Navigation - Dark Pill */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[95%] xl:max-w-[1100px] transition-all duration-300">
        <div className="bg-black rounded-2xl px-6 py-3.5 flex items-center justify-between border border-white/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 pl-2">
            <motion.div whileHover={{ scale: 1.02 }} className="flex items-center shrink-0 transition-transform">
              <img 
                src="/FollowUpHub.png" 
                alt="FollowUpHub" 
                className="h-6 md:h-7 w-auto object-contain brightness-0 invert opacity-90"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Integration', 'Architecture', 'Security'].map((item) => (
              <Link 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="text-[13px] font-medium text-slate-300 hover:text-white transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-5">
            <Link
              href="/login"
              className="hidden sm:block text-[13px] font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="font-semibold text-[13px] px-6 py-2.5 rounded-xl transition-all bg-white text-black hover:bg-slate-50"
              >
                Get Started
              </motion.button>
            </Link>
            <button className="md:hidden p-2 text-slate-300 hover:text-white">
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

        <div id="integration" className="scroll-mt-24">
          <JiraIntegrationSection />
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

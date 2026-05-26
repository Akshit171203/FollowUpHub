"use client";

import Image from "next/image";
import Link from "next/link";
import { AuthBentoGrid } from "@/components/AuthBentoGrid";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 lg:p-8 relative">
      {/* Absolute Logo Top-Left */}
      <div className="absolute top-0 mt-4 left-4 z-10 hidden md:block">
         <Link href="/" className="className='block'">
            <Image
              src="/FollowUpHub.png"
              alt="FollowUpHub Logo"
              width={160}
              height={160}
              className="rounded-md object-contain"
            />
         </Link>
      </div>
      
      {/* Mobile Logo (Centered) */}
      <div className="absolute top-6 left-0 right-0 z-10 md:hidden flex justify-center">
         <Link href="/">
            <Image
              src="/FollowUpHub.png"
              alt="FollowUpHub Logo"
              width={100}
              height={100}
              className="rounded-md object-contain"
            />
         </Link>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-[1200px] min-h-[600px] h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-card border rounded-[2rem] shadow-2xl overflow-hidden mt-16 md:mt-0 relative">
        
        {/* Left Side (Content/Form) */}
        <div className="flex flex-col justify-center px-4 sm:px-6 md:px-8 lg:px-12 py-6 overflow-y-auto relative">
          <div className="w-full max-w-xl mx-auto relative z-10">
             {children}
          </div>
        </div>

        {/* Right Side - Bento Grid */}
        <AuthBentoGrid />

      </div>
    </div>
  );
}

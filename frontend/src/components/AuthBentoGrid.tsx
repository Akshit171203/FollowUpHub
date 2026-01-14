'use client';

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Lottie from "lottie-react";
import { AnimatedList } from "@/components/ui/animated-list";

// Notification Item Component
const NotificationItem = ({ icon, color, title, subtitle }: { icon: string, color: string, title: string, subtitle: string }) => {
  return (
    <figure className={cn(
      "relative mx-auto min-h-fit w-full cursor-pointer overflow-hidden rounded-xl bg-white p-2",
      "transition-all duration-200 ease-in-out hover:scale-[1.03]",
      "shadow-sm border border-gray-100/50 hover:shadow-md",
    )}>
      <div className="flex flex-row items-center gap-2.5">
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full text-lg", color)}>
          <span className="scale-75">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-xs font-bold text-gray-900">
            <span className="text-xs leading-none">{title}</span>
            <span className="mx-1">·</span>
            <span className="text-[10px] text-gray-400 font-normal">{subtitle.split("·")[1]}</span>
          </figcaption>
          <p className="text-[10px] font-normal text-gray-500 leading-tight">
            {subtitle.split("·")[0]}
          </p>
        </div>
      </div>
    </figure>
  );
};

// Card Component
const Card = ({ className, children, style }: { className?: string, children: React.ReactNode, style?: React.CSSProperties }) => (
  <div 
    className={cn(
      "absolute rounded-[28px] shadow-2xl transition-all duration-300 hover:scale-[1.02]", 
      className
    )}
    style={style}
  >
    {children}
  </div>
);

export function AuthBentoGrid() {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch('/Hero section Background animation.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Failed to load animation:", err));
  }, []);

  return (
    <div className="hidden lg:flex relative bg-black items-center justify-center overflow-hidden h-full w-full">
      {/* Background Animation - Diagonal */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 pointer-events-none">
        {animationData && (
          <div 
            className="absolute inset-0 w-full h-full transform scale-150 -rotate-45"
            style={{ filter: 'invert(37%) sepia(74%) saturate(2363%) hue-rotate(202deg) brightness(96%) contrast(97%)' }}
          >
            <Lottie animationData={animationData} loop={true} />
          </div>
        )}
      </div>

      {/* Container for the cluster */}
      <div className="relative z-10 w-[500px] h-[700px] flex items-center justify-center">
        
        {/* Main Card (Pink Gradient Background) - Shifted Left & Up */}
        <Card 
            className="z-10 bg-white overflow-hidden flex flex-col p-4"
            style={{
                width: '70%',
                height: '55%',
                top: '15%',
                left: '5%',
                background: 'linear-gradient(135deg, #FFD6E8 0%, #FFB6D4 100%)'
            }}
        >
             {/* Illustration Placeholder - Pink Area */}
             <div className="w-full h-[55%] rounded-2xl bg-white/40 mb-3 overflow-hidden relative group backdrop-blur-sm border border-white/40">
                <div className="absolute inset-0 flex items-center justify-center">
                   {/* 3D Decorative Elements */}
                   <div className="relative w-full h-full"> 
                      <div className="absolute top-1/4 left-8 w-14 h-14 bg-gradient-to-br from-orange-300 to-orange-400 rounded-2xl shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-500"></div>
                      <div className="absolute top-1/3 right-12 w-10 h-10 bg-gradient-to-bl from-purple-300 to-purple-400 rounded-xl shadow-lg transform rotate-12 group-hover:-rotate-6 transition-transform duration-500"></div>
                      <div className="absolute bottom-4 left-1/3 w-20 h-20 bg-gradient-to-tr from-red-300 to-pink-400 rounded-full shadow-xl blur-[1px] group-hover:scale-110 transition-transform duration-500"></div>
                  </div>
                </div>
                {/* Floating Badge */}
                <div className="absolute top-3 left-3 bg-white/80 backdrop-blur text-xs font-semibold px-2 py-1 rounded-full text-pink-700 shadow-sm">
                   Start Here
                </div>
             </div>

             <div className="px-2 flex-1 flex flex-col">
               <h3 className="text-xl font-black text-gray-900 leading-tight mb-2">
                 MASTER YOUR<br/>INBOX
               </h3>
               <p className="text-gray-700 text-[10px] font-medium leading-relaxed mb-2 opacity-80">
                 Keep your conversations organized and never miss a lead.
               </p>
               
               <button className="w-full bg-white text-pink-600 text-xs font-bold py-2.5 rounded-full mt-auto hover:bg-pink-50 transition shadow-sm flex items-center justify-center gap-1 group">
                 Get Started <span className="group-hover:translate-x-0.5 transition-transform">→</span>
               </button>
             </div>
        </Card>

        {/* Bottom Right White Card - "Learn Figma" equivalent */}
        <Card 
            className="z-20 bg-white flex flex-col p-4"
            style={{
                width: '70%',
                height: '55%',
                bottom: '12%',
                right: '-5%',
            }}
        >
             {/* Animated Notifications List */}
             <div className="w-full h-[55%] mb-2 overflow-hidden relative shading-mask rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 p-2">
                <AnimatedList delay={1500} className="w-full gap-2">
                   <NotificationItem 
                      icon="👤" 
                      color="bg-blue-100 text-blue-600" 
                      title="New User" 
                      subtitle="Sarah J. joined team · 2m ago" 
                   />
                   <NotificationItem 
                      icon="💰" 
                      color="bg-green-100 text-green-600" 
                      title="Payment Received" 
                      subtitle="$49.00 from Alex · 15m ago" 
                   />
                   <NotificationItem 
                      icon="📧" 
                      color="bg-purple-100 text-purple-600" 
                      title="Campaign Sent" 
                      subtitle="Outreach #42 active · 1h ago" 
                   />
                   <NotificationItem 
                      icon="💬" 
                      color="bg-orange-100 text-orange-600" 
                      title="New Reply" 
                      subtitle="Interested in demo · 2h ago" 
                   />
                </AnimatedList>
                {/* Gradient Fade at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white/0 to-transparent z-10"></div>
             </div>

             <div className="px-2 flex-1 flex flex-col justify-end">
               <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">
                 AUTOMATE<br/>FOLLOW-UPS
               </h3>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-2">by FollowUpHub</p>
             
               <div className="flex items-center gap-3 text-gray-500 text-[10px] font-semibold mb-3">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">⏱️ Smart Timing</span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">📨 Auto-Reply</span>
               </div>

               <p className="text-gray-600 text-[10px] leading-relaxed font-medium mb-auto">
                 Stop chasing leads manually. Build automated email sequences that follow up for you, turning cold leads into active conversations.
               </p>

               <div className="flex items-center justify-between mt-4">
                 <div className="text-xl font-bold text-gray-900">$29<span className="text-[10px] font-normal text-gray-400">/mo</span></div>
                 <button className="bg-black text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xl hover:bg-gray-800 transition transform hover:-translate-y-0.5">
                   Start Now
                 </button>
               </div>
             </div>
        </Card>

        {/* Overlay A (Top Right) - Stats - Reply Rate */}
        <Card 
          className="z-30 bg-white p-5 flex flex-col justify-center"
          style={{ 
            width: '45%', 
            height: '18%', 
            top: '8%', 
            right: '-5%' 
          }}
        >
          <div className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-2">Reply Rate</div>
          <div className="flex items-end justify-between mb-3">
            <div className="text-3xl font-black text-gray-900 tracking-tight">45.2%</div>
            <div className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded-full font-bold">↑ 24%</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </Card>

        {/* Overlay C (Bottom Left) - Dark Blue - "Happy Students" equivalent */}
        <Card 
          className="z-50 bg-[#FBE7C6] text-black p-5 flex flex-col justify-between shadow-[0_20px_50px_-12px_rgba(45,91,255,0.5)]"
          style={{ 
            width: '45%', 
            height: '18%', 
            bottom: '8%', 
            left: '4%' 
          }}
        >
           <div>
             <div className="text-lg font-bold mb-1">Seamless Sync</div>
             <div className="flex items-center gap-1 text-sm font-medium opacity-80">
                <span>Connects with your favorite tools</span>
             </div>
           </div>
           
           <div className="flex items-center justify-between mt-2">
              <div className="flex -space-x-3">
                 <div className="w-10 h-10 rounded-full border-2 border-[#FBE7C6] bg-white flex items-center justify-center text-red-600 font-bold text-xs shadow-sm" title="Gmail">G</div>
                 <div className="w-10 h-10 rounded-full border-2 border-[#FBE7C6] bg-white flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm" title="Outlook">O</div>
                 <div className="w-10 h-10 rounded-full border-2 border-[#FBE7C6] bg-white flex items-center justify-center text-purple-600 font-bold text-xs shadow-sm" title="Yahoo">Y</div>
                 <div className="w-10 h-10 rounded-full border-2 border-[#FBE7C6] bg-white flex items-center justify-center text-green-600 font-bold text-xs shadow-sm" title="IMAP">I</div>
              </div>
              <div className="bg-white text-gray-900 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                 1-Click
              </div>
           </div>
        </Card>

      </div>
    </div>
  );
}

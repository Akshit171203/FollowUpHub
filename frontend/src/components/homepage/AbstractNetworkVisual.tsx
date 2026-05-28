"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AbstractNetworkVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* Soft Ambient Glows */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-purple-900/20 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-900/20 rounded-full blur-[100px]"
      />

      {/* Abstract Spline-like Lines (Glass Neural Mesh) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Orbit Lines */}
        {[
          { r: 250, dash: "4 24", dur: 40 },
          { r: 350, dash: "2 30", dur: 60 },
          { r: 450, dash: "6 40", dur: 80 },
        ].map((circle, i) => (
          <motion.circle
            key={i}
            cx="500"
            cy="500"
            r={circle.r}
            stroke="url(#line-gradient)"
            strokeWidth="1"
            strokeDasharray={circle.dash}
            style={{ originX: "500px", originY: "500px" }}
            animate={{ rotate: 360 }}
            transition={{
              duration: circle.dur,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Neural Connections */}
        <motion.path
          d="M150 400 Q500 100 850 400 T900 800"
          stroke="url(#line-gradient)"
          strokeWidth="1.5"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M100 700 Q500 900 850 400 T950 50"
          stroke="url(#line-gradient)"
          strokeWidth="1.5"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Glowing Nodes */}
        {[
          { x: 150, y: 400, delay: 0 },
          { x: 850, y: 400, delay: 2 },
          { x: 900, y: 800, delay: 4 },
          { x: 500, y: 250, delay: 1 },
          { x: 500, y: 725, delay: 3 },
        ].map((node, i) => (
          <motion.circle
            key={`node-${i}`}
            cx={node.x}
            cy={node.y}
            r="3"
            fill="rgba(255,255,255,0.8)"
            filter="url(#glow)"
            animate={{
              r: [3, 5, 3],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: node.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

"use client";

import { useRef, useEffect, useState } from "react";
import { useInView } from "framer-motion";
import { FaJira, FaSlack, FaGoogle, FaGithub } from "react-icons/fa";
import { Mail, Plug } from "lucide-react";

const integrations = [
  { id: "jira", label: "Jira", icon: <FaJira className="w-8 h-8 text-[#0052CC]" /> },
  { id: "slack", label: "Slack", icon: <FaSlack className="w-8 h-8 text-[#E01E5A]" /> },
  { id: "google", label: "Google", icon: <FaGoogle className="w-8 h-8 text-[#4285F4]" /> },
  { id: "github", label: "GitHub", icon: <FaGithub className="w-8 h-8 text-[#24292e]" /> },
  { id: "email", label: "Email", icon: <Mail className="w-8 h-8 text-[#F97316]" /> },
];

export default function IntegrationShowcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (isInView) {
      const t = setTimeout(() => setDrawn(true), 200);
      return () => clearTimeout(t);
    }
  }, [isInView]);

  return (
    <section className="py-28 px-4 bg-[#f7f7f9]" id="integrations" ref={sectionRef}>
      <style>{`
        .int-card {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow:
            0 1px 2px rgba(0,0,0,0.03),
            0 4px 16px rgba(0,0,0,0.04),
            0 12px 40px rgba(0,0,0,0.03),
            inset 0 1px 0 rgba(255,255,255,0.9);
          cursor: default;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .int-card:hover {
          transform: translateY(-4px) scale(1.06);
          box-shadow:
            0 2px 4px rgba(0,0,0,0.04),
            0 8px 24px rgba(0,0,0,0.06),
            0 20px 48px rgba(0,0,0,0.04),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .connector-path {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          transition: stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .connector-path.drawn {
          stroke-dashoffset: 0;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div
          className="text-center mb-20 transition-all duration-700 ease-out"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(28px)",
          }}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-1.5 mb-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <Plug className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Integrations</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-gray-900 mb-5 leading-[1.08] tracking-tight">
            Works With Tools You<br />Already Use
          </h2>
          <p className="text-[17px] text-gray-400 max-w-[440px] mx-auto leading-relaxed">
            FollowUpHub connects with your favorite apps, so you don&apos;t
            have to start from scratch or change your flow.
          </p>
        </div>

        {/* Diagram */}
        <div
          className="relative mx-auto transition-opacity duration-700 delay-200"
          style={{ maxWidth: 900, opacity: isInView ? 1 : 0 }}
        >
          <svg viewBox="0 0 900 520" className="w-full h-auto" fill="none">

            {/* One smooth continuous U-path: left side */}
            <path
              className={`connector-path ${drawn ? "drawn" : ""}`}
              d="M 90,360  C 70,280  150,200  220,175  C 290,150  380,80   450,50"
              stroke="#dddde0"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              style={{ transitionDelay: "0.3s" }}
            />
            {/* One smooth continuous U-path: right side */}
            <path
              className={`connector-path ${drawn ? "drawn" : ""}`}
              d="M 450,50   C 520,80  610,150  680,175  C 750,200  830,280  810,360"
              stroke="#dddde0"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              style={{ transitionDelay: "0.5s" }}
            />
            {/* Bottom sweep: left to center */}
            <path
              className={`connector-path ${drawn ? "drawn" : ""}`}
              d="M 90,390   C 130,460  280,500  450,500"
              stroke="#dddde0"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              style={{ transitionDelay: "0.7s" }}
            />
            {/* Bottom sweep: right to center */}
            <path
              className={`connector-path ${drawn ? "drawn" : ""}`}
              d="M 810,390  C 770,460  620,500  450,500"
              stroke="#dddde0"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
              style={{ transitionDelay: "0.9s" }}
            />

            {/* ── Cards via foreignObject ── */}

            {/* Jira — top center */}
            <foreignObject x="400" y="0" width="100" height="110" className="overflow-visible">
              <CardInner item={integrations[0]} visible={isInView} delay={400} />
            </foreignObject>

            {/* Google — mid left */}
            <foreignObject x="168" y="125" width="100" height="110" className="overflow-visible">
              <CardInner item={integrations[2]} visible={isInView} delay={550} />
            </foreignObject>

            {/* Slack — mid right */}
            <foreignObject x="630" y="125" width="100" height="110" className="overflow-visible">
              <CardInner item={integrations[1]} visible={isInView} delay={700} />
            </foreignObject>

            {/* GitHub — bottom left */}
            <foreignObject x="40" y="310" width="100" height="110" className="overflow-visible">
              <CardInner item={integrations[3]} visible={isInView} delay={850} />
            </foreignObject>

            {/* Email — bottom right */}
            <foreignObject x="760" y="310" width="100" height="110" className="overflow-visible">
              <CardInner item={integrations[4]} visible={isInView} delay={1000} />
            </foreignObject>

            {/* ── Center text ── */}
            <foreignObject x="250" y="230" width="400" height="240">
              <div
                className="flex flex-col items-center justify-center h-full text-center transition-all duration-700 ease-out"
                style={{
                  opacity: isInView ? 1 : 0,
                  transform: isInView ? "scale(1)" : "scale(0.92)",
                  transitionDelay: "800ms",
                }}
              >
                <p className="text-[26px] sm:text-[30px] font-bold text-gray-900 leading-tight mb-0.5">
                  +5 Smooth-running
                </p>
                <p className="text-[26px] sm:text-[30px] font-extrabold text-gray-900 leading-tight mb-3">
                  integrations
                </p>
                <p className="text-[12px] text-gray-400 mb-5 max-w-[190px] mx-auto leading-relaxed">
                  Your favorite tools, finally working together
                </p>
                <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full px-3.5 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                  <span className="text-[11px] font-semibold text-gray-500">Integrations</span>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>

        {/* Bottom pills */}
        <div
          className="flex flex-wrap justify-center gap-3 mt-14 transition-all duration-700 ease-out"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(16px)",
            transitionDelay: "1100ms",
          }}
        >
          {integrations.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2.5 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full px-5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] cursor-default hover:scale-105 hover:-translate-y-0.5 transition-transform duration-200"
            >
              {item.icon}
              <span className="text-sm font-semibold text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CardInner({
  item,
  visible,
  delay,
}: {
  item: { icon: React.ReactNode; label: string };
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className="flex flex-col items-center gap-2 transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="int-card">
        {item.icon}
      </div>
      <span className="text-[11px] font-medium text-gray-400 tracking-wide whitespace-nowrap">
        {item.label}
      </span>
    </div>
  );
}

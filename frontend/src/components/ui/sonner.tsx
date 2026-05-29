"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      position="top-right"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      expand={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-white group-[.toaster]:!border-zinc-200 group-[.toaster]:!shadow-[0_24px_48px_-12px_rgba(0,0,0,0.18)] !rounded-[24px] !p-6 sm:!p-7 relative overflow-hidden min-h-[140px] w-full sm:w-[420px] !flex !flex-col !justify-start !items-start",
          content: "!block !w-full !text-left",
          title: "group-[.toast]:!text-zinc-950 font-bold text-[18px] tracking-tight mb-2 relative z-10",
          description: "group-[.toast]:!text-zinc-500 text-[15px] leading-relaxed max-w-[85%] relative z-10",
          actionButton:
            "group-[.toast]:!bg-zinc-900 group-[.toast]:!text-white group-[.toast]:hover:!bg-zinc-800 group-[.toast]:!rounded-[10px] group-[.toast]:!px-5 group-[.toast]:!py-2 font-medium !mt-5 text-[14px] transition-all relative z-10 shadow-sm !inline-flex !items-center !justify-center !h-auto !min-h-0 !leading-normal !w-fit !self-start !ml-0",
          cancelButton:
            "group-[.toast]:!bg-zinc-100 group-[.toast]:!text-zinc-500 relative z-10",
          closeButton: 
            "group-[.toast]:!bg-transparent group-[.toast]:!border-none group-[.toast]:!text-zinc-700 group-[.toast]:hover:!text-zinc-900 !top-6 !right-6 !left-auto absolute !opacity-100 transition-colors z-20 !scale-125",
          icon: "!absolute -bottom-8 -right-8 !m-0 !p-0 !w-auto !h-auto pointer-events-none z-0",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="w-40 h-40 text-emerald-500/10 rotate-[-15deg]" strokeWidth={1.5} />,
        info: <InfoIcon className="w-40 h-40 text-blue-500/10 rotate-[-15deg]" strokeWidth={1.5} />,
        warning: <TriangleAlertIcon className="w-40 h-40 text-amber-500/10 rotate-[-15deg]" strokeWidth={1.5} />,
        error: <OctagonXIcon className="w-40 h-40 text-red-500/10 rotate-[-15deg]" strokeWidth={1.5} />,
        loading: <Loader2Icon className="w-40 h-40 text-zinc-500/10 animate-spin" strokeWidth={1.5} />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#09090b",
          "--normal-border": "#e4e4e7",
          "--border-radius": "24px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

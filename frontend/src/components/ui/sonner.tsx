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
            "group toast group-[.toaster]:!bg-white group-[.toaster]:!border-zinc-200 group-[.toaster]:!shadow-[0_8px_30px_rgb(0,0,0,0.12)] !rounded-xl !p-4 sm:!p-5 relative overflow-hidden w-full sm:w-[350px] !flex !flex-col !justify-start !items-start",
          content: "!block !w-full !text-left",
          title: "group-[.toast]:!text-zinc-950 font-bold text-[15px] tracking-tight mb-1 relative z-10",
          description: "group-[.toast]:!text-zinc-500 text-[13px] leading-relaxed max-w-[90%] relative z-10",
          actionButton:
            "group-[.toast]:!bg-zinc-900 group-[.toast]:!text-white group-[.toast]:hover:!bg-zinc-800 group-[.toast]:!rounded-lg group-[.toast]:!px-4 group-[.toast]:!py-1.5 font-medium !mt-3 text-[13px] transition-all relative z-10 shadow-sm !inline-flex !items-center !justify-center !h-auto !min-h-0 !leading-normal !w-fit !self-start !ml-0",
          cancelButton:
            "group-[.toast]:!bg-zinc-100 group-[.toast]:!text-zinc-500 relative z-10",
          closeButton: 
            "group-[.toast]:!bg-transparent group-[.toast]:!border-none group-[.toast]:!text-zinc-400 group-[.toast]:hover:!text-zinc-900 !top-4 !right-4 !left-auto absolute !opacity-100 transition-colors z-20 !scale-100",
          icon: "!absolute -bottom-4 -right-4 !m-0 !p-0 !w-auto !h-auto pointer-events-none z-0 opacity-50",
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

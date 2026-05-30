import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Oswald, Lato, Inter } from "next/font/google";
import type { Metadata } from "next";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const lato = Lato({ weight: ["400", "700", "900"], subsets: ["latin"], variable: "--font-lato" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "FollowUpHub — Never Miss a Follow-Up Again",
    template: "%s | FollowUpHub",
  },
  description:
    "FollowUpHub is an intelligent follow-up and task management platform with automated reminders, Jira integration, Slack escalation, and real-time notifications.",
  keywords: [
    "follow-up management",
    "task tracking",
    "Jira integration",
    "automated reminders",
    "productivity",
    "team collaboration",
  ],
  openGraph: {
    title: "FollowUpHub — Never Miss a Follow-Up Again",
    description:
      "Intelligent follow-up management with automated escalation, Jira sync, and real-time notifications.",
    siteName: "FollowUpHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FollowUpHub",
    description:
      "Intelligent follow-up management with automated escalation, Jira sync, and real-time notifications.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`min-h-screen bg-background text-foreground font-sans ${oswald.variable} ${lato.variable} ${inter.variable}`}>
        {children}
        <Toaster closeButton />
      </body>
    </html>
  );
}

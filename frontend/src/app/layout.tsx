import "@/app/globals.css";
import "../bones/registry";
import { Toaster } from "@/components/ui/sonner";
import { Oswald, Inter } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "FollowUpHub",
  description: "MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`min-h-screen bg-background text-foreground font-sans antialiased ${oswald.variable} ${inter.variable}`}>
        {children}
        <Toaster closeButton />
      </body>
    </html>
  );
}

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Oswald, Lato, Inter } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const lato = Lato({ weight: ["400", "700", "900"], subsets: ["latin"], variable: "--font-lato" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "FollowUpHub",
  description: "MVP",
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

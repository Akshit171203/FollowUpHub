import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Oswald, Lato } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const lato = Lato({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-lato" });

export const metadata = {
  title: "FollowUpHub",
  description: "MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background text-foreground ${oswald.variable} ${lato.variable}`}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}

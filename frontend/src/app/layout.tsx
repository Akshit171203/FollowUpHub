import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Oswald, Raleway } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });

export const metadata = {
  title: "FollowUpHub",
  description: "MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-background text-foreground ${oswald.variable} ${raleway.variable}`}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}

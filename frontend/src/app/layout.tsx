import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "FollowUpHub",
  description: "MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}

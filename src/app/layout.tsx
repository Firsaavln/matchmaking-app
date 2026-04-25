import type { Metadata } from "next"; // Tambahin import ini
import "./globals.css";
import { Toaster } from "sonner";

// ================= METADATA (UNTUK TITLE & ICON) =================
export const metadata: Metadata = {
  title: "SIAP Bisnis Forum",
  description: "Platform Business Matching Exclusive untuk Startup dan Investor",
  icons: {
    icon: "icon.svg", // Pastikan lu naruh file logo lu dengan nama icon.png di folder src/app/
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased"> 
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
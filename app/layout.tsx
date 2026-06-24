import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "YouTube Factory AI",
  description: "Autonomous faceless YouTube video production factory — Mammba Enterprises",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-[#f1f1f1] min-h-screen">
        <Sidebar />
        <main className="ml-52 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

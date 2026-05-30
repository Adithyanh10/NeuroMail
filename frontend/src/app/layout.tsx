import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Email Reply Generator",
  description: "Generate professional AI-powered email replies instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" />
        <AuthProvider>{children}</AuthProvider>

        {/* ── Brand logo — top-left box ── */}
        <div className="fixed top-4 left-4 z-50 pointer-events-none select-none">
          <div className="flex items-center gap-2 bg-white border-2 border-blue-600 shadow-md rounded-xl px-3 py-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-blue-700 leading-none tracking-tight">AI Email Reply</span>
          </div>
        </div>
      </body>
    </html>
  );
}

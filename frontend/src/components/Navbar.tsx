"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { LogOut, Mail, ArrowLeft, ChevronRight, Menu } from "lucide-react";
import DrawerNav from "./DrawerNav";

const BACK_PAGES: Record<string, string> = {
  "/analytics":     "/dashboard",
  "/grammar":       "/dashboard",
  "/writing-style": "/dashboard",
  "/streaming":     "/dashboard",
  "/upload":        "/dashboard",
  "/history/list":  "/dashboard",
  "/profile":       "/dashboard",
};

const CRUMB_MAP: Record<string, string> = {
  "/dashboard":     "Dashboard",
  "/analytics":     "Analytics",
  "/grammar":       "Grammar Fix",
  "/writing-style": "Writing Style",
  "/streaming":     "Live Stream",
  "/upload":        "Upload",
  "/history/list":  "History",
  "/profile":       "My Profile",
};

export default function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { logout, username, email } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const backTo   = BACK_PAGES[pathname] ?? (pathname.startsWith("/history/") ? "/history/list" : null);
  const crumb    = pathname.startsWith("/history/") && pathname !== "/history/list"
    ? "Reply Detail"
    : CRUMB_MAP[pathname] ?? "";

  const initials = username
    ? username.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      <DrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* ── Left ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 min-w-0">

            {/* Hamburger — always visible */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col justify-center items-center w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors shrink-0 gap-1.5"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
            >
              <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
              <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
              <span className="w-5 h-0.5 bg-gray-700 rounded-full" />
            </button>

            {/* Back arrow */}
            {backTo && (
              <button
                onClick={() => router.push(backTo)}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                aria-label="Go back"
              >
                <ArrowLeft size={15} className="text-gray-600" />
              </button>
            )}

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail size={15} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 hidden sm:block text-sm">AI Email Reply</span>
            </Link>

            {/* Breadcrumb */}
            {crumb && crumb !== "Dashboard" && (
              <div className="hidden sm:flex items-center gap-1 text-sm min-w-0">
                <ChevronRight size={13} className="text-gray-300 shrink-0" />
                <span className="text-gray-600 font-medium truncate">{crumb}</span>
              </div>
            )}
          </div>

          {/* ── Right ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Avatar → profile */}
            <Link
              href="/profile"
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors group"
              aria-label="My profile"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {username || "User"}
                </p>
                <p className="text-xs text-gray-400 leading-tight truncate max-w-[110px]">
                  {email || ""}
                </p>
              </div>
            </Link>

            <div className="w-px h-5 bg-gray-200" />

            {/* Logout */}
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
              aria-label="Sign out"
            >
              <LogOut size={15} />
              <span className="hidden sm:block text-xs">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

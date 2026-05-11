"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  X, LayoutDashboard, Clock, BarChart2, Zap,
  Wand2, User, Upload, LogOut, Mail, Sparkles,
  ChevronRight, Shield,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "Main",
    items: [
      { href: "/dashboard",     label: "Dashboard",   icon: LayoutDashboard },
      { href: "/history/list",  label: "History",     icon: Clock },
      { href: "/analytics",     label: "Analytics",   icon: BarChart2 },
    ],
  },
  {
    title: "AI Tools",
    items: [
      { href: "/streaming",     label: "Live Stream", icon: Zap },
      { href: "/grammar",       label: "Grammar Fix", icon: Wand2 },
      { href: "/writing-style", label: "My Style",    icon: Sparkles },
    ],
  },
  {
    title: "Account",
    items: [
      { href: "/profile",       label: "My Profile",  icon: User },
      { href: "/upload",        label: "Upload Email",icon: Upload },
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DrawerNav({ open, onClose }: Props) {
  const pathname = usePathname();
  const router   = useRouter();
  const { username, email, logout } = useAuthStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  const initials = username
    ? username.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Email Reply</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* User profile card */}
        <Link
          href="/profile"
          onClick={onClose}
          className="mx-3 mt-3 p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{username || "User"}</p>
            <p className="text-xs text-blue-200 truncate">{email || "View profile"}</p>
          </div>
          <ChevronRight size={14} className="text-blue-200 shrink-0" />
        </Link>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {NAV_SECTIONS.map(({ title, items }) => (
            <div key={title}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                {title}
              </p>
              <ul className="space-y-0.5">
                {items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          active
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        aria-current={active ? "page" : undefined}
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                        {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-gray-100 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
            <Shield size={12} />
            <span>JWT Secured · AI Powered</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}

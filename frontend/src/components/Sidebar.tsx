"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, Upload, BarChart2, Wand2, Sparkles, Zap, User, Brain, GraduationCap, Trophy } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",     label: "Dashboard",    icon: LayoutDashboard },
  { href: "/history/list",  label: "History",      icon: Clock },
  { href: "/analytics",     label: "Analytics",    icon: BarChart2 },
  { href: "/insights",      label: "AI Insights",  icon: Brain },
  { href: "/streaming",     label: "Live Stream",  icon: Zap },
  { href: "/grammar",       label: "Grammar Fix",  icon: Wand2 },
  { href: "/email-coach",   label: "Email Coach",  icon: GraduationCap },
  { href: "/writing-style", label: "My Style",     icon: Sparkles },
  { href: "/achievements",  label: "Achievements", icon: Trophy },
  { href: "/profile",       label: "My Profile",   icon: User },
  { href: "/upload",        label: "Upload",       icon: Upload },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-52 shrink-0 hidden md:block" aria-label="Sidebar navigation">
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2 px-2 py-2 mb-2 border-b border-gray-100">
          <Sparkles size={16} className="text-blue-600" /><span className="text-xs font-bold text-gray-700 uppercase tracking-wide">AI Features</span>
        </div>
        <nav><ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}><Link href={href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`} aria-current={active ? "page" : undefined}>
                <Icon size={15} aria-hidden="true" />{label}
              </Link></li>
            );
          })}
        </ul></nav>
      </div>
    </aside>
  );
}

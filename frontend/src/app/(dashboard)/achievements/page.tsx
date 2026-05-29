"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAnalytics } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { AnalyticsResponse } from "@/types";
import { Trophy, Star, Zap, Shield, Globe, Target, Award, Lock, CheckCircle } from "lucide-react";

interface Badge {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = badge.icon;
  return (
    <div className={`card p-4 flex items-start gap-3 transition-all ${badge.unlocked ? "border-2 border-yellow-300 shadow-md" : "opacity-60"}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${badge.unlocked ? badge.bgColor : "bg-gray-100"}`}>
        {badge.unlocked
          ? <Icon size={22} className={badge.color} />
          : <Lock size={18} className="text-gray-400" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-semibold text-sm ${badge.unlocked ? "text-gray-900" : "text-gray-400"}`}>{badge.title}</p>
          {badge.unlocked && <CheckCircle size={13} className="text-green-500 shrink-0" />}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{badge.description}</p>
        {badge.maxProgress !== undefined && !badge.unlocked && (
          <div className="mt-2 space-y-0.5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{badge.progress}/{badge.maxProgress}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-blue-400 transition-all"
                style={{ width: `${Math.min(100, ((badge.progress ?? 0) / (badge.maxProgress ?? 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate, username } = useAuthStore();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    getAnalytics().then(setData).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const total = data?.total_replies ?? 0;
  const urgent = data?.urgent_count ?? 0;
  const suspicious = data?.suspicious_count ?? 0;
  const meetings = data?.meeting_requests_count ?? 0;
  const languages = data?.languages_detected.length ?? 0;
  const avgConf = data ? Math.round(data.avg_confidence * 100) : 0;

  const badges: Badge[] = [
    {
      id: "first_reply",
      icon: Star,
      title: "First Reply",
      description: "Generated your very first AI reply.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      unlocked: total >= 1,
      progress: total,
      maxProgress: 1,
    },
    {
      id: "reply_5",
      icon: Zap,
      title: "Getting Started",
      description: "Generated 5 AI replies.",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      unlocked: total >= 5,
      progress: total,
      maxProgress: 5,
    },
    {
      id: "reply_25",
      icon: Trophy,
      title: "Power User",
      description: "Generated 25 AI replies.",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      unlocked: total >= 25,
      progress: total,
      maxProgress: 25,
    },
    {
      id: "reply_100",
      icon: Award,
      title: "Email Master",
      description: "Generated 100 AI replies.",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      unlocked: total >= 100,
      progress: total,
      maxProgress: 100,
    },
    {
      id: "urgent_handler",
      icon: Zap,
      title: "Urgent Handler",
      description: "Handled 5 urgent emails.",
      color: "text-red-600",
      bgColor: "bg-red-100",
      unlocked: urgent >= 5,
      progress: urgent,
      maxProgress: 5,
    },
    {
      id: "spam_detector",
      icon: Shield,
      title: "Spam Detector",
      description: "Detected 3 suspicious emails.",
      color: "text-green-600",
      bgColor: "bg-green-100",
      unlocked: suspicious >= 3,
      progress: suspicious,
      maxProgress: 3,
    },
    {
      id: "meeting_pro",
      icon: Target,
      title: "Meeting Pro",
      description: "Handled 5 meeting request emails.",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      unlocked: meetings >= 5,
      progress: meetings,
      maxProgress: 5,
    },
    {
      id: "multilingual",
      icon: Globe,
      title: "Multilingual",
      description: "Handled emails in 3+ languages.",
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      unlocked: languages >= 3,
      progress: languages,
      maxProgress: 3,
    },
    {
      id: "high_confidence",
      icon: Star,
      title: "High Confidence",
      description: "Maintained 80%+ AI confidence average.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      unlocked: avgConf >= 80,
    },
    {
      id: "reply_50",
      icon: Trophy,
      title: "Dedicated User",
      description: "Generated 50 AI replies.",
      color: "text-pink-600",
      bgColor: "bg-pink-100",
      unlocked: total >= 50,
      progress: total,
      maxProgress: 50,
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const level = Math.floor(total / 10) + 1;
  const xp = total * 10 + urgent * 5 + meetings * 8 + languages * 15;
  const nextLevelXp = level * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy size={22} className="text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          </div>
          <p className="text-gray-500">Track your progress and unlock badges as you use the AI.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Player card */}
            <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-black">
                  {level}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">Level {level} — {username || "User"}</p>
                  <p className="text-2xl font-bold">{xp.toLocaleString()} XP</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-white/70">
                      <span>Progress to Level {level + 1}</span>
                      <span>{Math.min(xp, nextLevelXp)}/{nextLevelXp} XP</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-white transition-all duration-700"
                        style={{ width: `${Math.min(100, (xp / nextLevelXp) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{unlockedCount}/{badges.length}</p>
                  <p className="text-xs text-white/70">Badges</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Replies", value: total,     color: "bg-blue-50 text-blue-700" },
                { label: "Urgent Handled", value: urgent,   color: "bg-red-50 text-red-700" },
                { label: "Meetings Found", value: meetings, color: "bg-indigo-50 text-indigo-700" },
                { label: "Languages",      value: languages, color: "bg-teal-50 text-teal-700" },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl p-3 text-center ${color}`}>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs mt-0.5 opacity-80">{label}</p>
                </div>
              ))}
            </div>

            {/* Badges */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Badges ({unlockedCount} unlocked)</h2>
                <span className="text-xs text-gray-400">{badges.length - unlockedCount} locked</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Unlocked first */}
                {[...badges].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

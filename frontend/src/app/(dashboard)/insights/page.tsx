"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAnalytics, getHistory } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { AnalyticsResponse } from "@/types";
import {
  TrendingUp, Zap, Target, Clock, Award, AlertTriangle,
  CheckCircle, BarChart2, Brain, Flame,
} from "lucide-react";

function InsightCard({ title, value, sub, icon: Icon, color, trend }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
          trend === "up" ? "bg-green-100 text-green-700" :
          trend === "down" ? "bg-red-100 text-red-700" :
          "bg-gray-100 text-gray-600"
        }`}>
          {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
        </span>
      )}
    </div>
  );
}

function DonutSegment({ percentage, color, label }: { percentage: number; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-600 flex-1 capitalize">{label}</span>
      <span className="text-xs font-semibold text-gray-800">{percentage}%</span>
    </div>
  );
}

const EMOTION_COLORS: Record<string, string> = {
  angry: "#ef4444", frustrated: "#f97316", urgent: "#f59e0b",
  happy: "#22c55e", neutral: "#6b7280",
};
const INTENT_COLORS = ["#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#22c55e","#ef4444","#6366f1"];

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    getAnalytics().then(setData).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Derived insights
  const topEmotion = data?.emotion_breakdown[0]?.category ?? "—";
  const topIntent  = data?.intent_breakdown[0]?.category?.replace("_", " ") ?? "—";
  const topTone    = data?.tone_breakdown[0]?.category ?? "—";
  const healthScore = data
    ? Math.round(
        (data.avg_confidence * 40) +
        (data.avg_reply_score * 0.4) +
        (data.total_replies > 0 ? 20 : 0) -
        (data.suspicious_count * 5)
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={22} className="text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
          </div>
          <p className="text-gray-500">Deep patterns and intelligence from your email history.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : !data || data.total_replies === 0 ? (
          <div className="card text-center py-20">
            <Brain size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No insights yet</p>
            <p className="text-sm text-gray-400 mt-1">Generate at least 5 replies to unlock AI insights.</p>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <InsightCard title="Email Health Score"  value={`${Math.min(100, healthScore)}%`} sub="based on quality + safety" icon={Award}         color="bg-purple-500" trend="up" />
              <InsightCard title="Replies Generated"   value={data.total_replies}               sub="total all time"           icon={BarChart2}     color="bg-blue-500" />
              <InsightCard title="Avg AI Confidence"   value={`${Math.round(data.avg_confidence * 100)}%`} sub="model certainty" icon={Target}      color="bg-green-500" trend="up" />
              <InsightCard title="Urgent Emails"       value={data.urgent_count}                sub={`${Math.round(data.urgent_count / Math.max(data.total_replies,1) * 100)}% of total`} icon={Zap} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* Emotion Breakdown — visual donut-style */}
              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Flame size={15} className="text-orange-500" /> Emotion Breakdown
                </h2>
                {data.emotion_breakdown.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {data.emotion_breakdown.map((e) => (
                      <div key={e.category} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="capitalize font-medium text-gray-700">{e.category}</span>
                          <span className="text-gray-500">{e.count} ({e.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-700"
                            style={{
                              width: `${e.percentage}%`,
                              backgroundColor: EMOTION_COLORS[e.category] ?? "#6b7280",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Most common: <strong className="capitalize">{topEmotion}</strong></p>
                </div>
              </div>

              {/* Intent Breakdown */}
              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Target size={15} className="text-blue-500" /> Intent Patterns
                </h2>
                {data.intent_breakdown.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet</p>
                ) : (
                  <div className="space-y-2">
                    {data.intent_breakdown.map((item, i) => (
                      <DonutSegment
                        key={item.category}
                        label={item.category.replace("_", " ")}
                        percentage={item.percentage}
                        color={INTENT_COLORS[i % INTENT_COLORS.length]}
                      />
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Top intent: <strong className="capitalize">{topIntent}</strong></p>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp size={15} className="text-green-500" /> Quality Metrics
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Avg Reply Score",  value: data.avg_reply_score,              max: 100 },
                    { label: "AI Confidence",    value: data.avg_confidence * 100,         max: 100 },
                    { label: "Safe Emails",      value: Math.max(0, data.total_replies - data.suspicious_count) / Math.max(data.total_replies, 1) * 100, max: 100 },
                    { label: "Meeting Detected", value: data.meeting_requests_count / Math.max(data.total_replies, 1) * 100, max: 100 },
                  ].map(({ label, value, max }) => {
                    const pct = Math.round(value);
                    const color = pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
                    return (
                      <div key={label} className="space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">{label}</span>
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Safety Overview */}
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-500" /> Safety Overview
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <CheckCircle size={20} className="mx-auto text-green-600 mb-1" />
                    <p className="text-xl font-bold text-green-700">{data.total_replies - data.suspicious_count}</p>
                    <p className="text-xs text-gray-500">Safe Emails</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <AlertTriangle size={20} className="mx-auto text-red-500 mb-1" />
                    <p className="text-xl font-bold text-red-600">{data.suspicious_count}</p>
                    <p className="text-xs text-gray-500">Suspicious</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 text-center">
                    <Zap size={20} className="mx-auto text-orange-500 mb-1" />
                    <p className="text-xl font-bold text-orange-600">{data.urgent_count}</p>
                    <p className="text-xs text-gray-500">Urgent</p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-3 text-center">
                    <Clock size={20} className="mx-auto text-indigo-500 mb-1" />
                    <p className="text-xl font-bold text-indigo-600">{data.meeting_requests_count}</p>
                    <p className="text-xs text-gray-500">Meetings</p>
                  </div>
                </div>
              </div>

              {/* Tone Distribution */}
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart2 size={15} className="text-indigo-500" /> Tone Distribution
                </h2>
                {data.tone_breakdown.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.tone_breakdown.map((t, i) => {
                      const toneColors: Record<string, string> = {
                        professional: "#3b82f6", formal: "#6366f1", friendly: "#ec4899",
                      };
                      const color = toneColors[t.category] ?? INTENT_COLORS[i];
                      return (
                        <div key={t.category} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: color }}>
                            {t.category.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className="capitalize font-medium text-gray-700">{t.category}</span>
                              <span className="text-gray-500">{t.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all duration-700"
                                style={{ width: `${t.percentage}%`, backgroundColor: color }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                  Preferred tone: <strong className="capitalize">{topTone}</strong>
                </p>
              </div>

              {/* Languages */}
              <div className="card space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Brain size={15} className="text-teal-500" /> Languages Detected
                </h2>
                {data.languages_detected.length === 0 ? (
                  <p className="text-xs text-gray-400">No data yet</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.languages_detected.map((lang, i) => (
                      <div key={lang} className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-3 py-2">
                        <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                          {lang.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-teal-800 capitalize">{lang}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-3 mt-2">
                  <p className="text-xs text-gray-500">
                    You have handled emails in <strong>{data.languages_detected.length}</strong> language{data.languages_detected.length !== 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

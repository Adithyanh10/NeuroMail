"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAnalytics } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import type { AnalyticsResponse } from "@/types";
import { BarChart2, AlertTriangle, TrendingUp, Inbox, Shield, Calendar, Globe, Brain } from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className={`p-2.5 rounded-xl ${color}`}><Icon size={20} className="text-white" /></div>
      <div>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

function BarRow({ label, count, percentage, color }: {
  label: string; count: number; percentage: number; color: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-700 capitalize">{label || "Unknown"}</span>
        <span className="text-gray-500">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

const COLORS = ["bg-blue-500","bg-green-500","bg-yellow-500","bg-purple-500","bg-red-500","bg-pink-500","bg-indigo-500","bg-orange-500"];

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    getAnalytics().then(setData).finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Replies"     value={data.total_replies}                              icon={Inbox}         color="bg-blue-500" />
              <StatCard label="Avg Confidence"    value={`${Math.round(data.avg_confidence * 100)}%`}    icon={TrendingUp}    color="bg-green-500" />
              <StatCard label="Avg Reply Score"   value={`${data.avg_reply_score.toFixed(1)}%`} sub="quality" icon={BarChart2} color="bg-purple-500" />
              <StatCard label="Urgent Emails"     value={data.urgent_count}                               icon={AlertTriangle} color="bg-orange-500" />
              <StatCard label="Suspicious"        value={data.suspicious_count} sub="spam/phishing"      icon={Shield}        color="bg-red-500" />
              <StatCard label="Meeting Requests"  value={data.meeting_requests_count}                     icon={Calendar}      color="bg-indigo-500" />
              <StatCard label="Languages"         value={data.languages_detected.length} sub={data.languages_detected.slice(0,3).join(", ")} icon={Globe} color="bg-teal-500" />
              <StatCard label="Intent Types"      value={data.intent_breakdown.length} sub="detected"    icon={Brain}         color="bg-pink-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {[
                { title: "By Category", rows: data.category_breakdown },
                { title: "By Priority", rows: data.priority_breakdown },
                { title: "By Tone",     rows: data.tone_breakdown },
                { title: "By Intent",   rows: data.intent_breakdown },
                { title: "By Emotion",  rows: data.emotion_breakdown },
              ].map(({ title, rows }) => (
                <div key={title} className="card">
                  <h2 className="font-semibold text-gray-900 mb-3 text-sm">{title}</h2>
                  <div className="space-y-2">
                    {rows.length === 0
                      ? <p className="text-xs text-gray-400">No data yet</p>
                      : rows.map((s, i) => (
                          <BarRow key={s.category} label={s.category} count={s.count} percentage={s.percentage} color={COLORS[i % COLORS.length]} />
                        ))}
                  </div>
                </div>
              ))}

              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3 text-sm">Languages Detected</h2>
                {data.languages_detected.length === 0
                  ? <p className="text-xs text-gray-400">No data yet</p>
                  : <div className="flex flex-wrap gap-2">
                      {data.languages_detected.map((l, i) => (
                        <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-full capitalize font-medium">{l}</span>
                      ))}
                    </div>
                }
              </div>
            </div>
          </>
        ) : (
          <div className="card text-center py-16">
            <p className="text-gray-500">No data yet. Generate some replies first.</p>
          </div>
        )}
      </main>
    </div>
  );
}

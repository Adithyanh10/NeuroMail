"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAnalytics, getWritingStyle } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { AnalyticsResponse, WritingStyleProfile } from "@/types";
import {
  User, Mail, Shield, BarChart2, MessageSquare,
  TrendingUp, Star, Brain, Globe, Calendar,
} from "lucide-react";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string;
}) {
  return (
    <div className="flex flex-col items-center p-4 bg-white border border-gray-200 rounded-xl">
      <div className={`p-2 rounded-lg mb-2 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 text-center mt-0.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, hydrate, username, email, userId, logout } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [style, setStyle]         = useState<WritingStyleProfile | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    Promise.all([getAnalytics(), getWritingStyle()])
      .then(([a, s]) => { setAnalytics(a); setStyle(s); })
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handleLogout = () => { logout(); router.push("/login"); };

  const initials = username
    ? username.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const joinDate = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">

            {/* Profile hero card */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-2 border-white/30">
                    {initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white" title="Online" />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold">{username || "User"}</h1>
                  <p className="text-blue-200 text-sm mt-0.5">{email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                      AI Email Pro
                    </span>
                    <span className="text-xs bg-green-400/30 px-2 py-0.5 rounded-full">
                      ● Active
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Account info */}
              <div className="card space-y-1">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <User size={16} className="text-blue-600" /> Account Info
                </h2>
                <InfoRow label="Full Name"   value={username || "—"} />
                <InfoRow label="Email"       value={email    || "—"} />
                <InfoRow label="User ID"     value={userId ? userId.slice(0, 8) + "..." : "—"} />
                <InfoRow label="Member Since" value={joinDate} />
                <InfoRow label="Plan"        value="Free Tier" />
                <InfoRow label="Status"      value="✅ Active" />
              </div>

              {/* Activity stats */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <BarChart2 size={16} className="text-green-600" /> Activity Stats
                </h2>
                {loading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : analytics ? (
                  <div className="grid grid-cols-2 gap-3">
                    <StatBadge icon={MessageSquare} label="Total Replies"    value={analytics.total_replies}          color="bg-blue-500" />
                    <StatBadge icon={TrendingUp}    label="Avg Confidence"   value={`${Math.round(analytics.avg_confidence * 100)}%`} color="bg-green-500" />
                    <StatBadge icon={Star}          label="Avg Reply Score"  value={`${analytics.avg_reply_score.toFixed(0)}%`}        color="bg-yellow-500" />
                    <StatBadge icon={Brain}         label="Intent Types"     value={analytics.intent_breakdown.length}  color="bg-purple-500" />
                    <StatBadge icon={Calendar}      label="Meetings Found"   value={analytics.meeting_requests_count}   color="bg-indigo-500" />
                    <StatBadge icon={Globe}         label="Languages"        value={analytics.languages_detected.length} color="bg-teal-500" />
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
                )}
              </div>

              {/* Writing style */}
              <div className="card space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Mail size={16} className="text-indigo-600" /> Writing Style
                </h2>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                  </div>
                ) : style ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {style.preferred_tone[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 capitalize">{style.preferred_tone}</p>
                        <p className="text-xs text-gray-500">Preferred tone</p>
                      </div>
                    </div>
                    <InfoRow label="Avg Reply Length"    value={`${style.avg_reply_length} words`} />
                    <InfoRow label="Formality Level"     value={`${Math.round(style.formality_level * 100)}%`} />
                    <InfoRow label="Replies Analyzed"    value={style.total_replies_analyzed} />
                    {style.common_phrases.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Common phrases</p>
                        <div className="flex flex-wrap gap-1">
                          {style.common_phrases.map((p, i) => (
                            <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                              &ldquo;{p}&rdquo;
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">Generate replies to build your profile</p>
                )}
              </div>
            </div>

            {/* Security section */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Shield size={16} className="text-green-600" /> Security
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "JWT Authentication",  status: "Active",   color: "text-green-600 bg-green-50" },
                  { label: "Password Encryption", status: "bcrypt",   color: "text-blue-600 bg-blue-50"   },
                  { label: "Session Expiry",       status: "24 hours", color: "text-purple-600 bg-purple-50" },
                ].map(({ label, status, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                    <Shield size={16} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
      </main>
    </div>
  );
}

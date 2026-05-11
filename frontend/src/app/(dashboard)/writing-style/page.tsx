"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWritingStyle } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import type { WritingStyleProfile } from "@/types";
import { User, MessageSquare, TrendingUp, BookOpen } from "lucide-react";

function ProfileBar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500">{pct}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function WritingStylePage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [profile, setProfile] = useState<WritingStyleProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    getWritingStyle().then(setProfile).finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const toneColors: Record<string, string> = {
    professional: "bg-blue-100 text-blue-700",
    formal: "bg-indigo-100 text-indigo-700",
    friendly: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User size={22} className="text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900">Writing Style Profile</h1>
              </div>
              <p className="text-gray-500">
                AI-learned profile based on your reply history. Used to personalize future replies.
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : profile ? (
              <>
                {profile.total_replies_analyzed === 0 ? (
                  <div className="card text-center py-16">
                    <User size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No profile yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Generate at least 5 replies to build your personalized writing style profile.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Overview card */}
                    <div className="card space-y-4">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600" /> Profile Overview
                      </h2>
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {profile.preferred_tone[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 capitalize">{profile.preferred_tone} Writer</p>
                          <p className="text-sm text-gray-500">{profile.total_replies_analyzed} replies analyzed</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block capitalize ${toneColors[profile.preferred_tone] ?? "bg-gray-100 text-gray-600"}`}>
                            {profile.preferred_tone}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <ProfileBar label="Formality Level" value={profile.formality_level} />
                        <ProfileBar label="Avg Reply Length" value={Math.min(profile.avg_reply_length, 200)} max={200} />
                      </div>
                    </div>

                    {/* Stats card */}
                    <div className="card space-y-4">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={16} className="text-green-600" /> Communication Stats
                      </h2>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-blue-700">{profile.total_replies_analyzed}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Replies Analyzed</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-green-700">{profile.avg_reply_length}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Avg Words/Reply</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-purple-700">
                            {Math.round(profile.formality_level * 100)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Formality Score</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-orange-700 capitalize">
                            {profile.preferred_tone.slice(0, 4)}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">Preferred Tone</p>
                        </div>
                      </div>
                    </div>

                    {/* Common phrases */}
                    <div className="card space-y-3">
                      <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                        <BookOpen size={16} className="text-indigo-600" /> Common Phrases You Use
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {profile.common_phrases.map((phrase, i) => (
                          <span
                            key={i}
                            className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium"
                          >
                            &ldquo;{phrase}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="card space-y-3">
                      <h2 className="font-semibold text-gray-900">AI Recommendations</h2>
                      <ul className="space-y-2">
                        {profile.formality_level < 0.6 && (
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-yellow-500 mt-0.5">⚡</span>
                            Consider using more formal language for business communications.
                          </li>
                        )}
                        {profile.avg_reply_length < 30 && (
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-blue-500 mt-0.5">📝</span>
                            Your replies tend to be short. Adding more context improves clarity.
                          </li>
                        )}
                        {profile.avg_reply_length > 150 && (
                          <li className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-500 mt-0.5">✂️</span>
                            Consider more concise replies — aim for 50–100 words for most emails.
                          </li>
                        )}
                        <li className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          Your preferred tone is <strong className="capitalize">{profile.preferred_tone}</strong> — consistent and professional.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-500">Could not load profile. Please try again.</p>
              </div>
            )}
          </div>
      </main>
    </div>
  );
}

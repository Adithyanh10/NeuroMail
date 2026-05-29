"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { Trophy, Star, Award, Target, Zap, TrendingUp } from "lucide-react";

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const achievements = [
    { icon: Star, title: "First Reply", desc: "Generated your first AI reply", unlocked: true, color: "bg-yellow-500" },
    { icon: Zap, title: "Speed Demon", desc: "Generated 10 replies in one day", unlocked: false, color: "bg-blue-500" },
    { icon: Trophy, title: "Reply Master", desc: "Generated 100 total replies", unlocked: false, color: "bg-purple-500" },
    { icon: Award, title: "Perfect Score", desc: "Received 5 Grade A replies in a row", unlocked: false, color: "bg-green-500" },
    { icon: Target, title: "Multi-Tasker", desc: "Used all 20 AI features", unlocked: false, color: "bg-red-500" },
    { icon: TrendingUp, title: "Consistency King", desc: "Generated replies 7 days in a row", unlocked: false, color: "bg-indigo-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy size={28} className="text-yellow-500" />
            Achievements
          </h1>
          <p className="text-gray-500 mt-1">Track your progress and unlock badges</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, i) => (
            <div
              key={i}
              className={`card p-5 transition-all ${
                achievement.unlocked
                  ? "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white"
                  : "opacity-60 grayscale"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${achievement.color} ${achievement.unlocked ? "" : "opacity-50"}`}>
                  <achievement.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{achievement.desc}</p>
                  {achievement.unlocked && (
                    <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      ✓ Unlocked
                    </span>
                  )}
                  {!achievement.unlocked && (
                    <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      🔒 Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-8 text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <Trophy size={48} className="mx-auto text-blue-600 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            This feature is under development. Track your achievements, earn badges, and compete on leaderboards.
          </p>
        </div>
      </main>
    </div>
  );
}

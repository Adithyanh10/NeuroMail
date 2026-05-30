"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { Trophy, Star, Award, Target, Zap, TrendingUp, Crown, Flame, Heart, Sparkles } from "lucide-react";

export default function AchievementsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [selectedAchievement, setSelectedAchievement] = useState<number | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  const achievements = [
    { 
      IconComponent: Star, 
      title: "First Reply", 
      desc: "Generated your first AI reply", 
      unlocked: true, 
      color: "bg-yellow-500",
      date: "Just now",
      rarity: "Common",
      points: 10
    },
    { 
      IconComponent: Zap, 
      title: "Speed Demon", 
      desc: "Generated 10 replies in one day", 
      unlocked: false, 
      color: "bg-blue-500",
      progress: 0,
      total: 10,
      rarity: "Rare",
      points: 25
    },
    { 
      IconComponent: Trophy, 
      title: "Reply Master", 
      desc: "Generated 100 total replies", 
      unlocked: false, 
      color: "bg-purple-500",
      progress: 0,
      total: 100,
      rarity: "Epic",
      points: 50
    },
    { 
      IconComponent: Award, 
      title: "Perfect Score", 
      desc: "Received 5 Grade A replies in a row", 
      unlocked: false, 
      color: "bg-green-500",
      progress: 0,
      total: 5,
      rarity: "Rare",
      points: 30
    },
    { 
      IconComponent: Target, 
      title: "Multi-Tasker", 
      desc: "Used all 20 AI features", 
      unlocked: false, 
      color: "bg-red-500",
      progress: 1,
      total: 20,
      rarity: "Epic",
      points: 40
    },
    { 
      IconComponent: TrendingUp, 
      title: "Consistency King", 
      desc: "Generated replies 7 days in a row", 
      unlocked: false, 
      color: "bg-indigo-500",
      progress: 1,
      total: 7,
      rarity: "Rare",
      points: 35
    },
    { 
      IconComponent: Crown, 
      title: "Email Royalty", 
      desc: "Reached 1000 total replies", 
      unlocked: false, 
      color: "bg-amber-500",
      progress: 0,
      total: 1000,
      rarity: "Legendary",
      points: 100
    },
    { 
      IconComponent: Flame, 
      title: "On Fire", 
      desc: "30-day reply streak", 
      unlocked: false, 
      color: "bg-orange-500",
      progress: 1,
      total: 30,
      rarity: "Epic",
      points: 60
    },
    { 
      IconComponent: Heart, 
      title: "Crowd Favorite", 
      desc: "Received 50 positive feedbacks", 
      unlocked: false, 
      color: "bg-pink-500",
      progress: 0,
      total: 50,
      rarity: "Rare",
      points: 45
    },
  ];

  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unlocked</p>
                <p className="text-3xl font-bold text-gray-900">{unlockedCount}/{achievements.length}</p>
              </div>
              <Trophy size={40} className="text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Points</p>
                <p className="text-3xl font-bold text-gray-900">{totalPoints}</p>
              </div>
              <Star size={40} className="text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completion</p>
                <p className="text-3xl font-bold text-gray-900">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
              </div>
              <Sparkles size={40} className="text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {achievements.map((achievement, i) => {
            const AchievementIcon = achievement.IconComponent;
            return (
            <div
              key={i}
              onClick={() => setSelectedAchievement(i)}
              className={`card p-5 transition-all cursor-pointer hover:shadow-lg ${
                achievement.unlocked
                  ? "border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white"
                  : "opacity-70 hover:opacity-90"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${achievement.color} ${achievement.unlocked ? "" : "opacity-50 grayscale"}`}>
                  <AchievementIcon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      achievement.rarity === "Legendary" ? "bg-amber-100 text-amber-700" :
                      achievement.rarity === "Epic" ? "bg-purple-100 text-purple-700" :
                      achievement.rarity === "Rare" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{achievement.desc}</p>
                  
                  {achievement.unlocked ? (
                    <div className="flex items-center justify-between">
                      <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                        ✓ Unlocked
                      </span>
                      <span className="text-xs text-gray-500">{achievement.points} pts</span>
                    </div>
                  ) : (
                    <>
                      {achievement.progress !== undefined && (
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.total}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${achievement.color} h-2 rounded-full transition-all`}
                              style={{ width: `${(achievement.progress! / achievement.total!) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          🔒 Locked
                        </span>
                        <span className="text-xs text-gray-400">{achievement.points} pts</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Achievement Detail Modal */}
        {selectedAchievement !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-md w-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-4 ${achievements[selectedAchievement].color} rounded-xl ${
                    achievements[selectedAchievement].unlocked ? "" : "opacity-50 grayscale"
                  }`}>
                    {(() => {
                      const ModalIcon = achievements[selectedAchievement].IconComponent;
                      return <ModalIcon size={32} className="text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{achievements[selectedAchievement].title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      achievements[selectedAchievement].rarity === "Legendary" ? "bg-amber-100 text-amber-700" :
                      achievements[selectedAchievement].rarity === "Epic" ? "bg-purple-100 text-purple-700" :
                      achievements[selectedAchievement].rarity === "Rare" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {achievements[selectedAchievement].rarity}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAchievement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-600 mb-4">{achievements[selectedAchievement].desc}</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Reward</span>
                  <span className="text-lg font-bold text-blue-600">{achievements[selectedAchievement].points} points</span>
                </div>
                {achievements[selectedAchievement].unlocked && achievements[selectedAchievement].date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Unlocked</span>
                    <span className="text-sm text-gray-900">{achievements[selectedAchievement].date}</span>
                  </div>
                )}
              </div>

              {!achievements[selectedAchievement].unlocked && achievements[selectedAchievement].progress !== undefined && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Your Progress</span>
                    <span>{achievements[selectedAchievement].progress}/{achievements[selectedAchievement].total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${achievements[selectedAchievement].color} h-3 rounded-full transition-all`}
                      style={{ width: `${(achievements[selectedAchievement].progress! / achievements[selectedAchievement].total!) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {achievements[selectedAchievement].total! - achievements[selectedAchievement].progress!} more to unlock!
                  </p>
                </div>
              )}

              <button 
                onClick={() => setSelectedAchievement(null)}
                className="btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Coming Soon Banner */}
        <div className="card text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <Trophy size={48} className="mx-auto text-blue-600 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Full Gamification Coming Soon!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            Track achievements, earn badges, compete on leaderboards, and unlock rewards as you use the platform.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
            <span>🏆 50+ Achievements</span>
            <span>📊 Leaderboards</span>
            <span>🎁 Rewards</span>
            <span>🔔 Real-time Notifications</span>
          </div>
        </div>
      </main>
    </div>
  );
}

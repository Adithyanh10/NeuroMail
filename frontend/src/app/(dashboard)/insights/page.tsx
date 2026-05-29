"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle, Brain, Target } from "lucide-react";

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const insights = [
    {
      icon: TrendingUp,
      type: "success",
      title: "Your reply quality is improving!",
      desc: "Average grade increased from B to A over the last 7 days",
      color: "bg-green-50 border-green-200 text-green-700",
    },
    {
      icon: AlertCircle,
      type: "warning",
      title: "High urgent email volume",
      desc: "You received 12 urgent emails this week — 40% more than usual",
      color: "bg-orange-50 border-orange-200 text-orange-700",
    },
    {
      icon: CheckCircle,
      type: "tip",
      title: "Professional tone works best for you",
      desc: "85% of your highest-rated replies used professional tone",
      color: "bg-blue-50 border-blue-200 text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb size={28} className="text-yellow-500" />
            AI Insights
          </h1>
          <p className="text-gray-500 mt-1">Personalized recommendations based on your email patterns</p>
        </div>

        <div className="space-y-4">
          {insights.map((insight, i) => (
            <div key={i} className={`card border-2 ${insight.color}`}>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg">
                  <insight.icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{insight.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-purple-600" />
              <h2 className="font-semibold text-gray-900">Smart Recommendations</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Use more empathetic language when responding to complaints</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Your replies are 20% shorter than average — consider adding more detail</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Meeting requests are best handled with formal tone</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">This Week&apos;s Goals</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>Maintain Grade A average for 5 consecutive replies</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>Respond to all urgent emails within 2 hours</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">→</span>
                <span>Try using the grammar correction feature 3 times</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="card mt-8 text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50">
          <Lightbulb size={48} className="mx-auto text-purple-600 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Advanced AI-powered insights with predictive analytics, trend detection, and personalized coaching recommendations.
          </p>
        </div>
      </main>
    </div>
  );
}

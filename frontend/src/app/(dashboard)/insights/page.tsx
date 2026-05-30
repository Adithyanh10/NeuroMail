"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { 
  Lightbulb, TrendingUp, AlertCircle, CheckCircle, Brain, Target,
  BarChart3, Clock, Mail, Zap, Award, Calendar
} from "lucide-react";

export default function InsightsPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  const insights = [
    {
      IconComponent: TrendingUp,
      type: "success",
      title: "Your reply quality is improving!",
      desc: "Average grade increased from B to A over the last 7 days",
      color: "bg-green-50 border-green-200 text-green-700",
      details: "You've maintained an A grade for 5 consecutive replies. Keep up the excellent work!",
      action: "View Analytics"
    },
    {
      IconComponent: AlertCircle,
      type: "warning",
      title: "High urgent email volume",
      desc: "You received 12 urgent emails this week — 40% more than usual",
      color: "bg-orange-50 border-orange-200 text-orange-700",
      details: "Consider setting up auto-responses for urgent emails to maintain quick response times.",
      action: "Set Up Auto-Response"
    },
    {
      IconComponent: CheckCircle,
      type: "tip",
      title: "Professional tone works best for you",
      desc: "85% of your highest-rated replies used professional tone",
      color: "bg-blue-50 border-blue-200 text-blue-700",
      details: "Your professional tone consistently receives positive feedback. Consider using it as your default.",
      action: "Set as Default"
    },
    {
      IconComponent: Clock,
      type: "info",
      title: "Peak email time detected",
      desc: "You receive most emails between 9-11 AM",
      color: "bg-purple-50 border-purple-200 text-purple-700",
      details: "Schedule your most focused work during this time to handle high-priority emails efficiently.",
      action: "View Schedule"
    },
  ];

  const predictions = [
    { IconComponent: Mail, title: "Email Volume Forecast", value: "+15%", desc: "Expected increase next week", trend: "up" },
    { IconComponent: Zap, title: "Response Time", value: "< 2 hrs", desc: "Average for urgent emails", trend: "stable" },
    { IconComponent: Award, title: "Quality Trend", value: "A Grade", desc: "Projected for next 10 replies", trend: "up" },
  ];

  const recommendations = [
    "Use more empathetic language when responding to complaints",
    "Your replies are 20% shorter than average — consider adding more detail",
    "Meeting requests are best handled with formal tone",
    "Try the grammar correction feature for complex emails",
  ];

  const goals = [
    { text: "Maintain Grade A average for 5 consecutive replies", progress: 60, total: 5, current: 3 },
    { text: "Respond to all urgent emails within 2 hours", progress: 80, total: 10, current: 8 },
    { text: "Try using the grammar correction feature 3 times", progress: 33, total: 3, current: 1 },
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

        {/* Predictions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {predictions.map((pred, i) => {
            const PredIcon = pred.IconComponent;
            return (
            <div key={i} className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <PredIcon size={20} className="text-blue-600" />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  pred.trend === "up" ? "bg-green-100 text-green-700" :
                  pred.trend === "down" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {pred.trend === "up" ? "↑" : pred.trend === "down" ? "↓" : "→"} {pred.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{pred.value}</p>
              <p className="text-sm text-gray-600">{pred.title}</p>
              <p className="text-xs text-gray-500 mt-1">{pred.desc}</p>
            </div>
          )})}
        </div>

        {/* Insights Cards */}
        <div className="space-y-4 mb-8">
          {insights.map((insight, i) => {
            const InsightIcon = insight.IconComponent;
            return (
            <div 
              key={i} 
              className={`card border-2 ${insight.color} cursor-pointer hover:shadow-md transition-all`}
              onClick={() => setSelectedInsight(i)}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg">
                  <InsightIcon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{insight.desc}</p>
                  <button className="text-sm font-medium mt-2 hover:underline">
                    Learn more →
                  </button>
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Insight Detail Modal */}
        {selectedInsight !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-lg w-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {(() => {
                      const ModalIcon = insights[selectedInsight].IconComponent;
                      return <ModalIcon size={24} className="text-blue-600" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{insights[selectedInsight].title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      insights[selectedInsight].type === "success" ? "bg-green-100 text-green-700" :
                      insights[selectedInsight].type === "warning" ? "bg-orange-100 text-orange-700" :
                      insights[selectedInsight].type === "tip" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {insights[selectedInsight].type.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-600 mb-4">{insights[selectedInsight].desc}</p>
              <p className="text-sm text-gray-700 mb-6">{insights[selectedInsight].details}</p>

              <div className="flex gap-3">
                <button className="btn-primary flex-1">
                  {insights[selectedInsight].action}
                </button>
                <button 
                  onClick={() => setSelectedInsight(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Smart Recommendations */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-purple-600" />
              <h2 className="font-semibold text-gray-900">Smart Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* This Week's Goals */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-blue-600" />
              <h2 className="font-semibold text-gray-900">This Week&apos;s Goals</h2>
            </div>
            <ul className="space-y-4">
              {goals.map((goal, i) => (
                <li key={i} className="space-y-2">
                  <div className="flex items-start justify-between text-sm text-gray-700">
                    <span className="flex-1">{goal.text}</span>
                    <span className="text-xs text-gray-500 ml-2">{goal.current}/{goal.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900">7-Day Trend Analysis</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs text-gray-500 mt-1">Total Replies</p>
              <p className="text-xs text-green-600 mt-1">+12% vs last week</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-xs text-gray-500 mt-1">Avg Confidence</p>
              <p className="text-xs text-green-600 mt-1">+3% vs last week</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">A</p>
              <p className="text-xs text-gray-500 mt-1">Avg Grade</p>
              <p className="text-xs text-green-600 mt-1">Improved from B</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">1.8h</p>
              <p className="text-xs text-gray-500 mt-1">Avg Response Time</p>
              <p className="text-xs text-green-600 mt-1">-15min vs last week</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <div className="card text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50">
          <Lightbulb size={48} className="mx-auto text-purple-600 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Advanced AI Insights Coming Soon!</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-4">
            Predictive analytics, anomaly detection, trend forecasting, and personalized coaching recommendations powered by advanced AI.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 flex-wrap">
            <span>📊 Predictive Analytics</span>
            <span>🔍 Anomaly Detection</span>
            <span>📈 Trend Forecasting</span>
            <span>🎯 Custom Reports</span>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { GraduationCap, BookOpen, Target, Lightbulb, TrendingUp, CheckCircle } from "lucide-react";

export default function EmailCoachPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const lessons = [
    { icon: BookOpen, title: "Email Etiquette 101", desc: "Learn professional email writing basics", progress: 0 },
    { icon: Target, title: "Tone Mastery", desc: "Master formal, professional, and friendly tones", progress: 0 },
    { icon: Lightbulb, title: "Intent Recognition", desc: "Identify customer intent from email content", progress: 0 },
    { icon: TrendingUp, title: "Advanced Techniques", desc: "Persuasive writing and empathy", progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap size={28} className="text-blue-600" />
            Email Coach
          </h1>
          <p className="text-gray-500 mt-1">Interactive lessons to improve your email writing skills</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lessons.map((lesson, i) => (
            <div key={i} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <lesson.icon size={24} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{lesson.desc}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{lesson.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Start Lesson →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card mt-8 text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
          <GraduationCap size={56} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon!</h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            Interactive email writing lessons with AI-powered feedback, quizzes, and personalized coaching to help you become an email expert.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Video Tutorials</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Practice Exercises</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>AI Feedback</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

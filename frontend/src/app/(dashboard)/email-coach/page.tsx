"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { 
  GraduationCap, BookOpen, Target, Lightbulb, TrendingUp, 
  CheckCircle, Lock, Play, Award, Clock 
} from "lucide-react";

export default function EmailCoachPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  const lessons = [
    { 
      IconComponent: BookOpen, 
      title: "Email Etiquette 101", 
      desc: "Learn professional email writing basics",
      duration: "15 min",
      progress: 0,
      unlocked: true,
      topics: ["Greetings & Closings", "Subject Lines", "Professional Tone", "Email Structure"]
    },
    { 
      IconComponent: Target, 
      title: "Tone Mastery", 
      desc: "Master formal, professional, and friendly tones",
      duration: "20 min",
      progress: 0,
      unlocked: true,
      topics: ["Formal vs Casual", "Empathy in Writing", "Assertive Communication", "Tone Adaptation"]
    },
    { 
      IconComponent: Lightbulb, 
      title: "Intent Recognition", 
      desc: "Identify customer intent from email content",
      duration: "18 min",
      progress: 0,
      unlocked: false,
      topics: ["Question Detection", "Complaint Handling", "Request Processing", "Feedback Analysis"]
    },
    { 
      IconComponent: TrendingUp, 
      title: "Advanced Techniques", 
      desc: "Persuasive writing and empathy",
      duration: "25 min",
      progress: 0,
      unlocked: false,
      topics: ["Persuasive Language", "Emotional Intelligence", "Conflict Resolution", "Upselling Tactics"]
    },
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

        {/* Progress Overview */}
        <div className="card mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Your Learning Progress</h3>
              <p className="text-sm text-gray-600">Complete lessons to unlock advanced content</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">0%</p>
              <p className="text-xs text-gray-500">0 of 4 lessons</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: "0%" }} />
            </div>
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {lessons.map((lesson, i) => {
            const LessonIcon = lesson.IconComponent;
            return (
            <div 
              key={i} 
              className={`card hover:shadow-md transition-all ${
                !lesson.unlocked ? "opacity-60" : "cursor-pointer"
              }`}
              onClick={() => lesson.unlocked && setSelectedLesson(i)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${
                  lesson.unlocked ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  <LessonIcon size={24} className={
                    lesson.unlocked ? "text-blue-600" : "text-gray-400"
                  } />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    {!lesson.unlocked && <Lock size={16} className="text-gray-400 mt-1" />}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{lesson.desc}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {lesson.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {lesson.topics.length} topics
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{lesson.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          lesson.unlocked ? "bg-blue-600" : "bg-gray-300"
                        }`}
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>

                  {lesson.unlocked ? (
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                      <Play size={14} />
                      Start Lesson
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Lock size={12} />
                      Complete previous lessons to unlock
                    </p>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Lesson Detail Modal */}
        {selectedLesson !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    {(() => {
                      const ModalIcon = lessons[selectedLesson].IconComponent;
                      return <ModalIcon size={24} className="text-blue-600" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{lessons[selectedLesson].title}</h2>
                    <p className="text-sm text-gray-500">{lessons[selectedLesson].duration} • {lessons[selectedLesson].topics.length} topics</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLesson(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-600 mb-6">{lessons[selectedLesson].desc}</p>

              <h3 className="font-semibold text-gray-900 mb-3">Topics Covered:</h3>
              <div className="space-y-2 mb-6">
                {lessons[selectedLesson].topics.map((topic, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-green-500" />
                    {topic}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 font-medium mb-2">🎓 What You'll Learn:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Write professional emails with confidence</li>
                  <li>• Understand tone and formality levels</li>
                  <li>• Apply best practices in real scenarios</li>
                  <li>• Get AI-powered feedback on your writing</li>
                </ul>
              </div>

              <button className="btn-primary w-full flex items-center justify-center gap-2">
                <Play size={18} />
                Start Learning
              </button>
            </div>
          </div>
        )}

        {/* Coming Soon Banner */}
        <div className="card text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
          <GraduationCap size={56} className="mx-auto text-blue-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Interactive Lessons Coming Soon!</h2>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            Full interactive lessons with AI-powered feedback, quizzes, video tutorials, and personalized coaching are currently in development.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 flex-wrap">
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
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span>Certification</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

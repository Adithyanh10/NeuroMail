"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { generateReply } from "@/lib/api";
import { Calendar, Clock, Users, Loader2, CheckCircle, MapPin } from "lucide-react";
import toast from "react-hot-toast";

const EXAMPLES = [
  "Hi, can we schedule a meeting on Monday at 3 PM to discuss the Q4 roadmap? Please invite Sarah and John from the product team.",
  "Let's hop on a Zoom call tomorrow at 10 AM IST to review the project status. I'll send the invite shortly.",
  "I wanted to follow up on the budget report. Please send it by end of day.",
];

export default function MeetingDetectorPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    is_meeting_request: boolean;
    meeting_dates: string[];
    meeting_times: string[];
    meeting_participants: string[];
    intent: string;
    extracted_tasks: Array<{ task: string; priority: string; assignee: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  const analyze = async () => {
    if (!text.trim()) { toast.error("Please enter email content to analyze"); return; }
    setLoading(true);
    try {
      const res = await generateReply({ email_content: text, tone: "professional" });
      setResult({
        is_meeting_request: res.is_meeting_request,
        meeting_dates: res.meeting_dates,
        meeting_times: res.meeting_times,
        meeting_participants: res.meeting_participants,
        intent: res.intent,
        extracted_tasks: res.extracted_tasks,
      });
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={22} className="text-teal-600" />
            <h1 className="text-3xl font-bold text-gray-900">Meeting Request Detector</h1>
          </div>
          <p className="text-gray-500">Automatically extract meeting details, dates, times, and participants from emails.</p>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setText(ex)}
              className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full hover:bg-teal-100 transition-colors">
              Example {i + 1}: {ex.slice(0, 40)}...
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Email Content</h2>
            <textarea
              rows={10}
              placeholder="Paste the email to extract meeting details from..."
              className="input-field resize-none w-full text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={analyze} disabled={loading || !text.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Extracting...</> : <><Calendar size={16} /> Extract Meeting Details</>}
            </button>
          </div>

          {/* Result */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Extracted Details</h2>
            {result ? (
              <div className="space-y-4">
                {/* Meeting Status */}
                <div className={`border-2 rounded-xl p-4 ${result.is_meeting_request ? "border-teal-200 bg-teal-50 text-teal-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                  <div className="flex items-center gap-2">
                    {result.is_meeting_request ? <CheckCircle size={20} /> : <Calendar size={20} />}
                    <p className="font-semibold">
                      {result.is_meeting_request ? "✅ Meeting Request Detected" : "ℹ️ No Meeting Request Found"}
                    </p>
                  </div>
                  <p className="text-sm mt-1 capitalize">Intent: <strong>{result.intent}</strong></p>
                </div>

                {/* Dates */}
                {result.meeting_dates.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={16} className="text-blue-600" />
                      <p className="text-sm font-semibold text-blue-800">Dates</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.meeting_dates.map((d, i) => (
                        <span key={i} className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200">{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Times */}
                {result.meeting_times.length > 0 && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-purple-600" />
                      <p className="text-sm font-semibold text-purple-800">Times</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.meeting_times.map((t, i) => (
                        <span key={i} className="text-xs bg-white text-purple-700 px-2 py-1 rounded border border-purple-200">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Participants */}
                {result.meeting_participants.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-green-600" />
                      <p className="text-sm font-semibold text-green-800">Participants</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.meeting_participants.map((p, i) => (
                        <span key={i} className="text-xs bg-white text-green-700 px-2 py-1 rounded border border-green-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                {result.extracted_tasks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Action Items:</p>
                    <ul className="space-y-1.5">
                      {result.extracted_tasks.map((task, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                          <CheckCircle size={14} className="text-teal-500 shrink-0" />
                          <span className="flex-1">{task.task}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority === "High" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{task.priority}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.is_meeting_request && result.meeting_dates.length === 0 && result.meeting_times.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Meeting request detected but specific dates/times not mentioned.</p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300">
                <div className="text-center">
                  <Calendar size={40} className="mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Meeting details will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Calendar, title: "Date Extraction", desc: "Automatically identifies meeting dates including relative references like 'tomorrow' or 'next Monday'.", color: "text-blue-600 bg-blue-50" },
            { icon: Clock, title: "Time Detection", desc: "Extracts specific times, time zones, and duration from natural language email text.", color: "text-purple-600 bg-purple-50" },
            { icon: MapPin, title: "Location & Platform", desc: "Identifies meeting platforms (Zoom, Teams, Google Meet) and physical locations.", color: "text-teal-600 bg-teal-50" },
          ].map((item, i) => (
            <div key={i} className="card">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h3>
              <p className="text-xs text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

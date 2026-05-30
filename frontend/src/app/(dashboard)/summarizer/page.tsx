"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { summarizeEmail } from "@/lib/api";
import { Brain, Loader2, Copy, CheckCircle, List, Clock, Target } from "lucide-react";
import toast from "react-hot-toast";

const EXAMPLES = [
  `Dear Team, I hope this email finds you well. I wanted to provide a comprehensive update on the Q4 project status. We have successfully completed Phase 1 of the development cycle, which included the backend API integration, database schema migration, and initial UI components. The team has been working diligently to meet our deadlines. However, we have encountered some challenges with the third-party payment gateway integration that may push our timeline by approximately 3-5 business days. I would like to schedule a meeting with all stakeholders on Thursday at 2 PM to discuss mitigation strategies. Please review the attached project report and come prepared with your feedback. Action items: 1) Review the technical documentation by Wednesday, 2) Provide feedback on the UI mockups, 3) Confirm attendance for Thursday's meeting. Best regards, Project Manager`,
  `Hi Sarah, Quick update on the client presentation scheduled for next week. The marketing team has finalized the slide deck and it looks great. We need you to review the financial projections on slides 12-15 and confirm the numbers are accurate. Also, the client has requested we add a section on our data security practices. Can you coordinate with the IT team to get that information? The presentation is on Tuesday at 10 AM at their office. Please confirm you'll be there. Thanks!`,
];

export default function SummarizerPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    summary?: string;
    key_points?: string[];
    action_items?: string[];
    sentiment?: string;
    word_count?: number;
    email_summary?: string;
    key_points_arr?: string[];
    action_items_summary?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) return null;

  const analyze = async () => {
    if (!text.trim()) { toast.error("Please enter email content to summarize"); return; }
    setLoading(true);
    try {
      const res = await summarizeEmail(text) as Record<string, unknown>;
      setResult(res as typeof result);
      toast.success("Email summarized successfully!");
    } catch {
      toast.error("Summarization failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const summary = result?.summary || result?.email_summary || "";
  const keyPoints = result?.key_points || result?.key_points_arr || [];
  const actionItems = result?.action_items || result?.action_items_summary || [];

  const copyToClipboard = () => {
    const content = `Summary:\n${summary}\n\nKey Points:\n${(keyPoints as string[]).map((p: string) => `• ${p}`).join("\n")}\n\nAction Items:\n${(actionItems as string[]).map((a: string) => `• ${a}`).join("\n")}`;
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={22} className="text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Email Summarizer</h1>
          </div>
          <p className="text-gray-500">Instantly summarize long emails into key points and action items.</p>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setText(ex)}
              className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
              Example {i + 1}: {ex.slice(0, 40)}...
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Long Email</h2>
              <span className="text-xs text-gray-400">{text.split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              rows={12}
              placeholder="Paste a long email here to get an instant summary..."
              className="input-field resize-none w-full text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={analyze} disabled={loading || !text.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Summarizing...</> : <><Brain size={16} /> Summarize Email</>}
            </button>
          </div>

          {/* Result */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Summary</h2>
              {result && (
                <button onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
                  {copied ? <CheckCircle size={11} className="text-green-500" /> : <Copy size={11} />}
                  {copied ? "Copied!" : "Copy All"}
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Summary */}
                {summary && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className="text-indigo-600" />
                      <p className="text-sm font-semibold text-indigo-800">TL;DR Summary</p>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
                  </div>
                )}

                {/* Key Points */}
                {(keyPoints as string[]).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <List size={16} className="text-blue-600" />
                      <p className="text-sm font-semibold text-gray-800">Key Points</p>
                    </div>
                    <ul className="space-y-1.5">
                      {(keyPoints as string[]).map((point: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg">
                          <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items */}
                {(actionItems as string[]).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-green-600" />
                      <p className="text-sm font-semibold text-gray-800">Action Items</p>
                    </div>
                    <ul className="space-y-1.5">
                      {(actionItems as string[]).map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-green-50 px-3 py-2 rounded-lg">
                          <CheckCircle size={14} className="text-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-gray-900">{result.word_count ?? text.split(/\s+/).filter(Boolean).length}</p>
                    <p className="text-xs text-gray-500">Words</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-gray-900">{(keyPoints as string[]).length}</p>
                    <p className="text-xs text-gray-500">Key Points</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-lg font-bold text-gray-900">{(actionItems as string[]).length}</p>
                    <p className="text-xs text-gray-500">Action Items</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300">
                <div className="text-center">
                  <Brain size={40} className="mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Summary will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Brain, title: "AI Summarization", desc: "Condenses long emails into concise, readable summaries without losing important context.", color: "text-indigo-600 bg-indigo-50" },
            { icon: List, title: "Key Point Extraction", desc: "Automatically identifies and lists the most important points from any email.", color: "text-blue-600 bg-blue-50" },
            { icon: Clock, title: "Save Time", desc: "Process emails 10x faster. Spend less time reading and more time acting on what matters.", color: "text-green-600 bg-green-50" },
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

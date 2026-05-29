"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/apiClient";
import { GraduationCap, CheckCircle, AlertTriangle, Lightbulb, RefreshCw, Copy, Check } from "lucide-react";

interface CoachResult {
  original: string;
  corrected: string;
  corrections_count: number;
  corrections: Array<{ from: string; to: string }>;
  formality_score: number;
  improvement_pct: number;
  tips: string[];
  grade: string;
}

const GRADE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-green-500",  text: "text-white", label: "Excellent" },
  B: { bg: "bg-blue-500",   text: "text-white", label: "Good" },
  C: { bg: "bg-yellow-500", text: "text-white", label: "Needs Work" },
  D: { bg: "bg-red-500",    text: "text-white", label: "Poor" },
};

const COACH_TIPS = [
  "Start with a clear subject line that summarizes your request.",
  "Keep paragraphs short — 2-3 sentences max for easy reading.",
  "Always end with a clear call-to-action or next step.",
  "Avoid ALL CAPS — it reads as shouting.",
  "Use 'I' statements instead of accusatory 'you' language.",
  "Proofread before sending — typos reduce credibility.",
  "Be specific about deadlines: say 'by Friday 5 PM' not 'soon'.",
  "Thank the reader for their time at the end.",
];

export default function EmailCoachPage() {
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tipIndex] = useState(() => Math.floor(Math.random() * COACH_TIPS.length));

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  const handleAnalyze = async () => {
    if (draft.trim().length < 10) {
      toast.error("Please enter at least 10 characters.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await apiClient.post("/correct-grammar", { text: draft });
      // Compute grade from formality + improvement
      const score = data.formality_score * 100;
      const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D";

      // Generate contextual tips
      const tips: string[] = [];
      if (data.corrections_count > 5) tips.push("Many informal phrases detected — consider a more formal tone.");
      if (draft.split(" ").length < 20) tips.push("Your email is very short — add more context for clarity.");
      if (draft.split(" ").length > 200) tips.push("Long email — consider breaking it into bullet points.");
      if (!draft.toLowerCase().includes("please") && !draft.toLowerCase().includes("kindly"))
        tips.push("Add polite language like 'please' or 'kindly' to soften requests.");
      if (!draft.match(/[.!?]$/)) tips.push("End your email with proper punctuation.");
      if (tips.length === 0) tips.push("Great job! Your email looks professional and clear.");

      setResult({
        original: draft,
        corrected: data.corrected_text,
        corrections_count: data.corrections_count,
        corrections: data.corrections,
        formality_score: data.formality_score,
        improvement_pct: data.improvement_pct,
        tips,
        grade,
      });
    } catch {
      toast.error("Analysis failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.corrected);
    setCopied(true);
    toast.success("Copied improved email!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={22} className="text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Email Coach</h1>
          </div>
          <p className="text-gray-500">Paste your draft email — AI will score it, fix it, and give you tips to improve.</p>
        </div>

        {/* Daily tip */}
        <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <Lightbulb size={16} className="text-indigo-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-0.5">Daily Tip</p>
            <p className="text-sm text-indigo-800">{COACH_TIPS[tipIndex]}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Your Draft Email</h2>
            <textarea
              rows={12}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Paste your email draft here...&#10;&#10;Example:&#10;hey can u send me the report asap i need it today its really important"
              className="input-field resize-none w-full text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{draft.split(/\s+/).filter(Boolean).length} words</span>
              <button
                onClick={handleAnalyze}
                disabled={loading || draft.trim().length < 10}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><GraduationCap size={14} /> Analyze & Improve</>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-4">
            {!result ? (
              <div className="card flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap size={48} className="text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">Your analysis will appear here</p>
                <p className="text-xs text-gray-300 mt-1">Paste a draft and click Analyze</p>
              </div>
            ) : (
              <>
                {/* Grade card */}
                <div className="card p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${GRADE_STYLES[result.grade]?.bg} ${GRADE_STYLES[result.grade]?.text}`}>
                      {result.grade}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{GRADE_STYLES[result.grade]?.label}</p>
                      <p className="text-sm text-gray-500">Formality: {Math.round(result.formality_score * 100)}%</p>
                      <p className="text-sm text-gray-500">{result.corrections_count} improvements made</p>
                    </div>
                    {result.improvement_pct > 0 && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">+{result.improvement_pct.toFixed(0)}%</p>
                        <p className="text-xs text-gray-400">improved</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Improved email */}
                <div className="card space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-600" /> Improved Version
                    </h3>
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
                      {copied ? <><Check size={11} className="text-green-600" />Copied</> : <><Copy size={11} />Copy</>}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-green-50 border border-green-100 rounded-lg p-3 font-sans">
                    {result.corrected}
                  </pre>
                </div>

                {/* Tips */}
                <div className="card space-y-2">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Lightbulb size={14} className="text-yellow-500" /> Coaching Tips
                  </h3>
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <AlertTriangle size={13} className="text-yellow-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>

                {/* Corrections list */}
                {result.corrections.length > 0 && (
                  <div className="card space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm">Changes Made</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {result.corrections.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded line-through">{c.from}</span>
                          <span className="text-gray-400">→</span>
                          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{c.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => { setResult(null); setDraft(""); }}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw size={13} /> Analyze Another Email
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { generateReply } from "@/lib/api";
import { Shield, AlertTriangle, CheckCircle, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const EXAMPLES = [
  "Congratulations! You've won $1,000,000. Click here to claim your prize now. Verify your bank account details immediately.",
  "URGENT: Your account has been compromised. Click this link to verify your identity or your account will be suspended.",
  "Hi, I wanted to follow up on our meeting yesterday. Could you send me the project report by Friday?",
];

export default function SpamDetectorPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    is_suspicious: boolean;
    risk_level: string;
    risk_score: number;
    spam_warnings: string[];
    sentiment: string;
    predicted_category: string;
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
        is_suspicious: res.is_suspicious,
        risk_level: res.risk_level,
        risk_score: res.risk_score,
        spam_warnings: res.spam_warnings,
        sentiment: res.sentiment,
        predicted_category: res.predicted_category,
      });
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result?.risk_level === "high" ? "text-red-600 bg-red-50 border-red-200"
    : result?.risk_level === "medium" ? "text-yellow-600 bg-yellow-50 border-yellow-200"
    : "text-green-600 bg-green-50 border-green-200";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={22} className="text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Spam & Phishing Detector</h1>
          </div>
          <p className="text-gray-500">Analyze any email for spam, phishing attempts, and suspicious content using AI.</p>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => setText(ex)}
              className="text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full hover:bg-red-100 transition-colors">
              Example {i + 1}: {ex.slice(0, 35)}...
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Email Content to Analyze</h2>
            <textarea
              rows={10}
              placeholder="Paste the suspicious email content here..."
              className="input-field resize-none w-full text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button onClick={analyze} disabled={loading || !text.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Shield size={16} /> Analyze for Threats</>}
            </button>
          </div>

          {/* Result */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900">Analysis Result</h2>
            {result ? (
              <div className="space-y-4">
                {/* Risk Badge */}
                <div className={`border-2 rounded-xl p-4 ${riskColor}`}>
                  <div className="flex items-center gap-3">
                    {result.is_suspicious
                      ? <ShieldAlert size={32} />
                      : <ShieldCheck size={32} />}
                    <div>
                      <p className="font-bold text-lg">
                        {result.is_suspicious ? "⚠️ Suspicious Email Detected" : "✅ Email Appears Safe"}
                      </p>
                      <p className="text-sm capitalize">Risk Level: <strong>{result.risk_level}</strong></p>
                    </div>
                  </div>
                </div>

                {/* Risk Score */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">Risk Score</span>
                    <span className="font-bold">{Math.round(result.risk_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${result.risk_score > 0.6 ? "bg-red-500" : result.risk_score > 0.3 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${result.risk_score * 100}%` }}
                    />
                  </div>
                </div>

                {/* Warnings */}
                {result.spam_warnings.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Warnings Detected:</p>
                    <ul className="space-y-1.5">
                      {result.spam_warnings.map((w, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                          <AlertTriangle size={14} /> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Sentiment</p>
                    <p className="font-semibold text-gray-900 capitalize">{result.sentiment}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">{result.predicted_category}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300">
                <div className="text-center">
                  <Shield size={40} className="mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Analysis results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, title: "Phishing Detection", desc: "Identifies fake login pages, credential harvesting attempts, and social engineering tactics.", color: "text-red-600 bg-red-50" },
            { icon: Shield, title: "Spam Filtering", desc: "Detects unsolicited bulk emails, promotional spam, and unwanted commercial messages.", color: "text-orange-600 bg-orange-50" },
            { icon: CheckCircle, title: "Safe Email Verification", desc: "Confirms legitimate emails from known senders and validates communication patterns.", color: "text-green-600 bg-green-50" },
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

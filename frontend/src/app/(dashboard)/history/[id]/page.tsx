"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getHistoryItem } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import type { EmailHistoryItem } from "@/types";
import {
  ArrowLeft, Copy, Check, Tag, ArrowUp, AlertTriangle,
  Shield, Globe, Calendar, CheckSquare, Brain, Star,
} from "lucide-react";
import toast from "react-hot-toast";

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

export default function HistoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, hydrate } = useAuthStore();
  const [item, setItem] = useState<EmailHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (!id) return;
    getHistoryItem(id)
      .then(setItem)
      .catch(() => toast.error("Could not load this item"))
      .finally(() => setLoading(false));
  }, [isAuthenticated, id, router]);

  const handleCopy = async () => {
    if (!item) return;
    await navigator.clipboard.writeText(item.generated_reply);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : item ? (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reply Detail</h1>
                <p className="text-sm text-gray-400 mt-0.5">{formatDate(item.created_at)}</p>
              </div>
              <span className="text-xs capitalize bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {item.tone}
              </span>
            </div>

            {/* Suspicious warning */}
            {item.is_suspicious && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
                <Shield size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">
                  ⚠ This email was flagged as suspicious — Risk: {item.risk_level?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Urgent */}
            {item.is_urgent && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2" role="alert">
                <AlertTriangle size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Urgent email</span>
              </div>
            )}

            {/* AI Intelligence badges */}
            <div className="flex flex-wrap gap-2">
              {item.intent && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium capitalize">
                  <Tag size={10} className="inline mr-1" />{item.intent.replace("_", " ")}
                </span>
              )}
              {item.emotion && (
                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-medium capitalize">
                  😤 {item.emotion}
                </span>
              )}
              {item.predicted_priority && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_STYLES[item.predicted_priority] ?? "bg-gray-100 text-gray-600"}`}>
                  <ArrowUp size={10} className="inline mr-0.5" />{item.predicted_priority}
                </span>
              )}
              {item.predicted_category && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                  {item.predicted_category}
                </span>
              )}
              {item.detected_language && (
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full capitalize">
                  <Globe size={10} className="inline mr-1" />{item.detected_language}
                </span>
              )}
              {item.is_meeting_request && (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                  <Calendar size={10} className="inline mr-1" />Meeting Request
                </span>
              )}
              {item.reply_grade && (
                <span className={`text-xs px-2 py-1 rounded-full font-bold text-white ml-auto ${
                  item.reply_grade === "A" ? "bg-green-500" :
                  item.reply_grade === "B" ? "bg-blue-500" :
                  item.reply_grade === "C" ? "bg-yellow-500" : "bg-red-500"
                }`}>
                  Grade {item.reply_grade}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "AI Confidence", value: item.ai_confidence_pct ? `${item.ai_confidence_pct.toFixed(1)}%` : "—", icon: Brain, color: "text-blue-600" },
                { label: "Sentiment", value: item.sentiment ?? "—", icon: Tag, color: "text-green-600" },
                { label: "Tasks Found", value: item.total_tasks ?? 0, icon: CheckSquare, color: "text-purple-600" },
                { label: "User Rating", value: item.user_rating ? `${item.user_rating}/5 ⭐` : "Not rated", icon: Star, color: "text-yellow-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                  <p className="text-sm font-semibold text-gray-900 capitalize">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>

            {/* Original email */}
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Original Email
              </h2>
              {item.subject && (
                <p className="text-xs text-gray-500 mb-2">
                  <span className="font-medium">Subject:</span> {item.subject}
                </p>
              )}
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-200 leading-relaxed">
                {item.original_email}
              </pre>
            </div>

            {/* Generated reply */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Generated Reply
                </h2>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors"
                >
                  {copied
                    ? <><Check size={12} className="text-green-600" /> Copied</>
                    : <><Copy size={12} /> Copy</>
                  }
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-200 leading-relaxed">
                {item.generated_reply}
              </pre>
            </div>

            {item.s3_key && (
              <p className="text-xs text-gray-400">S3 Key: {item.s3_key}</p>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">History item not found.</p>
          </div>
        )}
      </main>
    </div>
  );
}

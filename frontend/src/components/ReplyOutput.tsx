"use client";
import { useState } from "react";
import { Copy, Check, AlertTriangle, Tag, ArrowUp, Star, Shield, Globe, Calendar, CheckSquare, Zap, Brain, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import { submitFeedback } from "@/lib/api";
import type { GenerateReplyResponse } from "@/types";

const PRIORITY_STYLES: Record<string, string> = { High:"bg-red-100 text-red-700", Medium:"bg-yellow-100 text-yellow-700", Low:"bg-green-100 text-green-700" };
const SENTIMENT_STYLES: Record<string, string> = { positive:"bg-green-100 text-green-700", negative:"bg-red-100 text-red-700", neutral:"bg-gray-100 text-gray-600" };
const EMOTION_STYLES: Record<string, string> = { angry:"bg-red-100 text-red-700", frustrated:"bg-orange-100 text-orange-700", urgent:"bg-yellow-100 text-yellow-700", happy:"bg-green-100 text-green-700", neutral:"bg-gray-100 text-gray-600" };
const RISK_STYLES: Record<string, string> = { high:"bg-red-100 text-red-700", medium:"bg-yellow-100 text-yellow-700", low:"bg-green-100 text-green-700" };
const GRADE_STYLES: Record<string, string> = { A:"bg-green-500", B:"bg-blue-500", C:"bg-yellow-500", D:"bg-red-500" };

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-xs"><span className="text-gray-600 capitalize">{label}</span><span className="font-medium">{pct}%</span></div>
      <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${color}`} style={{width:`${pct}%`}} /></div>
    </div>
  );
}

export default function ReplyOutput({ result }: { result: GenerateReplyResponse }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"reply"|"multi"|"analysis"|"tasks"|"meeting">("reply");
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000);
  };

  const handleRating = async (stars: number) => {
    setRating(stars);
    try {
      await submitFeedback({ history_id: result.history_id, rating: stars });
      setRatingSubmitted(true); toast.success("Thanks for your feedback!");
    } catch { toast.error("Could not save feedback"); }
  };

  const tabs = [
    { id: "reply", label: "Reply", icon: MessageSquare },
    { id: "multi", label: "3 Styles", icon: Zap },
    { id: "analysis", label: "Analysis", icon: Brain },
    { id: "tasks", label: `Tasks (${result.total_tasks})`, icon: CheckSquare },
    { id: "meeting", label: "Meeting", icon: Calendar },
  ] as const;

  return (
    <div className="space-y-3">
      {/* Spam Warning */}
      {result.is_suspicious && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-3" role="alert">
          <Shield size={16} className="text-red-600 mt-0.5 shrink-0" />
          <div><p className="text-sm font-semibold text-red-700">⚠ Suspicious Email Detected</p>
            <p className="text-xs text-red-600 mt-0.5">Risk: {result.risk_level.toUpperCase()} ({Math.round(result.risk_score*100)}%)</p>
            {result.spam_warnings.map((w,i) => <p key={i} className="text-xs text-red-500 mt-0.5">• {w}</p>)}
          </div>
        </div>
      )}
      {/* Urgent Banner */}
      {result.is_urgent && !result.is_suspicious && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2" role="alert">
          <AlertTriangle size={16} className="text-orange-600" /><span className="text-sm font-medium text-orange-700">Urgent email — prioritize this reply</span>
        </div>
      )}

      {/* Intelligence Badges Row */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium capitalize"><Tag size={10} className="inline mr-1" />{result.intent.replace("_"," ")}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${EMOTION_STYLES[result.emotion]}`}>😤 {result.emotion}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRIORITY_STYLES[result.predicted_priority]}`}><ArrowUp size={10} className="inline mr-0.5" />{result.predicted_priority}</span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${SENTIMENT_STYLES[result.sentiment]}`}>{result.sentiment}</span>
        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full capitalize"><Globe size={10} className="inline mr-1" />{result.detected_language}</span>
        {result.is_meeting_request && <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full"><Calendar size={10} className="inline mr-1" />Meeting Request</span>}
        <span className={`text-xs px-2 py-1 rounded-full font-bold text-white ml-auto ${GRADE_STYLES[result.reply_grade]}`}>Grade {result.reply_grade}</span>
      </div>

      {/* Email Summary Card */}
      {result.email_summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">📋 Email Summary</p>
          <p className="text-sm text-blue-800">{result.email_summary}</p>
          {result.deadlines.length > 0 && result.deadlines[0] !== "No deadlines mentioned" && (
            <p className="text-xs text-orange-600 mt-1 font-medium">⏰ Deadline: {result.deadlines.join(", ")}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === id ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Tab: Main Reply */}
          {activeTab === "reply" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Tone: <span className="font-medium capitalize">{result.tone}</span></span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">Recommended: <span className="font-medium capitalize">{result.recommended_tone}</span></span>
                </div>
                <button onClick={() => handleCopy(result.reply)} className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50">
                  {copied ? <><Check size={11} className="text-green-600" />Copied</> : <><Copy size={11} />Copy</>}
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded-lg p-4 border border-gray-200 min-h-[100px] font-sans">{result.reply}</pre>
              <p className="text-xs text-gray-400">Model v{result.model_version} · {Math.round(result.confidence*100)}% confidence</p>
            </div>
          )}

          {/* Tab: 3 Reply Styles */}
          {activeTab === "multi" && (
            <div className="space-y-4">
              {[
                { key: "short_reply", label: "⚡ Short Reply", desc: "Quick and concise" },
                { key: "detailed_reply", label: "📝 Detailed Reply", desc: "Comprehensive response" },
                { key: "persuasive_reply", label: "🎯 Persuasive Reply", desc: "Compelling and action-oriented" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
                    <div><p className="text-sm font-medium text-gray-800">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                    <button onClick={() => handleCopy(result.multi_replies[key as keyof typeof result.multi_replies])}
                      className="text-xs border border-gray-200 rounded px-2 py-1 hover:bg-white bg-white"><Copy size={11} /></button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 p-3 font-sans">{result.multi_replies[key as keyof typeof result.multi_replies]}</pre>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Analysis */}
          {activeTab === "analysis" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reply Quality Scores</p>
                <div className="space-y-2">
                  {Object.entries(result.reply_scores).map(([k, v]) => <ScoreBar key={k} label={k.replace("_"," ")} value={v} />)}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-sm font-bold text-white px-2 py-0.5 rounded ${GRADE_STYLES[result.reply_grade]}`}>Grade {result.reply_grade}</span>
                  <span className="text-sm text-gray-600">{result.ai_confidence_pct}% AI confidence</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Intent</p><p className="font-medium capitalize">{result.intent.replace("_"," ")}</p><p className="text-xs text-gray-400">{Math.round(result.intent_confidence*100)}% confident</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Emotion</p><p className="font-medium capitalize">{result.emotion}</p><p className="text-xs text-gray-400">Intensity: {Math.round(result.emotion_intensity*100)}%</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Language</p><p className="font-medium capitalize">{result.detected_language}</p><p className="text-xs text-gray-400">{Math.round(result.language_confidence*100)}% confident</p></div>
                <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Risk Level</p><p className={`font-medium capitalize ${result.risk_level==="high"?"text-red-600":result.risk_level==="medium"?"text-yellow-600":"text-green-600"}`}>{result.risk_level}</p><p className="text-xs text-gray-400">Score: {Math.round(result.risk_score*100)}%</p></div>
              </div>
              {result.entities.length > 0 && (
                <div><p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Entities Detected</p>
                  <div className="flex flex-wrap gap-1">{result.entities.map((e,i) => <span key={i} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{e}</span>)}</div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Tasks */}
          {activeTab === "tasks" && (
            <div className="space-y-2">
              {result.extracted_tasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No action items detected in this email.</p>
              ) : result.extracted_tasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2 p-2 border border-gray-200 rounded-lg">
                  <CheckSquare size={14} className={task.priority==="high"?"text-red-500":"text-blue-500"} />
                  <div className="flex-1"><p className="text-sm text-gray-800">{task.task}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${task.priority==="high"?"bg-red-100 text-red-700":"bg-blue-100 text-blue-700"}`}>{task.priority}</span>
                      <span className="text-xs text-gray-400">{task.assignee}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Meeting */}
          {activeTab === "meeting" && (
            <div className="space-y-3">
              {!result.is_meeting_request ? (
                <p className="text-sm text-gray-500 text-center py-4">No meeting request detected.</p>
              ) : (
                <>
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                    <p className="text-sm font-semibold text-indigo-700">📅 Meeting Request Detected</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-xs text-gray-500 mb-1">Dates</p>{result.meeting_dates.length ? result.meeting_dates.map((d,i)=><p key={i} className="font-medium">{d}</p>) : <p className="text-gray-400">Not specified</p>}</div>
                    <div><p className="text-xs text-gray-500 mb-1">Times</p>{result.meeting_times.length ? result.meeting_times.map((t,i)=><p key={i} className="font-medium">{t}</p>) : <p className="text-gray-400">Not specified</p>}</div>
                    <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Participants</p>{result.meeting_participants.length ? <div className="flex flex-wrap gap-1">{result.meeting_participants.map((p,i)=><span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{p}</span>)}</div> : <p className="text-gray-400">Not specified</p>}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature 19: Star Rating */}
      <div className="card py-3">
        <p className="text-xs text-gray-500 mb-2 text-center">Rate this reply</p>
        <div className="flex justify-center gap-1">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => !ratingSubmitted && handleRating(s)} disabled={ratingSubmitted}
              className={`transition-colors ${s <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 disabled:cursor-default`}>
              <Star size={20} fill={s <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        {ratingSubmitted && <p className="text-xs text-green-600 text-center mt-1">Feedback saved ✓</p>}
      </div>
    </div>
  );
}

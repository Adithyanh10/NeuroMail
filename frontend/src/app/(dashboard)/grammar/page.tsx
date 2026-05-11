"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { correctGrammar } from "@/lib/api";
import Navbar from "@/components/Navbar";
import type { GrammarCorrectionResponse } from "@/types";
import { CheckCircle, Copy, ArrowRight, Wand2 } from "lucide-react";

export default function GrammarPage() {
  const [result, setResult] = useState<GrammarCorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch } = useForm<{ text: string }>();
  const text = watch("text", "");

  const onSubmit = async (data: { text: string }) => {
    setLoading(true);
    try {
      const res = await correctGrammar(data.text);
      setResult(res);
      toast.success(`${res.corrections_count} corrections applied`);
    } catch {
      toast.error("Correction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formalityColor =
    result && result.formality_score >= 0.8 ? "text-green-600"
    : result && result.formality_score >= 0.6 ? "text-yellow-600"
    : "text-red-600";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wand2 size={22} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Grammar & Formality Corrector</h1>
          </div>
          <p className="text-gray-500">Paste a casual draft and instantly convert it into a professional business email.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "hey can u send me the report asap",
            "i wanna know when my order gonna arrive",
            "gonna need u to fix this asap its kinda urgent",
          ].map((ex) => (
            <button
              key={ex}
              onClick={() => {
                const el = document.getElementById("draft-input") as HTMLTextAreaElement;
                if (el) { el.value = ex; el.dispatchEvent(new Event("input", { bubbles: true })); }
              }}
              className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              Try: &ldquo;{ex.slice(0, 30)}...&rdquo;
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="card space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Your Casual Draft
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <textarea
                id="draft-input"
                rows={10}
                placeholder="hey can u send me the report asap? gonna need it by tomorrow kinda urgent..."
                className="input-field resize-none w-full text-sm"
                {...register("text", { required: true, minLength: 5 })}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{text.length} / 5000 chars</span>
                <button type="submit" disabled={loading || text.length < 5} className="btn-primary flex items-center gap-2">
                  {loading ? "Correcting..." : <><ArrowRight size={14} /> Correct & Formalize</>}
                </button>
              </div>
            </form>
          </div>

          {/* Output */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                Professional Version
              </h2>
              {result && (
                <button
                  onClick={() => navigator.clipboard.writeText(result.corrected_text).then(() => toast.success("Copied!"))}
                  className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
                >
                  <Copy size={11} /> Copy
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-green-50 border border-green-200 rounded-lg p-4 min-h-[180px] font-sans leading-relaxed">
                  {result.corrected_text}
                </pre>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-700">{result.corrections_count}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Corrections</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className={`text-2xl font-bold ${formalityColor}`}>{Math.round(result.formality_score * 100)}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Formality</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-purple-700">+{result.improvement_pct}%</p>
                    <p className="text-xs text-gray-500 mt-0.5">Improved</p>
                  </div>
                </div>
                {result.corrections.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Changes Applied</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {result.corrections.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded line-through shrink-0">{c.from}</span>
                          <ArrowRight size={10} className="text-gray-400 shrink-0" />
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">{c.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-300">
                <div className="text-center">
                  <CheckCircle size={40} className="mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Corrected text will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

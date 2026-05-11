"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";
import { getToken } from "@/lib/apiClient";
import { Zap, Square, Copy } from "lucide-react";
import type { Tone } from "@/types";

const schema = z.object({
  email_content: z.string().min(10, "At least 10 characters"),
  tone: z.enum(["professional", "formal", "friendly"]),
  subject: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
];

export default function StreamingPage() {
  const { isAuthenticated } = useAuthStore();
  const [streaming, setStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [meta, setMeta] = useState<Record<string, unknown> | null>(null);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tone: "professional" },
  });

  const onSubmit = async (data: FormData) => {
    setStreamedText("");
    setMeta(null);
    setDone(false);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = getToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/generate-reply/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email_content: data.email_content,
            tone: data.tone,
            subject: data.subject || "",
          }),
          signal: controller.signal,
        }
      );

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === "meta") {
              setMeta(json.data);
            } else if (json.type === "token") {
              setStreamedText((prev) => prev + json.token);
            } else if (json.type === "done") {
              setDone(true);
            } else if (json.type === "error") {
              toast.error(json.message || "Streaming failed. Please try again.");
              setDone(true);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Streaming failed. Please try again.");
      }
    } finally {
      setStreaming(false);
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
    setDone(true);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={22} className="text-yellow-500" />
              <h1 className="text-3xl font-bold text-gray-900">Real-Time AI Streaming</h1>
            </div>
            <p className="text-gray-500">
              Watch your reply generate token-by-token — like ChatGPT, powered by your trained model.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Email Input</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Re: Project Update"
                    className="input-field"
                    {...register("subject")}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={7}
                    placeholder="Paste the email you want to reply to..."
                    className="input-field resize-none"
                    {...register("email_content")}
                  />
                  {errors.email_content && (
                    <p className="text-red-500 text-xs mt-1">{errors.email_content.message}</p>
                  )}
                </div>
                <fieldset>
                  <legend className="text-sm font-medium text-gray-700 mb-2">Tone</legend>
                  <div className="flex gap-2">
                    {TONE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex-1 flex items-center justify-center p-2 border rounded-lg cursor-pointer text-sm has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50 hover:border-blue-400 transition-colors"
                      >
                        <input type="radio" value={opt.value} className="sr-only" {...register("tone")} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={streaming}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> {streaming ? "Streaming..." : "Stream Reply"}
                  </button>
                  {streaming && (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    >
                      <Square size={13} /> Stop
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Stream output */}
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  Live Output
                  {streaming && (
                    <span className="flex items-center gap-1 text-xs text-green-600 font-normal">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Streaming
                    </span>
                  )}
                  {done && !streaming && (
                    <span className="text-xs text-gray-400 font-normal">Complete</span>
                  )}
                </h2>
                {streamedText && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(streamedText).then(() => toast.success("Copied!"))
                    }
                    className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <Copy size={11} /> Copy
                  </button>
                )}
              </div>

              <div className="relative min-h-[220px] bg-gray-50 border border-gray-200 rounded-lg p-4">
                {streamedText ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                    {streamedText}
                    {streaming && (
                      <span className="inline-block w-0.5 h-4 bg-blue-600 ml-0.5 animate-pulse align-middle" />
                    )}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <div className="text-center">
                      <Zap size={36} className="mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Reply will stream here in real-time</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata after stream */}
              {meta && done && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { label: "Intent", value: String(meta.intent ?? "—").replace("_", " ") },
                    { label: "Emotion", value: String(meta.emotion ?? "—") },
                    { label: "Priority", value: String(meta.predicted_priority ?? "—") },
                    { label: "Sentiment", value: String(meta.sentiment ?? "—") },
                    { label: "Language", value: String(meta.detected_language ?? "—") },
                    { label: "Grade", value: String(meta.reply_grade ?? "—") },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-lg p-2">
                      <p className="text-gray-400">{label}</p>
                      <p className="font-semibold text-gray-800 capitalize mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

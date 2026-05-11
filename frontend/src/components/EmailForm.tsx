"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Link from "next/link";
import { generateReply } from "@/lib/api";
import type { GenerateReplyResponse, Tone } from "@/types";
import ReplyOutput from "./ReplyOutput";
import { Zap } from "lucide-react";

const schema = z.object({
  email_content: z.string().min(10, "Email content must be at least 10 characters"),
  tone: z.enum(["professional", "formal", "friendly"]),
  subject: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const TONE_OPTIONS: { value: Tone; label: string; description: string; color: string }[] = [
  { value: "professional", label: "Professional", description: "Clear and business-appropriate", color: "has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50" },
  { value: "formal",       label: "Formal",       description: "Structured and official",        color: "has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50" },
  { value: "friendly",     label: "Friendly",     description: "Warm and conversational",        color: "has-[:checked]:border-pink-600 has-[:checked]:bg-pink-50" },
];

export default function EmailForm() {
  const [result, setResult] = useState<GenerateReplyResponse | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tone: "professional" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await generateReply(data);
      setResult(response);
      toast.success("Reply generated with 20 AI features!");
    } catch {
      toast.error("Failed to generate reply. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Generate AI Reply</h2>
          <Link
            href="/streaming"
            className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-full hover:bg-yellow-100 transition-colors"
          >
            <Zap size={11} /> Try Live Stream
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="subject"
              type="text"
              placeholder="Re: Project Update"
              className="input-field"
              {...register("subject")}
            />
          </div>

          {/* Email Content */}
          <div>
            <label htmlFor="email_content" className="block text-sm font-medium text-gray-700 mb-1">
              Incoming Email <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="email_content"
              rows={7}
              placeholder="Paste the email you want to reply to...&#10;&#10;The AI will detect intent, emotion, urgency, language, meeting requests, action items, and more."
              className="input-field resize-none"
              aria-required="true"
              {...register("email_content")}
            />
            {errors.email_content && (
              <p className="text-red-500 text-xs mt-1" role="alert">
                {errors.email_content.message}
              </p>
            )}
          </div>

          {/* Tone Selection */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Reply Tone <span className="text-red-500" aria-hidden="true">*</span>
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${option.color}`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register("tone")}
                  />
                  <span className="font-medium text-sm text-gray-900">{option.label}</span>
                  <span className="text-xs text-gray-500 text-center mt-0.5">{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing with 20 AI features...
              </span>
            ) : (
              "Generate AI Reply"
            )}
          </button>
        </form>
      </div>

      {result && <ReplyOutput result={result} />}
    </div>
  );
}

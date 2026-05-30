"use client";

import { useEffect, useState } from "react";
import { Mail, Zap, Shield, BarChart3, CheckCircle2 } from "lucide-react";

interface Props {
  username: string;
  onComplete: () => void;
}

const STEPS = [
  { icon: Shield,    label: "Verifying credentials",  color: "text-blue-400" },
  { icon: Mail,      label: "Loading your inbox",      color: "text-indigo-400" },
  { icon: BarChart3, label: "Fetching analytics",      color: "text-purple-400" },
  { icon: Zap,       label: "Launching AI engine",     color: "text-pink-400" },
];

// Total duration: 4 steps × 650ms + 700ms done pause = 3300ms
// Login page enforces a 3500ms minimum, so animation always completes fully
const STEP_DELAY = 650;
const DONE_PAUSE = 700;

export default function LoginAnimation({ username, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = greeting phase
  const [done, setDone]               = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Show greeting first
    timers.push(setTimeout(() => setShowGreeting(true), 100));

    // Advance each step
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setCurrentStep(i), 400 + i * STEP_DELAY));
    });

    // Mark done
    timers.push(setTimeout(() => setDone(true), 400 + STEPS.length * STEP_DELAY));

    // Navigate
    timers.push(setTimeout(() => onComplete(), 400 + STEPS.length * STEP_DELAY + DONE_PAUSE));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-sm mx-4">

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">AI Email Reply</p>
              <p className="text-gray-500 text-xs">Powered by AI</p>
            </div>
          </div>

          {/* Greeting */}
          <div className={`mb-8 transition-all duration-500 ${showGreeting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
            {done ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-tight">You&apos;re in!</p>
                  <p className="text-gray-400 text-sm">Redirecting to dashboard…</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-1">Welcome back</p>
                <p className="text-white font-bold text-2xl">{username} 👋</p>
              </>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map(({ icon: Icon, label, color }, i) => {
              const isActive    = currentStep === i;
              const isCompleted = currentStep > i || done;
              const isPending   = currentStep < i && !done;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                    isCompleted
                      ? "bg-gray-800/80 border-gray-700"
                      : isActive
                      ? "bg-gray-800 border-blue-500/50 shadow-sm shadow-blue-500/10"
                      : "bg-gray-800/30 border-gray-800/50"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted ? "bg-green-500/20" : isActive ? "bg-blue-500/20" : "bg-gray-700/50"
                  }`}>
                    {isCompleted
                      ? <CheckCircle2 size={14} className="text-green-400" />
                      : <Icon size={14} className={isActive ? color : "text-gray-600"} />
                    }
                  </div>

                  {/* Label */}
                  <span className={`text-sm font-medium flex-1 transition-colors duration-300 ${
                    isCompleted ? "text-gray-400" : isActive ? "text-white" : "text-gray-600"
                  }`}>
                    {label}
                  </span>

                  {/* Active indicator */}
                  {isActive && (
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((j) => (
                        <span
                          key={j}
                          className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${j * 0.15}s` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Pending dot */}
                  {isPending && (
                    <span className="w-1.5 h-1.5 bg-gray-700 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-6 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{
                width: done
                  ? "100%"
                  : currentStep < 0
                  ? "0%"
                  : `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

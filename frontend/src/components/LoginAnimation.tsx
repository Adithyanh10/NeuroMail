"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle, Sparkles, Zap, Brain, Shield } from "lucide-react";

interface Props {
  username: string;
  onComplete: () => void;
}

const FEATURES = [
  { icon: Brain,    label: "Loading AI Engine..."        },
  { icon: Mail,     label: "Preparing Email Analyzer..." },
  { icon: Shield,   label: "Securing your session..."    },
  { icon: Sparkles, label: "Almost ready..."             },
];

export default function LoginAnimation({ username, onComplete }: Props) {
  const [step, setStep]       = useState(0);   // 0-3 loading steps
  const [done, setDone]       = useState(false);
  const [progress, setProgress] = useState(0);

  // Advance steps
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    FEATURES.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i + 1), 400 + i * 500));
    });
    timers.push(setTimeout(() => setDone(true),  400 + FEATURES.length * 500));
    timers.push(setTimeout(() => onComplete(),   400 + FEATURES.length * 500 + 900));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Progress bar
  useEffect(() => {
    const total = 400 + FEATURES.length * 500 + 900;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 100 / (total / 50), 100));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
      {/* Floating background emails */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 animate-float-email"
            style={{
              left:  `${10 + i * 12}%`,
              top:   `${15 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            <Mail size={24 + i * 4} className="text-white" />
          </div>
        ))}
      </div>

      <div className="relative text-center px-8 max-w-sm w-full">
        {/* Main icon with pulse ring */}
        <div className="relative flex items-center justify-center mb-8">
          <span className="absolute w-24 h-24 rounded-full bg-white/20 animate-pulse-ring" />
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${done ? "bg-green-400 scale-110" : "bg-white/20 backdrop-blur"}`}>
            {done
              ? <CheckCircle size={40} className="text-white animate-scale-in" />
              : <Zap size={40} className="text-white animate-pulse" />
            }
          </div>
        </div>

        {/* Welcome text */}
        <div className="animate-fade-in-up mb-2">
          <h2 className="text-3xl font-bold text-white">
            {done ? "You're in! 🎉" : "Welcome back"}
          </h2>
          <p className="text-blue-200 mt-1 text-lg font-medium">{username}</p>
        </div>

        {/* Loading steps */}
        {!done && (
          <div className="mt-8 space-y-3">
            {FEATURES.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  i < step
                    ? "bg-white/20 text-white"
                    : i === step
                    ? "bg-white/10 text-blue-200"
                    : "opacity-30 text-blue-300"
                }`}
              >
                <Icon size={16} className={i < step ? "text-green-300" : "text-blue-300"} />
                <span className="text-sm font-medium">{label}</span>
                {i < step && (
                  <CheckCircle size={14} className="ml-auto text-green-300 animate-scale-in" />
                )}
                {i === step && (
                  <span className="ml-auto w-1.5 h-4 bg-blue-300 rounded animate-typing" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Done message */}
        {done && (
          <p className="mt-4 text-blue-200 text-sm animate-fade-in-up">
            Redirecting to your dashboard...
          </p>
        )}

        {/* Progress bar */}
        <div className="mt-8 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-300 to-green-300 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

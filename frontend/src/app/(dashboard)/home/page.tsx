"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import {
  Zap, Brain, Shield, BarChart2, MessageSquare, Clock,
  GraduationCap, Trophy, Upload, Wand2, ChevronDown,
  ChevronRight, Bot, User, DollarSign, Cpu, Lock,
  CheckCircle, Star, ArrowRight, Sparkles,
} from "lucide-react";

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: MessageSquare, label: "Generate Reply",  desc: "AI reply in seconds",         href: "/dashboard",    color: "bg-blue-500" },
  { icon: Zap,           label: "Live Stream",     desc: "Watch reply type live",        href: "/streaming",    color: "bg-yellow-500" },
  { icon: Brain,         label: "AI Insights",     desc: "Deep email analytics",         href: "/insights",     color: "bg-purple-500" },
  { icon: BarChart2,     label: "Analytics",       desc: "Usage stats & trends",         href: "/analytics",    color: "bg-green-500" },
  { icon: GraduationCap, label: "Email Coach",     desc: "Score & improve drafts",       href: "/email-coach",  color: "bg-indigo-500" },
  { icon: Wand2,         label: "Grammar Fix",     desc: "Fix & formalize text",         href: "/grammar",      color: "bg-pink-500" },
  { icon: Trophy,        label: "Achievements",    desc: "Badges & XP rewards",          href: "/achievements", color: "bg-orange-500" },
  { icon: Clock,         label: "History",         desc: "All past replies",             href: "/history/list", color: "bg-teal-500" },
  { icon: Upload,        label: "Upload Email",    desc: "Upload .eml or .txt files",    href: "/upload",       color: "bg-gray-500" },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "20+",   label: "AI Features" },
  { value: "99%",   label: "Uptime" },
  { value: "< 2s",  label: "Reply Speed" },
  { value: "6",     label: "Languages" },
];

// ── FAQ sections ──────────────────────────────────────────────────────────────
const FAQ_SECTIONS = [
  {
    id: "chatbot",
    icon: Bot,
    color: "from-blue-500 to-indigo-600",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    title: "Chatbot Training & Support",
    subtitle: "How the AI learns and how to get help",
    faqs: [
      {
        q: "How was the AI model trained?",
        a: "Our model was trained on a curated dataset of 10,000+ professional email exchanges across categories like customer support, HR, sales, and complaints. We used TF-IDF vectorization with Logistic Regression classifiers for category, tone, and priority detection — combined with a cosine similarity retrieval engine to find the most relevant reply template.",
      },
      {
        q: "Can the AI learn from my replies?",
        a: "Yes! Every time you rate a reply with stars, that feedback is stored. Our retraining pipeline uses your ratings to fine-tune the retrieval engine — so the more you use it, the better it gets at matching your communication style.",
      },
      {
        q: "What happens if the AI gives a wrong reply?",
        a: "You can rate the reply 1-2 stars to flag it as poor quality. The system logs this and it feeds into the next training cycle. You can also use the Email Coach to manually improve any draft before sending.",
      },
      {
        q: "How do I get support if something breaks?",
        a: "Check the backend logs first — run `uvicorn app.main:app --reload --port 8000` and look for error messages. For ML issues, check the ML server logs on port 8001. The API docs at http://localhost:8000/docs show all available endpoints with request/response schemas.",
      },
    ],
  },
  {
    id: "pricing",
    icon: DollarSign,
    color: "from-green-500 to-teal-600",
    bgLight: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    title: "Pricing",
    subtitle: "Plans, limits, and what's included",
    faqs: [
      {
        q: "Is this free to use?",
        a: "Yes — the entire platform is free for local development and personal use. You run it on your own machine with no API costs. The ML model runs locally, so there are no per-request charges.",
      },
      {
        q: "Are there any usage limits?",
        a: "The backend enforces a rate limit of 20 generate-reply requests per minute per user to prevent abuse. There are no daily or monthly caps. File uploads are limited to 5 MB per file.",
      },
      {
        q: "What would a production pricing model look like?",
        a: "A typical SaaS model for this product would be: Free tier (50 replies/month), Pro at $9/month (unlimited replies, priority support, advanced analytics), and Enterprise at $49/month (team accounts, custom model training, API access, SLA guarantee).",
      },
      {
        q: "Does it cost anything to run on AWS?",
        a: "S3 file storage costs roughly $0.023/GB/month — negligible for personal use. If you deploy to EC2, a t3.medium instance runs about $30/month. The ML model and database run locally by default with zero cloud cost.",
      },
    ],
  },
  {
    id: "technology",
    icon: Cpu,
    color: "from-purple-500 to-pink-600",
    bgLight: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    title: "Technology & Integrations",
    subtitle: "Stack, architecture, and how it all connects",
    faqs: [
      {
        q: "What tech stack does this use?",
        a: "Frontend: Next.js 14 + TypeScript + Tailwind CSS + Zustand. Backend: FastAPI (Python) + SQLAlchemy + Alembic + JWT auth. ML Server: FastAPI + scikit-learn (TF-IDF + Logistic Regression). Storage: AWS S3. Data versioning: DVC. Database: SQLite (dev) / PostgreSQL (prod).",
      },
      {
        q: "How does the streaming work?",
        a: "The backend calls the ML server's /predict endpoint to get the full reply, then streams it word-by-word to the frontend using Server-Sent Events (SSE) with a 40ms delay between words — giving the ChatGPT-style typing effect.",
      },
      {
        q: "Can I integrate this with other tools?",
        a: "Yes. The backend exposes a full REST API at /api/v1 with auto-generated docs at /docs. You can integrate with Zapier, Make (Integromat), or any tool that supports HTTP webhooks. The /generate-reply endpoint accepts JSON and returns a structured response with 20+ fields.",
      },
      {
        q: "What databases are supported?",
        a: "SQLite for local development (zero setup). PostgreSQL for production (via Supabase or any hosted Postgres). The ORM is SQLAlchemy with async support, so switching databases only requires changing the DATABASE_URL in .env.",
      },
    ],
  },
  {
    id: "security",
    icon: Lock,
    color: "from-red-500 to-orange-600",
    bgLight: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
    title: "Security & Compliance",
    subtitle: "How your data is protected",
    faqs: [
      {
        q: "How are passwords stored?",
        a: "All passwords are hashed using bcrypt with a cost factor of 12 before storage. Plain-text passwords are never stored or logged. The hashing happens in the auth service before any database write.",
      },
      {
        q: "How does authentication work?",
        a: "We use JWT (JSON Web Tokens) with a 24-hour expiry. Tokens are signed with a secret key using HS256 algorithm. Tokens are stored in HTTP-only cookies on the frontend. Every protected API endpoint validates the token via a FastAPI dependency.",
      },
      {
        q: "Is my email data private?",
        a: "All email data is stored in your local database — nothing is sent to third-party AI services. The ML model runs entirely on your machine. If you use S3 uploads, files are stored in your own AWS bucket under your credentials.",
      },
      {
        q: "What spam and phishing protection is built in?",
        a: "The AI automatically scans every incoming email for 20+ spam patterns and 10+ phishing indicators. Suspicious emails are flagged with a risk score (0-100%), risk level (low/medium/high), and specific warnings. High-risk emails show a red alert banner and the recommendation 'Do not reply — report to security team'.",
      },
    ],
  },
];

// ── FAQ Item component ────────────────────────────────────────────────────────
function FaqItem({ q, a, bgLight, borderColor, textColor }: {
  q: string; a: string; bgLight: string; borderColor: string; textColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [showBot, setShowBot] = useState(false);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => setShowBot(true), 300);
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${borderColor}`}>
      {/* Question */}
      <button
        onClick={() => open ? (setOpen(false), setShowBot(false)) : handleOpen()}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${bgLight}`}>
            <User size={13} className={textColor} />
          </div>
          <span className="text-sm font-medium text-gray-800">{q}</span>
        </div>
        <ChevronDown size={15} className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Answer — bot style */}
      {open && (
        <div className={`px-4 pb-4 ${bgLight}`}>
          <div className="flex items-start gap-3 pt-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${textColor.replace("text-", "bg-").replace("-700", "-600")} bg-opacity-20`}
              style={{ background: "rgba(99,102,241,0.12)" }}>
              <Bot size={13} className={textColor} />
            </div>
            <div className={`flex-1 text-sm text-gray-700 leading-relaxed transition-all duration-500 ${showBot ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}>
              {a}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hydrate, username } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!isAuthenticated) router.push("/login");
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-yellow-300" />
              <span className="text-sm font-medium text-blue-200">AI-Powered Email Intelligence</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              {greeting()}, {username || "there"} 👋
            </h1>
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Your AI email assistant is ready. Generate professional replies, analyze tone,
              detect intent, extract action items, and more — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard"
                className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                <MessageSquare size={16} /> Generate Reply
              </Link>
              <Link href="/streaming"
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors">
                <Zap size={16} /> Try Live Stream
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-white">{value}</p>
                <p className="text-xs text-blue-200 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Features</h2>
            <p className="text-gray-500 text-sm mt-0.5">Everything available in your dashboard</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium">
            Go to Dashboard <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc, href, color }) => (
            <Link key={href} href={href}
              className="card p-4 flex flex-col items-center text-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={13} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How It Works</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Three steps to a perfect reply</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", icon: MessageSquare, title: "Paste the Email",    desc: "Copy the email you received and paste it into the form. Add a subject if you have one.", color: "bg-blue-500" },
              { step: "2", icon: Brain,         title: "AI Analyzes It",     desc: "The AI detects intent, emotion, urgency, language, meeting requests, and 15+ more signals.", color: "bg-purple-500" },
              { step: "3", icon: CheckCircle,   title: "Get Your Reply",     desc: "Receive a professional reply in 3 styles — short, detailed, and persuasive. Copy and send.", color: "bg-green-500" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} mb-4`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mb-2">{step}</div>
                <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Capabilities ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Capabilities</h2>
        <p className="text-gray-500 text-sm mb-8">Every reply is analyzed across 20+ dimensions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            "Intent Detection", "Emotion Analysis", "Tone Optimization", "Sentiment Analysis",
            "Reply Scoring (A-D)", "3 Reply Styles", "Email Summarization", "Grammar Correction",
            "Priority Detection", "Spam Detection", "Language Detection", "Meeting Extraction",
            "Action Item Extraction", "Signature Generator", "Reply Humanization", "Tone Heatmap",
            "Reply Risk Checker", "Live Streaming", "Star Rating Feedback", "Writing Style Profile",
          ].map((cap) => (
            <div key={cap} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
              <Star size={11} className="text-yellow-400 shrink-0" fill="currentColor" />
              <span className="text-xs font-medium text-gray-700">{cap}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ Sections ──────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 space-y-14">
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-500">Click any question to see the AI-powered answer</p>
          </div>

          {FAQ_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} id={section.id}>
                {/* Section header */}
                <div className={`flex items-center gap-4 mb-6 p-5 rounded-2xl bg-gradient-to-r ${section.color} text-white`}>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    <p className="text-sm text-white/80">{section.subtitle}</p>
                  </div>
                </div>

                {/* FAQ items */}
                <div className="space-y-3">
                  {section.faqs.map((faq) => (
                    <FaqItem
                      key={faq.q}
                      q={faq.q}
                      a={faq.a}
                      bgLight={section.bgLight}
                      borderColor={section.borderColor}
                      textColor={section.textColor}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-2">Ready to reply smarter?</h2>
          <p className="text-blue-200 mb-6">Paste your first email and see the AI in action.</p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            <MessageSquare size={16} /> Start Generating Replies
          </Link>
        </div>
      </section>
    </div>
  );
}

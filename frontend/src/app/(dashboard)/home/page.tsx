"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import { getAnalytics } from "@/lib/api";
import type { AnalyticsResponse } from "@/types";
import {
  Zap, Mail, TrendingUp, Award, ArrowRight, Sparkles,
  BarChart3, FileText, Shield, Calendar, Brain,
  MessageSquare, DollarSign, Cpu, Lock,
  CheckCircle, Star, Users, Globe, ChevronDown,
  BookOpen, Wand2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated, username } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push("/login");
  }, [isHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) getAnalytics().then(setAnalytics).catch(() => null);
  }, [isAuthenticated]);

  if (!isHydrated || !isAuthenticated) return null;

  const quickActions = [
    { icon: Mail,      title: "Generate Reply",    desc: "AI-powered responses",     link: "/dashboard",       color: "from-blue-500 to-blue-600",    shadow: "shadow-blue-200" },
    { icon: BarChart3, title: "Analytics",          desc: "Track email patterns",     link: "/analytics",       color: "from-purple-500 to-purple-600", shadow: "shadow-purple-200" },
    { icon: FileText,  title: "History",            desc: "Browse past replies",      link: "/history/list",    color: "from-green-500 to-green-600",   shadow: "shadow-green-200" },
    { icon: Wand2,     title: "Grammar Fix",        desc: "Formalize your drafts",    link: "/grammar",         color: "from-orange-500 to-orange-600", shadow: "shadow-orange-200" },
    { icon: Shield,    title: "Spam Detector",      desc: "Detect phishing & spam",   link: "/spam-detector",   color: "from-red-500 to-red-600",       shadow: "shadow-red-200" },
    { icon: Calendar,  title: "Meeting Detector",   desc: "Extract meeting details",  link: "/meeting-detector",color: "from-teal-500 to-teal-600",     shadow: "shadow-teal-200" },
    { icon: Brain,     title: "Summarizer",         desc: "Summarize long emails",    link: "/summarizer",      color: "from-indigo-500 to-indigo-600", shadow: "shadow-indigo-200" },
    { icon: BookOpen,  title: "Writing Style",      desc: "Your personal AI coach",   link: "/writing-style",   color: "from-pink-500 to-pink-600",     shadow: "shadow-pink-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          {/* Glow orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
                <Sparkles size={14} className="text-yellow-300" />
                <span>20+ AI Features · Powered by NLP</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
                Welcome back,<br />
                <span className="text-yellow-300">{username || "User"}</span> 👋
              </h1>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Your AI email assistant is ready. Generate perfect replies, detect spam, extract meetings, and more — all in seconds.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2 bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                  <Mail size={18} /> Generate Reply <ArrowRight size={16} />
                </button>
                <button onClick={() => router.push("/analytics")}
                  className="flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm">
                  <BarChart3 size={18} /> View Analytics
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIVE STATS ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 -mt-6 mb-10 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Replies",    value: analytics?.total_replies ?? 0,                                    icon: Mail,      color: "text-blue-600",   bg: "bg-blue-50" },
              { label: "Avg Confidence",   value: analytics ? `${Math.round(analytics.avg_confidence * 100)}%` : "0%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Threats Blocked",  value: analytics?.suspicious_count ?? 0,                                 icon: Shield,    color: "text-red-600",    bg: "bg-red-50" },
              { label: "Meeting Requests", value: analytics?.meeting_requests_count ?? 0,                           icon: Calendar,  color: "text-teal-600",   bg: "bg-teal-50" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <s.icon size={22} className={s.color} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* ── QUICK ACTIONS ────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Quick Actions</h2>
          <p className="text-gray-500 text-sm mb-6">Jump straight into any feature</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {quickActions.map((a, i) => (
              <button key={i} onClick={() => router.push(a.link)}
                className="group relative bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                {/* Gradient accent top bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${a.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-11 h-11 bg-gradient-to-br ${a.color} rounded-xl flex items-center justify-center mb-4 shadow-md ${a.shadow}`}>
                  <a.icon size={20} className="text-white" />
                </div>
                <p className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{a.title}</p>
                <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
                <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ArrowRight size={11} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── FEATURES BANNER ──────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-14 mb-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles size={28} className="text-yellow-400" /> What Makes Us Unique
              </h2>
              <p className="text-gray-400">Powered by advanced NLP models with 20+ intelligent features</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Zap,       title: "20+ AI Features",     desc: "Industry-leading analysis",    color: "bg-yellow-500/20 text-yellow-400" },
                { icon: TrendingUp,title: "Real-time Analytics", desc: "Track patterns & trends",      color: "bg-blue-500/20 text-blue-400" },
                { icon: Award,     title: "Quality Scoring",     desc: "Grade A–F for every reply",    color: "bg-green-500/20 text-green-400" },
                { icon: Shield,    title: "Spam Detection",      desc: "AI-powered threat analysis",   color: "bg-red-500/20 text-red-400" },
                { icon: Globe,     title: "50+ Languages",       desc: "Detect & reply in any lang",   color: "bg-purple-500/20 text-purple-400" },
                { icon: Calendar,  title: "Meeting Extraction",  desc: "Auto-detect meeting requests", color: "bg-teal-500/20 text-teal-400" },
                { icon: Brain,     title: "Emotion Analysis",    desc: "Understand email sentiment",   color: "bg-pink-500/20 text-pink-400" },
                { icon: BookOpen,  title: "Writing Coach",       desc: "Improve your email skills",    color: "bg-indigo-500/20 text-indigo-400" },
              ].map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${f.color}`}>
                    <f.icon size={18} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── SUPPORT ──────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chatbot Training & Support</h2>
              <p className="text-gray-500 text-sm">Train your AI on your company&apos;s communication style</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {[
              { title: "Custom Training Data", desc: "Upload past email threads to train the AI on your specific style, industry jargon, and preferred tone.", badge: "Pro", badgeColor: "bg-blue-100 text-blue-700", stat: "10,000+ emails processed" },
              { title: "24/7 AI Support",       desc: "Always available to help you draft replies, analyze emails, and suggest improvements in real-time.",       badge: "Always On", badgeColor: "bg-green-100 text-green-700", stat: "99.9% uptime SLA" },
              { title: "Human-in-the-Loop",     desc: "Review and approve AI suggestions before sending. Rate replies to continuously improve accuracy.",         badge: "Smart", badgeColor: "bg-purple-100 text-purple-700", stat: "Improves with every rating" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${item.badgeColor}`}>{item.badge}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                <p className="text-xs text-gray-400 font-medium">{item.stat}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">Need help getting started?</h3>
              <p className="text-blue-100 text-sm mt-1">Support team available Mon–Fri, 9 AM–6 PM IST. Avg response: 2 hours.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button className="bg-white text-blue-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Live Chat</button>
              <button className="border border-white/40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Docs</button>
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────── */}
        <section className="bg-gray-100 py-14 mb-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <DollarSign size={14} /> Simple, transparent pricing
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Choose Your Plan</h2>
              <p className="text-gray-500 mt-2">Start free, upgrade when you need more</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: "Starter", price: "Free", period: "forever", highlight: false,
                  features: ["50 AI replies/month","Basic grammar correction","Email history (30 days)","3 tone options","Community support"],
                  cta: "Get Started", ctaClass: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50" },
                { name: "Professional", price: "₹999", period: "/month", highlight: true,
                  features: ["Unlimited AI replies","All 20 AI features","Spam & phishing detection","Meeting extraction","Priority support","Custom training data","Analytics dashboard"],
                  cta: "Start Free Trial", ctaClass: "bg-blue-600 text-white hover:bg-blue-700" },
                { name: "Enterprise", price: "Custom", period: "pricing", highlight: false,
                  features: ["Everything in Pro","Dedicated AI model","SSO & SAML","SLA guarantee","On-premise deployment","Custom integrations","Dedicated account manager"],
                  cta: "Contact Sales", ctaClass: "border-2 border-purple-300 text-purple-700 hover:bg-purple-50" },
              ].map((plan, i) => (
                <div key={i} className={`bg-white rounded-2xl p-7 relative ${plan.highlight ? "ring-2 ring-blue-500 shadow-xl shadow-blue-100" : "border border-gray-200 shadow-sm"}`}>
                  {plan.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">Most Popular</span>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2 mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={15} className="text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${plan.ctaClass}`}>{plan.cta}</button>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── TECHNOLOGY ───────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Cpu size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Technology & Integrations</h2>
              <p className="text-gray-500 text-sm">Built on cutting-edge AI infrastructure</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: "99.9%", label: "API Uptime", color: "text-blue-600 bg-blue-50" },
              { value: "<200ms", label: "Avg Response", color: "text-purple-600 bg-purple-50" },
              { value: "50+", label: "Languages", color: "text-green-600 bg-green-50" },
              { value: "10M+", label: "Emails Analyzed", color: "text-orange-600 bg-orange-50" },
            ].map((s, i) => (
              <div key={i} className={`rounded-2xl p-6 text-center ${s.color}`}>
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: "Gmail",      status: "Available",   color: "bg-red-50 text-red-700 border-red-100" },
              { name: "Outlook",    status: "Available",   color: "bg-blue-50 text-blue-700 border-blue-100" },
              { name: "REST API",   status: "Available",   color: "bg-green-50 text-green-700 border-green-100" },
              { name: "Webhooks",   status: "Available",   color: "bg-green-50 text-green-700 border-green-100" },
              { name: "Slack",      status: "Coming Soon", color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
              { name: "Salesforce", status: "Coming Soon", color: "bg-orange-50 text-orange-700 border-orange-100" },
              { name: "HubSpot",    status: "Coming Soon", color: "bg-orange-50 text-orange-700 border-orange-100" },
              { name: "Zapier",     status: "Beta",        color: "bg-purple-50 text-purple-700 border-purple-100" },
            ].map((int, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${int.color}`}>
                <span className="font-semibold text-sm">{int.name}</span>
                <span className="text-xs font-medium opacity-80">{int.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECURITY ─────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-14 mb-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                <Lock size={14} /> Enterprise-grade security
              </div>
              <h2 className="text-3xl font-extrabold text-white">Security & Compliance</h2>
              <p className="text-gray-400 mt-2">Your data is protected at every layer</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { icon: Lock,        title: "End-to-End Encryption", desc: "TLS 1.3 in transit · AES-256 at rest",       color: "bg-red-500/20 text-red-400" },
                { icon: Shield,      title: "SOC 2 Type II",          desc: "Independently audited security controls",    color: "bg-blue-500/20 text-blue-400" },
                { icon: CheckCircle, title: "GDPR Compliant",         desc: "Full EU data protection compliance",         color: "bg-green-500/20 text-green-400" },
                { icon: Users,       title: "Role-Based Access",      desc: "Granular permissions · SSO · SAML 2.0",      color: "bg-purple-500/20 text-purple-400" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex gap-5 shrink-0">
                {["ISO 27001","HIPAA","PCI DSS","CCPA"].map((cert, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center mb-1">
                      <CheckCircle size={22} className="text-green-400" />
                    </div>
                    <p className="text-xs font-bold text-white">{cert}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Your data stays yours</h3>
                <p className="text-sm text-gray-400">We never train on your private email data without consent. All processing happens in isolated, encrypted environments. Export or delete your data anytime.</p>
              </div>
            </div>
          </div>
        </section>


        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Star size={22} className="text-yellow-500 fill-yellow-500" /> What Our Users Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: "Priya Sharma",  role: "Customer Success Manager", company: "TechCorp India",  text: "Cut my email response time by 70%. The spam detection alone saved us from 3 phishing attempts this month.", rating: 5 },
              { name: "Rahul Mehta",   role: "Sales Director",           company: "StartupHub",      text: "Tone selection and grammar correction are spot-on. My clients noticed a significant improvement in communication quality.", rating: 5 },
              { name: "Ananya Patel",  role: "HR Manager",               company: "GlobalSoft",      text: "Meeting extraction is a game-changer. It automatically pulls out dates and participants — saves me 30 minutes every day.", rating: 5 },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-gray-700 mb-5 italic leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER HINT ──────────────────────────────────────────────── */}
        <div className="text-center pb-10">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <ChevronDown size={14} /> Scroll to explore more
          </p>
        </div>

      </main>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Zap, Loader2 } from "lucide-react";
import LoginAnimation from "@/components/LoginAnimation";

const DEMO_ID  = "demo@aimail.com";
const DEMO_PWD = "Demo@1234";

export default function LoginPage() {
  const router   = useRouter();
  const setLogin = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState("");
  const [password,   setPassword]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [showAnim,   setShowAnim]   = useState(false);
  const [animUser,   setAnimUser]   = useState("User");
  const [apiDone,    setApiDone]    = useState(false);   // API finished
  const [timerDone,  setTimerDone]  = useState(false);   // 3.5s elapsed

  // Navigate only when BOTH the API has responded AND the minimum time has passed
  useEffect(() => {
    if (apiDone && timerDone) {
      router.push("/home");
    }
  }, [apiDone, timerDone, router]);

  const doLogin = async (id: string, pwd: string) => {
    setApiDone(false);
    setTimerDone(false);
    // Show animation immediately
    setAnimUser(id.split("@")[0] || id);
    setShowAnim(true);
    setLoading(true);

    // Minimum display timer — 3500ms
    const minTimer = setTimeout(() => setTimerDone(true), 3500);

    try {
      const response = await login({ identifier: id, password: pwd });
      setLogin(response.access_token, response.username, response.email, response.user_id);
      setAnimUser(response.username || id);
      setApiDone(true);
    } catch (err: unknown) {
      clearTimeout(minTimer);
      setShowAnim(false);
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? "Login failed. Check your credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // handleAnimDone is a fallback — navigation is driven by the useEffect above
  const handleAnimDone = useCallback(() => {
    if (apiDone) router.push("/home");
  }, [router, apiDone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id  = identifier.trim() || DEMO_ID;
    const pwd = password.trim()   || DEMO_PWD;
    doLogin(id, pwd);
  };

  const handleDemoLogin = () => {
    setIdentifier(DEMO_ID);
    setPassword(DEMO_PWD);
    doLogin(DEMO_ID, DEMO_PWD);
  };

  if (showAnim) {
    return <LoginAnimation username={animUser} onComplete={handleAnimDone} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="card w-full max-w-md shadow-lg">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Email Reply</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Demo banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-800">🚀 Demo Account</p>
              <p className="text-xs text-blue-600 mt-0.5 font-mono">{DEMO_ID}</p>
              <p className="text-xs text-blue-600 font-mono">{DEMO_PWD}</p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "One-Click Login"}
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or enter manually</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Email or Username
              <span className="ml-1 text-xs text-gray-400 font-normal">(leave blank for demo)</span>
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="demo@aimail.com"
              className="input-field"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
              <span className="ml-1 text-xs text-gray-400 font-normal">(leave blank for demo)</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in...
              </>
            ) : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

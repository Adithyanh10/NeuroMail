"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Zap } from "lucide-react";
import LoginAnimation from "@/components/LoginAnimation";

const schema = z.object({
  identifier: z.string().min(3, "Enter your email or username"),
  password:   z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

const DEMO_ID  = "demo@aimail.com";
const DEMO_PWD = "Demo@1234";

export default function LoginPage() {
  const router   = useRouter();
  const setLogin = useAuthStore((s) => s.login);

  const [showAnim, setShowAnim]   = useState(false);
  const [animUser, setAnimUser]   = useState("User");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const doLogin = async (identifier: string, password: string) => {
    const response = await login({ identifier, password });
    // Store user info in auth store
    setLogin(response.access_token, response.username, response.email, response.user_id);
    // Show animation with their name
    setAnimUser(response.username || identifier);
    setShowAnim(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await doLogin(data.identifier, data.password);
    } catch {
      toast.error("Invalid credentials. Check your email/username and password.");
    }
  };

  const handleDemoLogin = async () => {
    setValue("identifier", DEMO_ID);
    setValue("password",   DEMO_PWD);
    try {
      await doLogin(DEMO_ID, DEMO_PWD);
    } catch {
      toast.error("Demo login failed — make sure the backend is running.");
    }
  };

  // Called when animation finishes
  const handleAnimDone = () => {
    router.push("/home");
  };

  return (
    <>
      {/* Login success animation overlay */}
      {showAnim && <LoginAnimation username={animUser} onComplete={handleAnimDone} />}

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
                className="shrink-0 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                One-Click Login
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="demo@aimail.com  or  Demo User"
                className="input-field"
                {...register("identifier")}
              />
              {errors.identifier && (
                <p className="text-red-500 text-xs mt-1" role="alert">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-field"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1" role="alert">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-5 text-center">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

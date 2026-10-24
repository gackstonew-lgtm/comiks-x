"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    searchParams.get("error") || null
  );

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Your email address is not yet confirmed. Please check your inbox.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      if (data.user) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-[#ededed]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-9 h-9 rounded-[8px] bg-brand flex items-center justify-center text-[#09090b] font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            CX
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Comiks X</span>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sign in to your studio</h1>
        <p className="text-xs text-[#a0a0a0] mt-1.5">
          Enter your credentials to access your animation pipeline and universe.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#171717] py-8 px-6 sm:px-8 border border-[#2e2e2e] rounded-[8px] shadow-[0_16px_36px_0_rgba(0,0,0,0.5)] space-y-6">
          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 rounded-[6px] bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-shake"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@studio.com"
                className="w-full h-10 px-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] focus:border-brand/60 focus:ring-1 focus:ring-brand/40 text-xs text-white placeholder-[#707070] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-brand hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-[6px] bg-[#121212] border border-[#2e2e2e] focus:border-brand/60 focus:ring-1 focus:ring-brand/40 text-xs text-white placeholder-[#707070] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#ededed] p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#2e2e2e] text-center text-xs text-[#a0a0a0]">
            Don't have an account yet?{" "}
            <Link href="/signup" className="text-brand font-medium hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-[#707070]">
          <Link href="/" className="hover:text-[#a0a0a0] transition-colors">
            ← Back to Comiks X Overview
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <LoginForm />
    </Suspense>
  );
}

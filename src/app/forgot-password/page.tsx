"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/utils/url";
import { AlertCircle, CheckCircle, ArrowRight, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const siteUrl = getSiteUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${siteUrl}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-[#ededed]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-9 h-9 rounded-[8px] bg-brand flex items-center justify-center text-[#09090b] font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            CX
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Comiks X</span>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reset your password</h1>
        <p className="text-xs text-[#a0a0a0] mt-1.5">
          Enter your email and we'll send a secure password reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#171717] py-8 px-6 sm:px-8 border border-[#2e2e2e] rounded-[8px] shadow-[0_16px_36px_0_rgba(0,0,0,0.5)] space-y-6">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Check your email</h3>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive a password reset link shortly.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-[6px] bg-brand text-[#09090b] font-medium text-xs hover:bg-brand-hover transition-colors inline-block"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
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

              <form onSubmit={handleReset} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
                      <span>Sending reset email...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-[#2e2e2e] text-center text-xs text-[#a0a0a0]">
                Remember your password?{" "}
                <Link href="/login" className="text-brand font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

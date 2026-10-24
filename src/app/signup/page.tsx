"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/utils/url";
import { Sparkles, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, Mail } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successConfirmation, setSuccessConfirmation] = useState(false);

  const supabase = createClient();

  const passwordStrength = (pass: string) => {
    if (!pass) return { score: 0, text: "", color: "" };
    if (pass.length < 8) return { score: 1, text: "Too short (min 8 chars)", color: "text-red-400" };
    const hasNum = /\d/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);
    if (hasNum && hasSpecial) return { score: 3, text: "Strong password", color: "text-brand" };
    return { score: 2, text: "Medium (add numbers or symbols)", color: "text-amber-400" };
  };

  const strength = passwordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const siteUrl = getSiteUrl();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setErrorMessage("An account with this email already exists. Try signing in.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      // Check if session was created immediately (auto-confirm on) or if email confirmation is required
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else if (data.user) {
        setSuccessConfirmation(true);
      }
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  if (successConfirmation) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-[#ededed]">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto mb-4">
            <Mail className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
          <p className="text-xs text-[#a0a0a0] mt-2 max-w-sm mx-auto leading-relaxed">
            We sent a verification link to <strong className="text-white font-medium">{email}</strong>.
            Click the link in your inbox to confirm your account and access the studio.
          </p>

          <div className="mt-8 bg-[#171717] p-6 border border-[#2e2e2e] rounded-[8px] space-y-4 text-xs">
            <p className="text-[#a0a0a0]">
              Already verified or didn't receive an email?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/login"
                className="px-4 py-2 rounded-[6px] bg-brand text-[#09090b] font-medium text-xs hover:bg-brand-hover transition-colors inline-block"
              >
                Go to Sign In
              </Link>
              <button
                onClick={() => setSuccessConfirmation(false)}
                className="px-4 py-2 rounded-[6px] bg-[#1c1c1c] text-[#a0a0a0] hover:text-white border border-[#2e2e2e] transition-colors"
              >
                Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your studio account</h1>
        <p className="text-xs text-[#a0a0a0] mt-1.5">
          Start producing 30-minute animated episodes and viral 9:16 social clips.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#171717] py-8 px-6 sm:px-8 border border-[#2e2e2e] rounded-[8px] shadow-[0_16px_36px_0_rgba(0,0,0,0.5)] space-y-5">
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label htmlFor="fullname" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Full Name / Creator Alias
              </label>
              <input
                id="fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Otieno"
                className="w-full h-10 px-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] focus:border-brand/60 focus:ring-1 focus:ring-brand/40 text-xs text-white placeholder-[#707070] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Work or Studio Email
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
                {password && (
                  <span className={`text-[11px] font-medium ${strength.color}`}>
                    {strength.text}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-10 px-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] focus:border-brand/60 focus:ring-1 focus:ring-brand/40 text-xs text-white placeholder-[#707070] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
                  <span>Creating studio account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#2e2e2e] text-center text-xs text-[#a0a0a0]">
            Already have an account?{" "}
            <Link href="/login" className="text-brand font-medium hover:underline">
              Sign in
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

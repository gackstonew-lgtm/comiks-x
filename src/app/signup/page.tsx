"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    if (loading) return;

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
      const cleanEmail = email.trim().toLowerCase();

      // 1. Create confirmed user via server-only route handler using SUPABASE_SERVICE_ROLE_KEY
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: cleanEmail,
          password,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setErrorMessage(result.error || "An error occurred during account creation.");
        setLoading(false);
        return;
      }

      // 2. Immediately sign in with password with the browser client (account is already confirmed)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        // Account was created successfully; fallback redirect to sign-in with notice
        router.push(`/login?email=${encodeURIComponent(cleanEmail)}`);
        return;
      }

      // 3. User is signed in immediately; redirect straight to studio dashboard
      if (signInData.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Unable to connect to authentication server. Please check your network connection.");
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Create your studio account</h1>
        <p className="text-xs text-[#a0a0a0] mt-1.5">
          Start producing animated episodes and viral 9:16 social clips immediately.
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
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Brian Otieno"
                disabled={loading}
                className="w-full h-10 px-3 bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] text-xs text-[#ededed] placeholder-[#666] outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@studio.com"
                disabled={loading}
                className="w-full h-10 px-3 bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] text-xs text-[#ededed] placeholder-[#666] outline-none transition-colors disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  disabled={loading}
                  className="w-full h-10 pl-3 pr-10 bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] text-xs text-[#ededed] placeholder-[#666] outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#ededed] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password && (
                <div className="mt-1.5 flex items-center justify-between text-[11px]">
                  <span className={strength.color}>{strength.text}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`w-6 h-1 rounded-full ${
                          strength.score >= lvl
                            ? strength.score === 1
                              ? "bg-red-400"
                              : strength.score === 2
                              ? "bg-amber-400"
                              : "bg-brand"
                            : "bg-[#252525]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                disabled={loading}
                className="w-full h-10 px-3 bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] text-xs text-[#ededed] placeholder-[#666] outline-none transition-colors disabled:opacity-50"
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

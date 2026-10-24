"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage("Please enter a new password.");
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
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch {
      setErrorMessage("Failed to update password. Link may have expired.");
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
        <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
        <p className="text-xs text-[#a0a0a0] mt-1.5">
          Enter your new password below to regain access to your studio.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#171717] py-8 px-6 sm:px-8 border border-[#2e2e2e] rounded-[8px] shadow-[0_16px_36px_0_rgba(0,0,0,0.5)] space-y-6">
          {success ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Password Updated!</h3>
              <p className="text-xs text-[#a0a0a0]">Redirecting to your studio dashboard...</p>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="p-3 rounded-[6px] bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
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
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full h-10 px-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] focus:border-brand/60 focus:ring-1 focus:ring-brand/40 text-xs text-white placeholder-[#707070] focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Password & Continue"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

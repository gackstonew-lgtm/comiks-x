"use client";

import { Aperture } from "lucide-react";

interface BrandedSplashProps {
  message?: string;
}

export function BrandedSplash({ message = "Initializing Comiks X Studio..." }: BrandedSplashProps) {
  return (
    <div
      aria-label="Loading Studio"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] text-white select-none transition-opacity duration-300"
    >
      {/* Brand Icon with Glow */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-20 h-20 rounded-full bg-brand/20 blur-xl animate-pulse" />
        <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center text-[#09090b] font-black text-2xl shadow-xl shadow-brand/25 relative z-10 animate-bounce duration-1000">
          CX
        </div>
      </div>

      {/* Title & Spinner */}
      <h1 className="text-base font-bold tracking-tight text-white mb-2 flex items-center gap-2">
        <span>Comiks X</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c1c1c] text-brand border border-brand/25">
          PRO
        </span>
      </h1>

      <div className="flex items-center gap-2 text-xs text-[#a0a0a0]">
        <Aperture className="w-3.5 h-3.5 text-brand animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}

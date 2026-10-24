"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clapperboard,
  ImagePlus,
  FileText,
  Zap,
  ArrowRight,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";

export function StudioOnboardingModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("cx_onboarding_completed");
      if (!completed) {
        setIsOpen(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cx_onboarding_completed", "true");
    }
    setIsOpen(false);
  };

  const handleFinish = () => {
    handleDismiss();
    router.push("/video-generator?new=true");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-lg bg-[#171717] border border-[#2e2e2e] rounded-[10px] p-6 space-y-6 shadow-[0_24px_48px_rgba(0,0,0,0.8)] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-brand flex items-center justify-center text-[#09090b] font-black">
              CX
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Welcome to Comiks X Studio</h3>
              <p className="text-[11px] text-[#707070]">3-Step Quickstart to Your First Animated Short</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded text-[#707070] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Indicator */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, title: "1. References", desc: "Upload DNA" },
            { num: 2, title: "2. Guidelines", desc: "Set Rules" },
            { num: 3, title: "3. First Video", desc: "Generate" },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setStep(s.num as any)}
              className={`p-2.5 rounded-[6px] border cursor-pointer transition-all ${
                step === s.num
                  ? "border-brand bg-brand/10 text-white"
                  : step > s.num
                  ? "border-[#2e2e2e] bg-[#121212] text-emerald-400"
                  : "border-[#222] bg-[#121212] text-[#707070]"
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>{s.title}</span>
                {step > s.num && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="text-[10px] text-[#707070] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4 min-h-[140px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-2 p-4 rounded-[6px] bg-[#121212] border border-[#252525]">
              <div className="flex items-center gap-2 text-brand font-bold text-xs">
                <ImagePlus className="w-4 h-4" />
                <span>Step 1: Upload Reference Media</span>
              </div>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Add your character sketches, wardrobe photos, or product mood boards to the private Reference
                Library. The app will condition every video shot with these references.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 p-4 rounded-[6px] bg-[#121212] border border-[#252525]">
              <div className="flex items-center gap-2 text-brand font-bold text-xs">
                <FileText className="w-4 h-4" />
                <span>Step 2: Set Studio Guidelines</span>
              </div>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Define your brand voice, camera preferences, and negative guardrails (e.g. &apos;No photorealistic 3D,
                keep authentic Nairobi cel shading&apos;). The Studio Memory engine applies this automatically.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2 p-4 rounded-[6px] bg-[#121212] border border-[#252525]">
              <div className="flex items-center gap-2 text-brand font-bold text-xs">
                <Clapperboard className="w-4 h-4" />
                <span>Step 3: Create Your First Video</span>
              </div>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Enter a brief. The system will partition your script into 5-second scenes, generate keyframes for
                your approval, and render high-impact 9:16 vertical clips.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#2e2e2e]">
          <button
            onClick={handleDismiss}
            className="text-[11px] text-[#707070] hover:text-white transition-colors"
          >
            Skip Onboarding
          </button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-bold transition-all shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 px-5 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-black transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Start Video Generator</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

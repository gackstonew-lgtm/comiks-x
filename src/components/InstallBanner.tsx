"use client";

import { useState, useEffect } from "react";
import { Download, X, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const STORAGE_KEY = "cx_pwa_install_dismissed_until";
const DISMISSAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if already running standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed within the last 7 days
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) &&
      !(window.navigator as any).standalone &&
      !(window as any).MSStream;

    if (isIosDevice) {
      // Check if Safari
      const isSafari = userAgent.includes("safari") && !userAgent.includes("crios") && !userAgent.includes("fxios");
      if (isSafari) {
        setIsIos(true);
        setIsVisible(true);
      }
      return;
    }

    // 4. Standard Chromium/Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsVisible(false);
      }
    } catch (err) {
      console.warn("[PWA] Error launching install prompt:", err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISSAL_DURATION_MS));
    } catch {
      // Ignore localStorage write errors in private browsing
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Install Comiks X Application"
      className="fixed z-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom, 1rem))",
        left: "max(1rem, env(safe-area-inset-left, 1rem))",
      }}
    >
      <div className="w-[calc(100vw-2rem)] sm:w-88 md:w-96 rounded-xl bg-[#171717]/95 backdrop-blur-md border border-[#2e2e2e] shadow-[0_20px_40px_rgba(0,0,0,0.6)] p-3.5 text-white">
        <div className="flex items-start justify-between gap-3">
          {/* App Icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-[#09090b] font-black text-sm shrink-0 shadow-md shadow-emerald-500/20">
              CX
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Install Comiks X
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  App
                </span>
              </h2>
              <p className="text-xs text-[#a0a0a0] leading-snug mt-0.5">
                Fast, full-screen studio with offline access
              </p>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="p-1 rounded-md text-[#707070] hover:text-white hover:bg-[#232323] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Row */}
        <div className="mt-3 pt-2.5 border-t border-[#262626]">
          {isIos ? (
            /* iOS Safari Instructions */
            <div className="flex items-center gap-2 text-xs text-[#b5b5b5] bg-[#121212] px-3 py-2 rounded-lg border border-[#242424]">
              <span>Tap</span>
              <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 inline" />
              <span>Share, then</span>
              <span className="font-semibold text-white inline-flex items-center gap-1">
                <PlusSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Add to Home Screen
              </span>
            </div>
          ) : (
            /* Chromium / Android One-Tap Install */
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8e8e8e] hover:text-white hover:bg-[#232323] transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstallClick}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#09090b] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Install
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

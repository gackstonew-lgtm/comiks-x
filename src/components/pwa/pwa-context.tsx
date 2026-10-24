"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PwaContextType {
  isOnline: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  isIosSafari: boolean;
  hasUpdate: boolean;
  isInstallBannerVisible: boolean;
  promptInstall: () => Promise<void>;
  applyUpdate: () => void;
  dismissInstallBanner: () => void;
  dismissUpdateToast: () => void;
  clearAppCaches: () => Promise<void>;
}

const PwaContext = createContext<PwaContextType | null>(null);

const STORAGE_KEY = "comiks_pwa_dismissed_until";
const DISMISSAL_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isInstallBannerVisible, setIsInstallBannerVisible] = useState(false);

  // Clear all caches on logout or manual reset
  const clearAppCaches = useCallback(async () => {
    if (typeof window !== "undefined" && "caches" in window) {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        console.log("[PWA] Successfully purged app cache storage");
      } catch (err) {
        console.warn("[PWA] Cache purge error:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initial connectivity state
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Standalone detection (PWA installed & running as standalone app)
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(standalone);
      return standalone;
    };

    const standalone = checkStandalone();

    // 3. iOS Safari detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos =
      /iphone|ipad|ipod/.test(userAgent) &&
      !(window.navigator as any).standalone &&
      !(window as any).MSStream;
    const isSafari =
      isIos &&
      userAgent.includes("safari") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("fxios");

    if (isSafari && !standalone) {
      setIsIosSafari(true);
    }

    // 4. Capture beforeinstallprompt for Chromium/Edge/Android
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      console.log("[PWA] Captured beforeinstallprompt event");
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check 14-day dismissal window before showing banner
      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        // Delay showing banner by 4 seconds so creator experiences the app first
        const timer = setTimeout(() => {
          setIsInstallBannerVisible(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    };

    // 5. Handle appinstalled event
    const handleAppInstalled = () => {
      console.log("[PWA] Application successfully installed by user");
      setIsStandalone(true);
      setDeferredPrompt(null);
      setIsInstallBannerVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    // If iOS Safari and not standalone, also check 14-day dismissal for instruction banner
    if (isSafari && !standalone) {
      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        const timer = setTimeout(() => {
          setIsInstallBannerVisible(true);
        }, 4000);
        return () => clearTimeout(timer);
      }
    }

    // 6. Service Worker Registration & Update Flow (Production only)
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log("[PWA] Service Worker registered with scope:", registration.scope);

            // If a worker is already waiting to activate
            if (registration.waiting) {
              setWaitingWorker(registration.waiting);
              setHasUpdate(true);
            }

            // Listen for new worker updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log("[PWA] New version ready for activation");
                    setWaitingWorker(installingWorker);
                    setHasUpdate(true);
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // One-click install trigger
  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log("[PWA] User prompt response:", choice.outcome);
        if (choice.outcome === "accepted") {
          setIsInstallBannerVisible(false);
        }
      } catch (err) {
        console.warn("[PWA] Error launching prompt:", err);
      } finally {
        setDeferredPrompt(null);
      }
    } else if (isIosSafari) {
      // For iOS Safari, re-open install banner with steps
      setIsInstallBannerVisible(true);
    }
  }, [deferredPrompt, isIosSafari]);

  // Apply update via SKIP_WAITING
  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }, [waitingWorker]);

  // Dismiss install banner for 14 days
  const dismissInstallBanner = useCallback(() => {
    setIsInstallBannerVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISSAL_DURATION_MS));
    } catch {
      // Ignore private mode write restrictions
    }
  }, []);

  const dismissUpdateToast = useCallback(() => {
    setHasUpdate(false);
  }, []);

  const canInstall = !isStandalone && (Boolean(deferredPrompt) || isIosSafari);

  return (
    <PwaContext.Provider
      value={{
        isOnline,
        isStandalone,
        canInstall,
        isIosSafari,
        hasUpdate,
        isInstallBannerVisible,
        promptInstall,
        applyUpdate,
        dismissInstallBanner,
        dismissUpdateToast,
        clearAppCaches,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error("usePwa must be used within a PwaProvider");
  }
  return context;
}

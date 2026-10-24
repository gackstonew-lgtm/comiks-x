"use client";

import { usePwa } from "./pwa-context";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const { isOnline } = usePwa();

  if (isOnline) return null;

  return (
    <aside
      aria-label="Offline Mode Active"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>
        You are currently working offline. Cached features are available; AI generations and video renders will resume when reconnected.
      </span>
    </aside>
  );
}

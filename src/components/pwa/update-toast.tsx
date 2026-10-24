"use client";

import { usePwa } from "./pwa-context";
import { RotateCw, X, Zap } from "lucide-react";

export function UpdateToast() {
  const { hasUpdate, applyUpdate, dismissUpdateToast } = usePwa();

  if (!hasUpdate) return null;

  return (
    <aside
      aria-label="Application Update Notice"
      className="fixed z-50 bottom-5 right-5 max-w-sm w-[calc(100vw-2.5rem)] bg-[#171717] border border-brand/40 shadow-2xl rounded-xl p-3.5 text-white animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
            <Zap className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">Studio Update Available</h3>
            <p className="text-[11px] text-[#a0a0a0] leading-tight mt-0.5">
              A newer version of Comiks X is ready.
            </p>
          </div>
        </div>

        <button
          onClick={dismissUpdateToast}
          aria-label="Dismiss update notification"
          className="text-[#707070] hover:text-white p-1 rounded-md transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-[#262626]">
        <button
          onClick={dismissUpdateToast}
          className="px-2.5 py-1 text-xs text-[#8e8e8e] hover:text-white transition-colors"
        >
          Later
        </button>
        <button
          onClick={applyUpdate}
          className="px-3 py-1 rounded-md bg-brand hover:bg-brand-hover text-[#09090b] font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand/20 active:scale-95 transition-all"
        >
          <RotateCw className="w-3 h-3" />
          Refresh & Update
        </button>
      </div>
    </aside>
  );
}

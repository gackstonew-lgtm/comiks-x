"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle,
  Server,
  Save,
  Lock,
  Download,
  Trash2,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import { usePwa } from "@/components/pwa/pwa-context";

export default function SettingsPage() {
  const { isStandalone, canInstall, promptInstall, clearAppCaches } = usePwa();
  const [cacheCleared, setCacheCleared] = useState(false);
  const [settings, setSettings] = useState<any | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [activeProvider, setActiveProvider] = useState("luma");
  const [lumaKey, setLumaKey] = useState("");
  const [runwayKey, setRunwayKey] = useState("");
  const [klingKey, setKlingKey] = useState("");
  const [falKey, setFalKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [elevenlabsKey, setElevenlabsKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [dailyBudget, setDailyBudget] = useState(50);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setProviders(data.providers);
        setActiveProvider(data.settings.activeProvider || "luma");
        setDailyBudget(data.settings.dailyBudgetLimitUsd || 50);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);

    const payload: Record<string, any> = {
      activeProvider,
      dailyBudgetLimitUsd: dailyBudget,
    };
    if (lumaKey) payload.lumaApiKey = lumaKey;
    if (runwayKey) payload.runwayApiKey = runwayKey;
    if (klingKey) payload.klingApiKey = klingKey;
    if (falKey) payload.falApiKey = falKey;
    if (openaiKey) payload.openaiApiKey = openaiKey;
    if (elevenlabsKey) payload.elevenlabsApiKey = elevenlabsKey;
    if (geminiKey) payload.geminiApiKey = geminiKey;

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("Provider configuration securely saved.");
        await fetchSettings();
        setLumaKey("");
        setRunwayKey("");
        setKlingKey("");
        setFalKey("");
        setOpenaiKey("");
        setElevenlabsKey("");
        setGeminiKey("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Provider Independence & Vault
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#ededed] tracking-tight">
            AI Providers & Studio Settings
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1 max-w-2xl leading-relaxed">
            Switch video generation engines without rewriting application code. All API keys are securely stored server-side and never exposed to client browsers.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/25 text-brand text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Active Provider Cards */}
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-brand" />
              Active AI Video Provider
            </h3>
            <span className="text-xs text-[#707070]">Select default engine for scene rendering</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {providers.map((p) => {
              const isSelected = activeProvider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProvider(p.id)}
                  className={`p-3.5 rounded-[6px] border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#1c1c1c] border-brand shadow-[0_0_0_1px_rgba(62,207,142,0.3)] text-white"
                      : "bg-[#121212] border-[#2e2e2e] text-[#a0a0a0] hover:border-[#3e3e3e] hover:bg-[#171717]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#ededed]">{p.name}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-brand" />}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        p.isConfigured ? "bg-brand" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-[10px] text-[#a0a0a0]">
                      {p.isConfigured ? "Key Configured" : "Key Needed"}
                    </span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#2e2e2e] text-[9px] text-[#707070] space-y-0.5">
                    <div>✓ Text-to-Video</div>
                    <div>✓ Image-to-Video</div>
                    <div>✓ Scene Regeneration</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API Credentials Vault */}
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
            <div>
              <h3 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand" />
                API Credentials Vault
              </h3>
              <p className="text-xs text-[#707070] mt-0.5">
                Saved in server environment. Leave blank to preserve currently stored credentials.
              </p>
            </div>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/25">
              Server-Side Vault
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Luma */}
            <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#ededed]">Luma Dream Machine API Key</label>
                {settings?.hasLumaKey && (
                  <span className="text-[10px] text-brand font-mono font-medium">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={lumaKey}
                onChange={(e) => setLumaKey(e.target.value)}
                placeholder={settings?.hasLumaKey ? "••••••••••••••••••••••••" : "luma-api-key..."}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 font-mono transition-all"
              />
            </div>

            {/* Runway */}
            <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#ededed]">Runway Gen-3 API Key</label>
                {settings?.hasRunwayKey && (
                  <span className="text-[10px] text-brand font-mono font-medium">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={runwayKey}
                onChange={(e) => setRunwayKey(e.target.value)}
                placeholder={settings?.hasRunwayKey ? "••••••••••••••••••••••••" : "runway-key..."}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 font-mono transition-all"
              />
            </div>

            {/* Kling */}
            <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#ededed]">Kling AI Video Key</label>
                {settings?.hasKlingKey && (
                  <span className="text-[10px] text-brand font-mono font-medium">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={klingKey}
                onChange={(e) => setKlingKey(e.target.value)}
                placeholder={settings?.hasKlingKey ? "••••••••••••••••••••••••" : "kling-key..."}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 font-mono transition-all"
              />
            </div>

            {/* Fal.ai */}
            <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#ededed]">Fal.ai API Key (FAL_KEY)</label>
                {settings?.hasFalKey && (
                  <span className="text-[10px] text-brand font-mono font-medium">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                placeholder={settings?.hasFalKey ? "••••••••••••••••••••••••" : "fal-key..."}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 font-mono transition-all"
              />
            </div>

            {/* ElevenLabs */}
            <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#ededed]">ElevenLabs API Key (Speech)</label>
                {settings?.hasElevenlabsKey && (
                  <span className="text-[10px] text-brand font-mono font-medium">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                placeholder={settings?.hasElevenlabsKey ? "••••••••••••••••••••••••" : "xi-api-key..."}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 font-mono transition-all"
              />
            </div>

            {/* Gemini */}
            <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#ededed]">Gemini API Key (Story LLM)</label>
                {settings?.hasGeminiKey && (
                  <span className="text-[10px] text-brand font-mono font-medium">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings?.hasGeminiKey ? "••••••••••••••••••••••••" : "gemini-api-key..."}
                className="w-full bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] placeholder-[#707070] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* Budget Guardrail */}
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider">
              Daily Cost Guardrail
            </h3>
            <p className="text-xs text-[#707070] mt-0.5">
              Halts scene generations if daily spend exceeds this threshold to prevent accidental billing spikes.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-[#707070]">$</span>
            <input
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Number(e.target.value))}
              className="w-24 bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-2.5 py-1 text-xs text-[#ededed] font-mono focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
            />
            <span className="text-xs text-[#a0a0a0]">USD / day</span>
          </div>
        </div>

        {/* Progressive Web App & Offline Storage */}
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-brand">
                <Smartphone className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider">
                  Progressive Web App & Offline Cache
                </h3>
                <p className="text-xs text-[#707070] mt-0.5">
                  Install the studio natively on Windows, macOS, Android, or iOS for full-screen performance.
                </p>
              </div>
            </div>

            {isStandalone ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-brand/10 border border-brand/25 text-brand text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Standalone Mode Active
              </span>
            ) : canInstall ? (
              <button
                type="button"
                onClick={promptInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-bold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Install Studio App
              </button>
            ) : (
              <span className="text-xs text-[#707070]">Browser Managed</span>
            )}
          </div>

          <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#ededed]">Studio Cache Storage</p>
              <p className="text-[11px] text-[#707070]">
                Purge cached app shell and static resources if experiencing stale UI states.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await clearAppCaches();
                setCacheCleared(true);
                setTimeout(() => setCacheCleared(false), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#121212] hover:bg-[#202020] border border-[#2e2e2e] text-[#ededed] text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#a0a0a0]" />
              <span>{cacheCleared ? "Cache Cleared!" : "Clear Cache"}</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-sm transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Sliders,
  ShieldCheck,
  Key,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Server,
  Save,
  Radio,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
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
        // Clear plain text inputs after saving for security
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
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-comic-yellow mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Provider Independence & API Vault
          </div>
          <h1 className="text-3xl font-black text-white">AI Providers & Studio Settings</h1>
          <p className="text-xs text-studio-400 mt-1 max-w-2xl">
            Switch video generation engines without rewriting code. All API keys are securely stored server-side and never exposed to client browsers.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {/* Form Settings */}
      <form onSubmit={handleSave} className="space-y-8">
        {/* Active Video Engine Selector Cards */}
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-comic-yellow" />
              Active AI Video Provider
            </h3>
            <span className="text-xs text-studio-400">Select default engine for scene rendering</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {providers.map((p) => {
              const isSelected = activeProvider === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveProvider(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-amber-500/10 border-comic-yellow text-white shadow-md shadow-amber-500/10"
                      : "bg-studio-950 border-studio-800 text-studio-400 hover:border-studio-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{p.name}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-comic-yellow" />}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.isConfigured ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    ></span>
                    <span className="text-[10px] font-semibold text-studio-400">
                      {p.isConfigured ? "API Key Configured" : "Key Needed"}
                    </span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-studio-800/80 text-[9px] text-studio-500 space-y-0.5">
                    <div>✓ Text-to-Video</div>
                    <div>✓ Image-to-Video</div>
                    <div>✓ Scene Regeneration</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Server-Side API Keys Configuration */}
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-studio-800">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                API Credentials Vault
              </h3>
              <p className="text-xs text-studio-400 mt-0.5">
                Saved in server environment. Leave blank to preserve currently stored credentials.
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              End-to-End Server-Side Security
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Luma Dream Machine */}
            <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Luma Dream Machine API Key</label>
                {settings?.hasLumaKey && (
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={lumaKey}
                onChange={(e) => setLumaKey(e.target.value)}
                placeholder={settings?.hasLumaKey ? "••••••••••••••••••••••••" : "luma-api-key..."}
                className="w-full bg-studio-900 border border-studio-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow font-mono"
              />
            </div>

            {/* Runway */}
            <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Runway Gen-3 API Key</label>
                {settings?.hasRunwayKey && (
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={runwayKey}
                onChange={(e) => setRunwayKey(e.target.value)}
                placeholder={settings?.hasRunwayKey ? "••••••••••••••••••••••••" : "runway-key..."}
                className="w-full bg-studio-900 border border-studio-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow font-mono"
              />
            </div>

            {/* Kling AI */}
            <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Kling AI Video Key</label>
                {settings?.hasKlingKey && (
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={klingKey}
                onChange={(e) => setKlingKey(e.target.value)}
                placeholder={settings?.hasKlingKey ? "••••••••••••••••••••••••" : "kling-key..."}
                className="w-full bg-studio-900 border border-studio-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow font-mono"
              />
            </div>

            {/* Fal.ai */}
            <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Fal.ai API Key (FAL_KEY)</label>
                {settings?.hasFalKey && (
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={falKey}
                onChange={(e) => setFalKey(e.target.value)}
                placeholder={settings?.hasFalKey ? "••••••••••••••••••••••••" : "fal-key..."}
                className="w-full bg-studio-900 border border-studio-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow font-mono"
              />
            </div>

            {/* ElevenLabs for Voice */}
            <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">ElevenLabs API Key (Character Speech)</label>
                {settings?.hasElevenlabsKey && (
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                placeholder={settings?.hasElevenlabsKey ? "••••••••••••••••••••••••" : "xi-api-key..."}
                className="w-full bg-studio-900 border border-studio-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow font-mono"
              />
            </div>

            {/* Gemini API Key */}
            <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white">Gemini API Key (Story & Script LLM)</label>
                {settings?.hasGeminiKey && (
                  <span className="text-[9px] text-emerald-400 font-bold">✓ Stored</span>
                )}
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings?.hasGeminiKey ? "••••••••••••••••••••••••" : "gemini-api-key..."}
                className="w-full bg-studio-900 border border-studio-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow font-mono"
              />
            </div>
          </div>
        </div>

        {/* Budget & Daily Cap */}
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-white">Daily Cost Guardrail</h3>
            <p className="text-xs text-studio-400 mt-0.5">
              Halts scene generations if daily spend exceeds this threshold to prevent accidental billing spikes.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-studio-400">$</span>
            <input
              type="number"
              value={dailyBudget}
              onChange={(e) => setDailyBudget(Number(e.target.value))}
              className="w-24 bg-studio-950 border border-studio-800 rounded-xl px-3 py-1.5 text-xs text-white font-bold"
            />
            <span className="text-xs text-studio-400 font-medium">USD / day</span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-102 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving Configuration..." : "Save Settings & Provider Selection"}
          </button>
        </div>
      </form>
    </div>
  );
}

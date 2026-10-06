"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ComicSeries, Episode } from "@/types";
import {
  Sparkles,
  BookOpen,
  Film,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Sliders,
  AlignLeft,
} from "lucide-react";

export default function StoryCreatorPage() {
  const router = useRouter();
  const [seriesList, setSeriesList] = useState<ComicSeries[]>([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>("");
  const [mode, setMode] = useState<"idea" | "script" | "outline">("idea");
  const [promptContent, setPromptContent] = useState(
    "A young Kenyan developer gets his first big client but everything goes wrong: a dead laptop battery, an unruly matatu ride through Nairobi traffic, and an escalating race against time."
  );
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEpisode, setGeneratedEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.length > 0) {
          setSeriesList(data.data);
          setSelectedSeriesId(data.data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptContent.trim() || !selectedSeriesId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: selectedSeriesId,
          mode,
          promptContent,
          targetDurationMinutes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedEpisode(data.data);
      } else {
        setError(data.error || "Failed to generate structured episode");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUsePreset = (presetText: string) => {
    setPromptContent(presetText);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-studio-800">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-comic-purple mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          AI Story & Script Decomposition Engine
        </div>
        <h1 className="text-3xl font-black text-white">Story Creator & 30-Minute Architecture</h1>
        <p className="text-xs text-studio-400 mt-1 max-w-2xl">
          Transform a short idea, outline, or full script into a professional ~30-minute animated episode. The system automatically structures acts, chapters, and independent 5–30s AI video scenes.
        </p>
      </div>

      {/* Input Workspace Form */}
      <form onSubmit={handleGenerate} className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-studio-300 uppercase">Input Mode:</span>
            <div className="inline-flex rounded-xl bg-studio-950 p-1 border border-studio-800">
              <button
                type="button"
                onClick={() => setMode("idea")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  mode === "idea" ? "bg-comic-yellow text-studio-950" : "text-studio-400 hover:text-white"
                }`}
              >
                A. Short Idea
              </button>
              <button
                type="button"
                onClick={() => setMode("script")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  mode === "script" ? "bg-comic-yellow text-studio-950" : "text-studio-400 hover:text-white"
                }`}
              >
                B. Full Script
              </button>
              <button
                type="button"
                onClick={() => setMode("outline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  mode === "outline" ? "bg-comic-yellow text-studio-950" : "text-studio-400 hover:text-white"
                }`}
              >
                C. Episode Outline
              </button>
            </div>
          </div>

          {/* Series Picker */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-studio-300 uppercase">Target Series:</span>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="bg-studio-950 border border-studio-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-comic-yellow"
            >
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.artStyle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Idea Presets */}
        <div>
          <span className="text-[11px] font-bold text-studio-400 uppercase tracking-wider block mb-2">
            Quick Idea Starters (Click to load):
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              "A young Kenyan developer gets his first big client but everything goes wrong.",
              "Kevo borrows an expensive video camera for a Nairobi TikTok shoot and accidentally leaves it in a matatu.",
              "Mary's fintech company gets hacked by a mysterious rival and Brian has to solve it during an Eastlands blackout.",
              "An eccentric billionaire arrives in Nairobi offering 10M KES to whoever creates the most viral comic episode.",
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUsePreset(preset)}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-studio-950 border border-studio-800 text-studio-300 hover:border-comic-yellow/50 hover:text-white transition-all text-left truncate max-w-md"
              >
                "{preset}"
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Area */}
        <div>
          <label className="block text-xs font-bold text-studio-300 uppercase mb-1">
            Story / Script / Outline Content
          </label>
          <textarea
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
            rows={5}
            placeholder="Type your story idea, dialogue script, or episode premise here..."
            className="w-full bg-studio-950 border border-studio-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-comic-yellow leading-relaxed"
          />
        </div>

        {/* Target Runtime Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-studio-950 border border-studio-800">
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-comic-yellow" />
              Target Episode Duration: <span className="text-comic-yellow">{targetDurationMinutes} Minutes</span>
            </div>
            <div className="text-[11px] text-studio-400 mt-0.5">
              Automatically split into ~{Math.round(targetDurationMinutes * 2.5)} continuous 5–25 second scenes for safe AI video generation.
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[10, 15, 30].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setTargetDurationMinutes(mins)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  targetDurationMinutes === mins
                    ? "bg-amber-500/10 border-comic-yellow text-comic-yellow"
                    : "bg-studio-900 border-studio-800 text-studio-400 hover:border-studio-700"
                }`}
              >
                {mins}m Episode
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-102 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            {isGenerating ? "Decomposing 30-Min Story Structure..." : "Transform into Structured Episode"}
          </button>
        </div>
      </form>

      {/* Generated Episode Structure Display */}
      {generatedEpisode && (
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-800">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase mb-1">
                <CheckCircle className="w-3 h-3" />
                Structured Episode Ready
              </div>
              <h2 className="text-2xl font-black text-white">{generatedEpisode.title}</h2>
              <p className="text-xs text-studio-300 mt-1">{generatedEpisode.logline}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/storyboard/${generatedEpisode.id}`)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-102 transition-all"
              >
                <Layers className="w-4 h-4" />
                Open in Storyboard ({generatedEpisode.scenes.length} Scenes) →
              </button>
            </div>
          </div>

          {/* Three-Act Structure Cards */}
          <div>
            <h4 className="text-xs font-bold text-studio-300 uppercase tracking-wider mb-3">
              Three-Act Narrative Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800">
                <span className="text-[10px] font-bold uppercase text-comic-yellow block mb-1">Act 1: Beginning & Inciting Incident</span>
                <p className="text-studio-300 leading-relaxed">{generatedEpisode.threeActStructure.beginning}</p>
                <div className="mt-3 pt-2 border-t border-studio-800 text-studio-400">
                  <strong className="text-white">Conflict:</strong> {generatedEpisode.threeActStructure.conflict}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800">
                <span className="text-[10px] font-bold uppercase text-comic-cyan block mb-1">Act 2: Escalation & Chaos</span>
                <p className="text-studio-300 leading-relaxed">{generatedEpisode.threeActStructure.escalation}</p>
                <div className="mt-3 pt-2 border-t border-studio-800 text-studio-400">
                  <strong className="text-white">Climax:</strong> {generatedEpisode.threeActStructure.climax}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800">
                <span className="text-[10px] font-bold uppercase text-comic-purple block mb-1">Act 3: Resolution & Ending Hook</span>
                <p className="text-studio-300 leading-relaxed">{generatedEpisode.threeActStructure.resolution}</p>
                <div className="mt-3 pt-2 border-t border-studio-800 text-comic-yellow font-medium">
                  <strong>Hook:</strong> {generatedEpisode.threeActStructure.endingHook}
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Generated Chapters Preview */}
          <div>
            <h4 className="text-xs font-bold text-studio-300 uppercase tracking-wider mb-3">
              Episode Chapters ({generatedEpisode.chapters.length})
            </h4>
            <div className="space-y-2">
              {generatedEpisode.chapters.map((ch) => (
                <div
                  key={ch.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-studio-950 border border-studio-800 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-comic-yellow font-bold bg-studio-900 px-2 py-0.5 rounded border border-studio-800">
                      {ch.timecode}
                    </span>
                    <span className="font-bold text-white">{ch.title}</span>
                  </div>
                  <span className="text-studio-400 text-[11px] truncate max-w-md">{ch.summary}</span>
                </div>
              ))}
            </div>
          </div>

          {/* First Few Scenes Quick Glance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-studio-300 uppercase tracking-wider">
                Scene Breakdown Preview ({generatedEpisode.scenes.length} independent scenes)
              </h4>
              <span className="text-xs text-comic-yellow">Average scene duration: 12-18 seconds</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedEpisode.scenes.slice(0, 4).map((s) => (
                <div key={s.id} className="p-3 rounded-xl bg-studio-950 border border-studio-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-comic-yellow">Scene {s.sceneNumber}</span>
                    <span className="text-studio-400 font-mono">{s.duration}s • {s.cameraAngle}</span>
                  </div>
                  <p className="text-xs text-studio-200 line-clamp-2">{s.action}</p>
                  {s.dialogue?.[0] && (
                    <div className="text-[11px] text-studio-400 bg-studio-900 p-2 rounded border border-studio-800/80">
                      <strong className="text-white">{s.dialogue[0].characterName}:</strong> "{s.dialogue[0].line}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

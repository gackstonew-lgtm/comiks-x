"use client";

import { useState, useEffect } from "react";
import { ComicSeries, ComicArtStyle, LocationItem } from "@/types";
import {
  BookOpen,
  Plus,
  Lock,
  Unlock,
  Palette,
  MapPin,
  Sparkles,
  Layers,
  CheckCircle,
  Tag,
  Shield,
  Film,
} from "lucide-react";

const ART_STYLES: { name: ComicArtStyle; desc: string; sample: string }[] = [
  { name: "African Comic", desc: "Vibrant African palettes, Afro-futuristic comic linework, warm earth tones & neon.", sample: "Vivid Cel-shaded" },
  { name: "2D Comic", desc: "Classic ink linework, bold flat colors, halftone retro comic print.", sample: "Halftone Print" },
  { name: "Western Comic", desc: "Marvel & DC inspired dynamic muscular shading, intense cross-hatching.", sample: "High Drama Ink" },
  { name: "Anime-inspired", desc: "Fluid cel-shading, expressive eyes, modern cinematic lighting.", sample: "Cel-Shaded Anime" },
  { name: "Cartoon", desc: "Playful animated cartoon, rounded shapes, saturated lively colors.", sample: "Expressive 2D" },
  { name: "Cinematic Cartoon", desc: "Spider-Verse & Arcane styled stylized textures and volumetric lighting.", sample: "Cinematic 3D/2D" },
  { name: "Motion Comic", desc: "Layered graphic novel panels with subtle animated parallax & smoke.", sample: "Graphic Parallax" },
  { name: "Graphic Novel", desc: "Gritty noir high-contrast black & amber ink, dramatic chiaroscuro.", sample: "Gritty Noir" },
  { name: "Satirical Cartoon", desc: "Punchy caricature exaggeration, bold dynamic timing, editorial humor.", sample: "Editorial Satire" },
  { name: "Minimalist Comic", desc: "Clean two-tone vectors, spacious framing, sleek modern look.", sample: "Two-Tone Vector" },
];

export default function SeriesPage() {
  const [seriesList, setSeriesList] = useState<ComicSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<ComicSeries | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("Animation / Urban Slice-of-Life");
  const [artStyle, setArtStyle] = useState<ComicArtStyle>("African Comic");
  const [isStyleLocked, setIsStyleLocked] = useState(true);
  const [newRule, setNewRule] = useState("");
  const [rules, setRules] = useState<string[]>([
    "Mix English, Swahili, and authentic Sheng naturally without awkward translations.",
    "Maintain character wardrobe and facial hair consistency in every scene.",
    "Exaggerated comic reaction shots during comedic and tense turning points.",
  ]);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/series");
      const data = await res.json();
      if (data.success && data.data) {
        setSeriesList(data.data);
        if (data.data.length > 0 && !selectedSeries) {
          setSelectedSeries(data.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const res = await fetch("/api/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          genre,
          artStyle,
          isStyleLocked,
          worldRules: rules,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSeries();
        setIsCreating(false);
        setTitle("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addRule = () => {
    if (!newRule.trim()) return;
    setRules([...rules, newRule.trim()]);
    setNewRule("");
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-comic-yellow mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            Comic Series Universe
          </div>
          <h1 className="text-3xl font-black text-white">Series System & World Rules</h1>
          <p className="text-xs text-studio-400 mt-1">
            Configure series lore, lock visual comic art styles, and establish dialogue world rules across episodes.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-102 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          {isCreating ? "Close Form" : "Create New Series"}
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSeries}
          className="bg-studio-900 border border-amber-500/30 rounded-2xl p-6 space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-comic-yellow" />
              New Comic Series Setup
            </h3>
            <span className="text-xs text-studio-400">Unlimited episodes can be created under this series</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Series Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Life in Nairobi, Safari Cyberpunk, Matatu Hustlers..."
                required
                className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-comic-yellow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Urban Comedy / Sci-Fi / Action / Slice-of-Life"
                className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-comic-yellow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Series Logline & Premise</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the world, premise, tone, and recurring character dynamics..."
              className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-comic-yellow"
            />
          </div>

          {/* Visual Style Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-studio-300 uppercase flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-comic-yellow" />
                Select & Lock Comic Art Style
              </label>
              <label className="flex items-center gap-2 text-xs text-studio-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStyleLocked}
                  onChange={(e) => setIsStyleLocked(e.target.checked)}
                  className="rounded border-studio-700 text-comic-yellow focus:ring-0"
                />
                <span className="flex items-center gap-1 text-[11px] font-semibold">
                  <Lock className="w-3 h-3 text-comic-yellow" />
                  Lock style for all future episodes
                </span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {ART_STYLES.map((style) => (
                <button
                  type="button"
                  key={style.name}
                  onClick={() => setArtStyle(style.name)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    artStyle === style.name
                      ? "bg-amber-500/10 border-comic-yellow text-white shadow-md shadow-amber-500/10"
                      : "bg-studio-950 border-studio-800 text-studio-400 hover:border-studio-700"
                  }`}
                >
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{style.name}</span>
                    {artStyle === style.name && <CheckCircle className="w-3 h-3 text-comic-yellow" />}
                  </div>
                  <div className="text-[10px] text-studio-400 mt-1 line-clamp-2">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* World Rules */}
          <div>
            <label className="block text-xs font-bold text-studio-300 uppercase mb-1">
              World Rules & Cultural Authenticity Guidelines
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add dialogue rule (e.g. natural Sheng mixing, specific slang words)..."
                className="flex-1 bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
              />
              <button
                type="button"
                onClick={addRule}
                className="px-4 py-2 rounded-xl bg-studio-800 hover:bg-studio-700 text-xs font-bold text-white"
              >
                Add Rule
              </button>
            </div>
            <div className="space-y-1.5">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-studio-950 border border-studio-800 text-xs text-studio-300"
                >
                  <span>• {rule}</span>
                  <button
                    type="button"
                    onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                    className="text-studio-500 hover:text-red-400 text-xs ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-studio-800">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl bg-studio-850 hover:bg-studio-800 text-xs font-bold text-studio-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 text-xs font-black"
            >
              Save & Initialize Series
            </button>
          </div>
        </form>
      )}

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {seriesList.map((series) => (
          <div
            key={series.id}
            onClick={() => setSelectedSeries(series)}
            className={`cursor-pointer rounded-2xl p-6 border transition-all ${
              selectedSeries?.id === series.id
                ? "bg-studio-900 border-comic-yellow/80 shadow-lg shadow-amber-500/10"
                : "bg-studio-900/60 border-studio-800 hover:border-studio-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-studio-950 text-comic-yellow border border-studio-800">
                {series.genre}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-studio-400">
                {series.isStyleLocked ? (
                  <>
                    <Lock className="w-3 h-3 text-comic-yellow" />
                    Locked Style
                  </>
                ) : (
                  <Unlock className="w-3 h-3 text-studio-500" />
                )}
              </span>
            </div>

            <h3 className="text-xl font-black text-white">{series.title}</h3>
            <p className="text-xs text-studio-400 mt-2 line-clamp-3 leading-relaxed">
              {series.description}
            </p>

            <div className="mt-5 pt-4 border-t border-studio-800/80 flex items-center justify-between text-xs">
              <span className="text-studio-400 font-medium">Style: <strong className="text-white">{series.artStyle}</strong></span>
              <span className="text-comic-cyan font-bold">{series.episodeCount || 1} Episodes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Series Detail View */}
      {selectedSeries && (
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-studio-800">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span>{selectedSeries.title}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-comic-yellow border border-amber-500/30">
                  {selectedSeries.artStyle}
                </span>
              </h2>
              <p className="text-xs text-studio-400 mt-1">{selectedSeries.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-studio-400">Series Brand Outro</div>
              <div className="text-xs font-bold text-comic-yellow">{selectedSeries.brandIdentity?.outroHook}</div>
            </div>
          </div>

          {/* World Rules and Kenyan Slang / Sheng Directives */}
          <div>
            <h4 className="text-xs font-bold text-studio-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-comic-yellow" />
              World Rules & Sheng/Swahili Mixing Policies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedSeries.worldRules?.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-studio-950 border border-studio-800 text-xs text-studio-200 leading-relaxed"
                >
                  <span className="text-comic-yellow font-bold mr-1.5">Rule {idx + 1}:</span>
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

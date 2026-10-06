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
  Globe,
  Languages,
  Search,
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

  // Series Detail Tabs & Extended Systems
  const [activeSeriesTab, setActiveSeriesTab] = useState<"lore" | "world" | "glossary">("lore");
  const [worldUniverse, setWorldUniverse] = useState<any | null>(null);
  const [glossaryTerms, setGlossaryTerms] = useState<any[]>([]);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [testDialogue, setTestDialogue] = useState("Manze leo Kencom kuliwa ngori sana!");
  const [analyzedResult, setAnalyzedResult] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  useEffect(() => {
    if (selectedSeries) {
      fetch(`/api/worlds?seriesId=${selectedSeries.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setWorldUniverse(data.world);
            setGlossaryTerms(data.glossary || []);
          }
        })
        .catch(console.error);
    }
  }, [selectedSeries]);

  const handleAnalyzeDialogue = async () => {
    if (!testDialogue.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/worlds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testDialogue, characterRole: "Protagonist" }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalyzedResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
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

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-studio-800 pb-2">
            <button
              onClick={() => setActiveSeriesTab("lore")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSeriesTab === "lore"
                  ? "bg-comic-yellow text-studio-950 shadow-md shadow-amber-500/10"
                  : "text-studio-400 hover:text-white hover:bg-studio-850"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Series Lore & Rules
            </button>
            <button
              onClick={() => setActiveSeriesTab("world")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSeriesTab === "world"
                  ? "bg-comic-yellow text-studio-950 shadow-md shadow-amber-500/10"
                  : "text-studio-400 hover:text-white hover:bg-studio-850"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              World Universe & Architecture
            </button>
            <button
              onClick={() => setActiveSeriesTab("glossary")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSeriesTab === "glossary"
                  ? "bg-comic-yellow text-studio-950 shadow-md shadow-amber-500/10"
                  : "text-studio-400 hover:text-white hover:bg-studio-850"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              Sheng & Swahili Glossary ({glossaryTerms.length})
            </button>
          </div>

          {/* TAB 1: Series Lore & World Rules */}
          {activeSeriesTab === "lore" && (
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
          )}

          {/* TAB 2: World Universe & Architecture */}
          {activeSeriesTab === "world" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-comic-cyan" />
                    {worldUniverse?.name || "Nairobi Metropolis"} — Architectural & Environmental World Bible
                  </h4>
                  <p className="text-[11px] text-studio-400 mt-0.5">
                    {worldUniverse?.culturalTone || "Urban Hustle, Tech Innovation, Vibrant African Comic Energy"}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-comic-cyan border border-cyan-500/30">
                  Global Coherence Anchor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Architecture Rules */}
                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-comic-yellow flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Architecture & Urban Fabric Rules
                  </div>
                  <ul className="text-xs text-studio-300 space-y-1.5">
                    {(worldUniverse?.architectureRules || [
                      "Buru Buru: 1980s terracotta-tiled maisonettes, walled residential courtyards with iron gates.",
                      "CBD Kencom: Brutalist glass-and-concrete high-rises with lively ground-level street kiosks.",
                      "Kilimani: Contemporary glass tech offices with lush perimeter jacaranda trees.",
                    ]).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-comic-yellow font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lighting Rules */}
                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-comic-cyan flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Cinematic Lighting & Atmosphere
                  </div>
                  <ul className="text-xs text-studio-300 space-y-1.5">
                    {(worldUniverse?.lightingRules || [
                      "High-contrast equatorial sunlight with sharp deep shadows during midday.",
                      "Warm golden hour amber rays reflecting off metallic matatu paint.",
                      "Moody neon, halogen streetlamps, and warm shopfront fluorescent lighting at dusk.",
                    ]).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-comic-cyan font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spatial Rules */}
                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-comic-purple flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    Spatial Scale & Density
                  </div>
                  <ul className="text-xs text-studio-300 space-y-1.5">
                    {(worldUniverse?.spatialRules || [
                      "Pedestrian congestion concentrated around bus stages and Kencom bus stops.",
                      "Interior tech offices are compact with dual monitor setups and power strips.",
                    ]).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-comic-purple font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social Dynamics */}
                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-2">
                  <div className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Social & Cultural Dynamics
                  </div>
                  <ul className="text-xs text-studio-300 space-y-1.5">
                    {(worldUniverse?.socialDynamics || [
                      "Fast-paced banter between conductors, hawkers, and commuters.",
                      "Subtle deference in corporate meetings contrasting with energetic street-level peer slang.",
                    ]).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Sheng & Swahili Localization Glossary */}
          {activeSeriesTab === "glossary" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-comic-yellow" />
                    Authentic Kenyan Sheng & Swahili Localization Glossary
                  </h4>
                  <p className="text-[11px] text-studio-400 mt-0.5">
                    Integrated across AI Director dialogue synthesis to preserve authentic Nairobi rhythm.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-studio-400" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Search terms or slang..."
                    className="pl-8 pr-3 py-1.5 bg-studio-950 border border-studio-800 rounded-xl text-xs text-white focus:outline-none focus:border-comic-yellow w-48"
                  />
                </div>
              </div>

              {/* Glossary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {glossaryTerms
                  .filter((t) =>
                    glossarySearch
                      ? t.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                        t.meaning.toLowerCase().includes(glossarySearch.toLowerCase())
                      : true
                  )
                  .map((t, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-studio-950 border border-studio-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-comic-yellow">{t.term}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-studio-900 border border-studio-800 text-studio-400 font-mono">
                          {t.context}
                        </span>
                      </div>
                      <p className="text-xs text-white font-medium">{t.meaning}</p>
                      <p className="text-[11px] text-studio-400 italic font-mono bg-studio-900/60 p-1.5 rounded border border-studio-850">
                        "{t.usageExample}"
                      </p>
                    </div>
                  ))}
              </div>

              {/* Interactive Code-Switching Dialogue Tester */}
              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-comic-cyan" />
                    Interactive Dialogue Code-Switching Analyzer
                  </div>
                  <span className="text-[10px] text-studio-400 font-mono">Real-time Sheng / English Verifier</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testDialogue}
                    onChange={(e) => setTestDialogue(e.target.value)}
                    placeholder="Enter character line (e.g. Manze leo Kencom kuliwa ngori sana)..."
                    className="flex-1 bg-studio-900 border border-studio-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
                  />
                  <button
                    onClick={handleAnalyzeDialogue}
                    disabled={isAnalyzing}
                    className="px-4 py-2 rounded-xl bg-comic-cyan/10 hover:bg-comic-cyan/20 border border-comic-cyan/30 text-comic-cyan text-xs font-bold whitespace-nowrap"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Dialogue"}
                  </button>
                </div>

                {analyzedResult && (
                  <div className="p-3 rounded-xl bg-studio-900 border border-cyan-500/20 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-comic-cyan">Analysis Result</span>
                      <span className="text-[10px] text-studio-400">
                        Detected Slang: {analyzedResult.detectedSlang?.join(", ") || "None"}
                      </span>
                    </div>
                    <p className="text-studio-300 text-[11px]">{analyzedResult.culturalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

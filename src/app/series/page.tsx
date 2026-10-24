"use client";

import { useState, useEffect } from "react";
import { ComicSeries, ComicArtStyle } from "@/types";
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
  Shield,
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
  ]);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch("/api/series");
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setSeriesList(data.data);
        if (!selectedSeries) setSelectedSeries(data.data[0]);
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
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            Comic Series Universe
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#ededed] tracking-tight">
            Series System & World Rules
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1 max-w-xl leading-relaxed">
            Configure series lore, lock visual comic art styles, and establish dialogue world rules across episodes.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isCreating ? "Close Form" : "Create New Series"}</span>
        </button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateSeries}
          className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#ededed] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              New Comic Series Setup
            </h3>
            <span className="text-xs text-[#707070]">Unlimited episodes can be created under this series</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Series Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Life in Nairobi, Safari Cyberpunk..."
                required
                className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Genre</label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Urban Comedy / Sci-Fi / Action / Slice-of-Life"
                className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#ededed] mb-1">Series Logline & Premise</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the world, premise, tone, and recurring character dynamics..."
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-2 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
            />
          </div>

          {/* Visual Style Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#ededed] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-brand" />
                Select & Lock Comic Art Style
              </label>
              <label className="flex items-center gap-2 text-xs text-[#a0a0a0] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStyleLocked}
                  onChange={(e) => setIsStyleLocked(e.target.checked)}
                  className="rounded-[4px] border-[#2e2e2e] text-brand focus:ring-0"
                />
                <span className="flex items-center gap-1 text-[11px] font-medium text-[#ededed]">
                  <Lock className="w-3 h-3 text-brand" />
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
                  className={`p-3 rounded-[6px] border text-left transition-all ${
                    artStyle === style.name
                      ? "bg-[#1c1c1c] border-brand shadow-[0_0_0_1px_rgba(62,207,142,0.3)] text-white"
                      : "bg-[#121212] border-[#2e2e2e] text-[#a0a0a0] hover:border-[#3e3e3e]"
                  }`}
                >
                  <div className="text-xs font-semibold text-[#ededed] flex items-center justify-between">
                    <span>{style.name}</span>
                    {artStyle === style.name && <CheckCircle className="w-3.5 h-3.5 text-brand" />}
                  </div>
                  <div className="text-[10px] text-[#707070] mt-1 line-clamp-2">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* World Rules */}
          <div>
            <label className="block text-xs font-medium text-[#ededed] mb-1">
              World Rules & Cultural Authenticity Guidelines
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add dialogue rule (e.g. natural Sheng mixing, specific slang words)..."
                className="flex-1 bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
              />
              <button
                type="button"
                onClick={addRule}
                className="px-3.5 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-xs font-medium text-[#ededed]"
              >
                Add Rule
              </button>
            </div>
            <div className="space-y-1">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1 rounded-[4px] bg-[#121212] border border-[#2e2e2e] text-xs text-[#a0a0a0]"
                >
                  <span>• {rule}</span>
                  <button
                    type="button"
                    onClick={() => setRules(rules.filter((_, i) => i !== idx))}
                    className="text-[#707070] hover:text-red-400 text-xs ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#2e2e2e]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-xs font-medium text-[#a0a0a0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] text-xs font-medium shadow-sm"
            >
              Save & Initialize Series
            </button>
          </div>
        </form>
      )}

      {/* Series Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {seriesList.map((series) => (
          <div
            key={series.id}
            onClick={() => setSelectedSeries(series)}
            className={`cursor-pointer rounded-[6px] p-5 border transition-all ${
              selectedSeries?.id === series.id
                ? "bg-[#171717] border-brand shadow-[0_0_0_1px_rgba(62,207,142,0.3)]"
                : "bg-[#171717] border-[#2e2e2e] hover:border-[#3e3e3e]"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#121212] text-brand border border-[#2e2e2e]">
                {series.genre}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-medium text-[#707070]">
                {series.isStyleLocked ? (
                  <>
                    <Lock className="w-3 h-3 text-brand" />
                    Locked Style
                  </>
                ) : (
                  <Unlock className="w-3 h-3 text-[#707070]" />
                )}
              </span>
            </div>

            <h3 className="text-base font-semibold text-[#ededed]">{series.title}</h3>
            <p className="text-xs text-[#a0a0a0] mt-1.5 line-clamp-3 leading-relaxed">
              {series.description}
            </p>

            <div className="mt-4 pt-3 border-t border-[#2e2e2e] flex items-center justify-between text-xs">
              <span className="text-[#707070]">Style: <strong className="text-[#ededed] font-medium">{series.artStyle}</strong></span>
              <span className="text-brand font-medium">{series.episodeCount || 1} Episodes</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Series Detail View */}
      {selectedSeries && (
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#2e2e2e]">
            <div>
              <h2 className="text-lg font-semibold text-[#ededed] flex items-center gap-2">
                <span>{selectedSeries.title}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/25">
                  {selectedSeries.artStyle}
                </span>
              </h2>
              <p className="text-xs text-[#a0a0a0] mt-1">{selectedSeries.description}</p>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#707070]">Series Brand Outro</div>
              <div className="text-xs font-semibold text-brand">{selectedSeries.brandIdentity?.outroHook}</div>
            </div>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center gap-1.5 border-b border-[#2e2e2e] pb-2">
            <button
              onClick={() => setActiveSeriesTab("lore")}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeSeriesTab === "lore"
                  ? "bg-[#232323] text-brand border border-brand/25"
                  : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#1c1c1c]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Series Lore & Rules</span>
            </button>
            <button
              onClick={() => setActiveSeriesTab("world")}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeSeriesTab === "world"
                  ? "bg-[#232323] text-brand border border-brand/25"
                  : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#1c1c1c]"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>World Universe & Architecture</span>
            </button>
            <button
              onClick={() => setActiveSeriesTab("glossary")}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeSeriesTab === "glossary"
                  ? "bg-[#232323] text-brand border border-brand/25"
                  : "text-[#a0a0a0] hover:text-[#ededed] hover:bg-[#1c1c1c]"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>Sheng & Swahili Glossary ({glossaryTerms.length})</span>
            </button>
          </div>

          {/* TAB 1: Series Lore & World Rules */}
          {activeSeriesTab === "lore" && (
            <div>
              <h4 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand" />
                World Rules & Sheng/Swahili Mixing Policies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedSeries.worldRules?.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs text-[#a0a0a0] leading-relaxed"
                  >
                    <span className="text-brand font-medium mr-1.5">Rule {idx + 1}:</span>
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
                  <h4 className="text-xs font-semibold text-[#ededed] uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-brand" />
                    {worldUniverse?.name || "Nairobi Metropolis"} — Architectural & Environmental World Bible
                  </h4>
                  <p className="text-[11px] text-[#707070] mt-0.5">
                    {worldUniverse?.culturalTone || "Urban Hustle, Tech Innovation, Vibrant African Comic Energy"}
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/25">
                  Global Coherence Anchor
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Architecture Rules */}
                <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase text-brand flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Architecture & Urban Fabric Rules
                  </div>
                  <ul className="text-xs text-[#a0a0a0] space-y-1">
                    {(worldUniverse?.architectureRules || [
                      "Buru Buru: 1980s terracotta-tiled maisonettes, walled residential courtyards with iron gates.",
                      "CBD Kencom: Brutalist glass-and-concrete high-rises with lively ground-level street kiosks.",
                      "Kilimani: Contemporary glass tech offices with lush perimeter jacaranda trees.",
                    ]).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Lighting Rules */}
                <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase text-brand flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Cinematic Lighting & Atmosphere
                  </div>
                  <ul className="text-xs text-[#a0a0a0] space-y-1">
                    {(worldUniverse?.lightingRules || [
                      "High-contrast equatorial sunlight with sharp deep shadows during midday.",
                      "Warm golden hour amber rays reflecting off metallic matatu paint.",
                      "Moody neon, halogen streetlamps, and warm shopfront fluorescent lighting at dusk.",
                    ]).map((rule: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Sheng & Swahili Glossary */}
          {activeSeriesTab === "glossary" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#ededed] uppercase flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-brand" />
                    Kenyan Sheng & Swahili Localization Glossary
                  </h4>
                  <p className="text-[11px] text-[#707070] mt-0.5">
                    Integrated across AI Director dialogue synthesis to preserve authentic Nairobi rhythm.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-2 text-[#707070]" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Search terms or slang..."
                    className="pl-7 pr-2.5 py-1 bg-[#121212] border border-[#2e2e2e] rounded-[6px] text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 w-44"
                  />
                </div>
              </div>

              {/* Glossary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {glossaryTerms
                  .filter((t) =>
                    glossarySearch
                      ? t.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
                        t.meaning.toLowerCase().includes(glossarySearch.toLowerCase())
                      : true
                  )
                  .map((t, idx) => (
                    <div key={idx} className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand">{t.term}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#171717] border border-[#2e2e2e] text-[#707070] font-mono">
                          {t.context}
                        </span>
                      </div>
                      <p className="text-xs text-[#ededed] font-medium">{t.meaning}</p>
                      <p className="text-[11px] text-[#707070] italic font-mono bg-[#171717] p-1.5 rounded-[4px] border border-[#2e2e2e]">
                        "{t.usageExample}"
                      </p>
                    </div>
                  ))}
              </div>

              {/* Code-Switching Dialogue Tester */}
              <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-[#ededed] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand" />
                    Interactive Dialogue Code-Switching Analyzer
                  </div>
                  <span className="text-[10px] text-[#707070] font-mono">Real-time Sheng / English Verifier</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testDialogue}
                    onChange={(e) => setTestDialogue(e.target.value)}
                    placeholder="Enter character line (e.g. Manze leo Kencom kuliwa ngori sana)..."
                    className="flex-1 bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-2.5 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
                  />
                  <button
                    onClick={handleAnalyzeDialogue}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-brand text-xs font-medium whitespace-nowrap"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Dialogue"}
                  </button>
                </div>

                {analyzedResult && (
                  <div className="p-2.5 rounded-[6px] bg-[#171717] border border-[#2e2e2e] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-brand">Analysis Result</span>
                      <span className="text-[10px] text-[#707070]">
                        Detected Slang: {analyzedResult.detectedSlang?.join(", ") || "None"}
                      </span>
                    </div>
                    <p className="text-[#a0a0a0] text-[11px]">{analyzedResult.culturalNotes}</p>
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

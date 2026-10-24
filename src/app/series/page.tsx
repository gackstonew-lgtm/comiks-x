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
  Trash2,
  Edit2,
  FolderPlus,
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
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Series Detail Tabs & Extended Systems
  const [activeSeriesTab, setActiveSeriesTab] = useState<"lore" | "world" | "glossary">("lore");
  const [worldUniverse, setWorldUniverse] = useState<any | null>(null);
  const [glossaryTerms, setGlossaryTerms] = useState<any[]>([]);
  const [glossarySearch, setGlossarySearch] = useState("");
  const [testDialogue, setTestDialogue] = useState("");
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
      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        setSeriesList(list);
        if (list.length > 0) {
          setSelectedSeries((prev) => (prev ? list.find((s: ComicSeries) => s.id === prev.id) || list[0] : list[0]));
        } else {
          setSelectedSeries(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setErrorMessage("Series title must be at least 2 characters.");
      return;
    }

    try {
      const payload = {
        title: trimmedTitle,
        description: description.trim(),
        genre: genre.trim(),
        artStyle,
        isStyleLocked,
        worldRules: rules,
      };

      if (editingSeriesId) {
        const res = await fetch(`/api/series/${editingSeriesId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage("Series project updated successfully.");
          await fetchSeries();
          setIsCreating(false);
          setEditingSeriesId(null);
        } else {
          setErrorMessage(data.error || "Failed to update series.");
        }
      } else {
        const res = await fetch("/api/series", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          setStatusMessage("Series project created successfully.");
          await fetchSeries();
          setSelectedSeries(data.data);
          setIsCreating(false);
          setTitle("");
          setDescription("");
        } else {
          setErrorMessage(data.error || "Failed to create series.");
        }
      }
    } catch (err) {
      setErrorMessage("An unexpected network error occurred.");
    }
  };

  const startEditSeries = (series: ComicSeries) => {
    setTitle(series.title);
    setDescription(series.description || "");
    setGenre(series.genre || "Animation / Urban Slice-of-Life");
    setArtStyle(series.artStyle || "African Comic");
    setIsStyleLocked(series.isStyleLocked ?? true);
    setRules(series.worldRules || []);
    setEditingSeriesId(series.id);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteSeries = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? All associated episodes, characters, and scenes will also be removed permanently.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Series "${name}" deleted.`);
        await fetchSeries();
      } else {
        setErrorMessage(data.error || "Failed to delete series.");
      }
    } catch (err) {
      setErrorMessage("Network error deleting series.");
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
    } else {
      setWorldUniverse(null);
      setGlossaryTerms([]);
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
            Configure series projects, lock visual comic art styles, and establish dialogue world rules across episodes.
          </p>
        </div>

        <button
          onClick={() => {
            if (isCreating) {
              setIsCreating(false);
              setEditingSeriesId(null);
            } else {
              setTitle("");
              setDescription("");
              setRules(["Mix English, Swahili, and authentic Sheng naturally."]);
              setEditingSeriesId(null);
              setIsCreating(true);
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{isCreating ? "Close Form" : "Create New Series"}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/25 text-brand text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-[6px] bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Creation / Edit Modal Form */}
      {isCreating && (
        <form
          onSubmit={handleSaveSeries}
          className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#ededed] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              {editingSeriesId ? "Edit Comic Series" : "New Comic Series Setup"}
            </h3>
            <span className="text-xs text-[#707070]">Episodes, characters, and scenes are grouped under this series</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-[#ededed] mb-1">Series Title *</label>
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
              onClick={() => {
                setIsCreating(false);
                setEditingSeriesId(null);
              }}
              className="px-3.5 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-xs font-medium text-[#a0a0a0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] text-xs font-medium shadow-sm"
            >
              {editingSeriesId ? "Update Series" : "Save & Initialize Series"}
            </button>
          </div>
        </form>
      )}

      {/* Series List or Empty State */}
      {seriesList.length === 0 ? (
        <div className="rounded-[6px] bg-[#171717] border border-[#2e2e2e] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand mx-auto">
            <FolderPlus className="w-6 h-6 stroke-[1.8]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-semibold text-[#ededed]">No Comic Series Projects Yet</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Start your animation universe by creating your first comic series. Define its art style, genre, and world rules.
            </p>
          </div>
          <div>
            <button
              onClick={() => {
                setTitle("");
                setDescription("");
                setIsCreating(true);
              }}
              className="px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-medium text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Your First Series</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seriesList.map((series) => (
            <div
              key={series.id}
              onClick={() => setSelectedSeries(series)}
              className={`cursor-pointer rounded-[6px] p-5 border transition-all flex flex-col justify-between ${
                selectedSeries?.id === series.id
                  ? "bg-[#171717] border-brand shadow-[0_0_0_1px_rgba(62,207,142,0.3)]"
                  : "bg-[#171717] border-[#2e2e2e] hover:border-[#3e3e3e]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#121212] text-brand border border-[#2e2e2e]">
                    {series.genre}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditSeries(series);
                      }}
                      className="p-1 rounded text-[#707070] hover:text-[#ededed] hover:bg-[#232323] transition-colors"
                      title="Edit series"
                      aria-label="Edit series"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSeries(series.id, series.title);
                      }}
                      className="p-1 rounded text-[#707070] hover:text-red-400 hover:bg-[#232323] transition-colors"
                      title="Delete series"
                      aria-label="Delete series"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#ededed]">{series.title}</h3>
                <p className="text-xs text-[#a0a0a0] mt-1.5 line-clamp-3 leading-relaxed">
                  {series.description || "No premise description provided."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2e2e2e] flex items-center justify-between text-xs">
                <span className="text-[#707070]">Style: <strong className="text-[#ededed] font-medium">{series.artStyle}</strong></span>
                <span className="text-brand font-medium">{series.episodeCount || 0} Episodes</span>
              </div>
            </div>
          ))}
        </div>
      )}

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEditSeries(selectedSeries)}
                className="px-3 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-xs font-medium text-[#ededed] inline-flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
              <button
                onClick={() => handleDeleteSeries(selectedSeries.id, selectedSeries.title)}
                className="px-3 py-1.5 rounded-[6px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-xs font-medium text-red-400 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
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
              <span>World Universe</span>
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
              <span>Glossary ({glossaryTerms.length})</span>
            </button>
          </div>

          {/* TAB 1: Series Lore & World Rules */}
          {activeSeriesTab === "lore" && (
            <div>
              <h4 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-brand" />
                World Rules & Directing Guidelines
              </h4>
              {selectedSeries.worldRules && selectedSeries.worldRules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSeries.worldRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs text-[#a0a0a0] leading-relaxed"
                    >
                      <span className="text-brand font-medium mr-1.5">Rule {idx + 1}:</span>
                      {rule}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#707070] italic">No world rules established for this series yet.</p>
              )}
            </div>
          )}

          {/* TAB 2: World Universe & Architecture */}
          {activeSeriesTab === "world" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-[#ededed] uppercase flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand" />
                  {worldUniverse?.name || `${selectedSeries.title} World Space`}
                </h4>
                <p className="text-[11px] text-[#707070] mt-0.5">
                  {worldUniverse?.description || "Dynamic environment guidelines for AI camera angles and scene coherence."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase text-brand flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Urban & Spatial Environment
                  </div>
                  <p className="text-xs text-[#a0a0a0]">
                    {worldUniverse?.architectureStyle || "Configured per scene location prompts."}
                  </p>
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1.5">
                  <div className="text-[10px] font-semibold uppercase text-brand flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Lighting & Aesthetic Rules
                  </div>
                  <p className="text-xs text-[#a0a0a0]">
                    {worldUniverse?.lightingRules || "High-contrast comic shading adhering to locked series art style."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Glossary */}
          {activeSeriesTab === "glossary" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-[#ededed] uppercase flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-brand" />
                    Localization Glossary
                  </h4>
                  <p className="text-[11px] text-[#707070] mt-0.5">
                    Terms analyzed during AI Director dialogue synthesis.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-2 text-[#707070]" />
                  <input
                    type="text"
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    placeholder="Search terms..."
                    className="pl-7 pr-2.5 py-1 bg-[#121212] border border-[#2e2e2e] rounded-[6px] text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 w-44"
                  />
                </div>
              </div>

              {glossaryTerms.length > 0 ? (
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
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-[#707070] italic">No custom glossary terms registered yet.</p>
              )}

              {/* Code-Switching Dialogue Tester */}
              <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2.5">
                <div className="text-xs font-semibold text-[#ededed] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" />
                  Dialogue Analyzer
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testDialogue}
                    onChange={(e) => setTestDialogue(e.target.value)}
                    placeholder="Enter character line to analyze cultural phrasing..."
                    className="flex-1 bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-2.5 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
                  />
                  <button
                    onClick={handleAnalyzeDialogue}
                    disabled={isAnalyzing || !testDialogue.trim()}
                    className="px-3 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-brand text-xs font-medium whitespace-nowrap disabled:opacity-40"
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze Dialogue"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

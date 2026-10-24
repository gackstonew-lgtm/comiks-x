"use client";

import { useState, useEffect } from "react";
import { Character, ComicSeries } from "@/types";
import {
  User,
  Plus,
  Lock,
  Unlock,
  Copy,
  Sparkles,
  Volume2,
  Trash2,
  Edit,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Mic,
  Camera,
  Dna,
  History,
  Image as ImageIcon,
  Key,
  Layers,
} from "lucide-react";

export default function CharacterBiblePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [seriesList, setSeriesList] = useState<ComicSeries[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatedSheetPrompt, setGeneratedSheetPrompt] = useState<string | null>(null);
  const [voiceTesting, setVoiceTesting] = useState(false);
  const [voiceTestAudio, setVoiceTestAudio] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Character Inspector Sub-Tabs
  const [activeDetailTab, setActiveDetailTab] = useState<"anchors" | "dna" | "references" | "memories" | "locks">("anchors");
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newMemoryType, setNewMemoryType] = useState<"event" | "relationship" | "item" | "knowledge">("event");
  const [newMemorySignificance, setNewMemorySignificance] = useState<"minor" | "moderate" | "pivotal">("moderate");

  const [isAddingRef, setIsAddingRef] = useState(false);
  const [newRefLabel, setNewRefLabel] = useState("");
  const [newRefType, setNewRefType] = useState<"identity" | "clothing" | "expression" | "turnaround" | "lighting">("turnaround");
  const [newRefAngle, setNewRefAngle] = useState<"front" | "three_quarter" | "side" | "back">("front");

  const [isAddingOverride, setIsAddingOverride] = useState(false);
  const [overrideAttr, setOverrideAttr] = useState("wardrobe");
  const [overrideVal, setOverrideVal] = useState("");
  const [overrideJust, setOverrideJust] = useState("");

  // Form fields
  const [formData, setFormData] = useState<Partial<Character>>({
    name: "",
    age: 24,
    personality: "",
    appearance: "",
    clothing: "",
    hairstyle: "",
    skinTone: "",
    bodyType: "",
    accent: "Kenyan English",
    speechStyle: "",
    characterDescription: "",
    isLocked: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const charRes = await fetch("/api/characters").then((r) => r.json());
      const sRes = await fetch("/api/series").then((r) => r.json());
      if (charRes?.success && charRes.data) {
        setCharacters(charRes.data);
      } else if (Array.isArray(charRes)) {
        setCharacters(charRes);
      }
      if (sRes?.success) setSeriesList(sRes.data);
    } catch {
      // Fallback direct fetch
      const res = await fetch("/api/characters");
      const data = await res.json();
      if (data.success) setCharacters(data.data);

      const sRes = await fetch("/api/series");
      const sData = await sRes.json();
      if (sData.success) setSeriesList(sData.data);
    }
  };

  const handleSelectCharacter = async (char: Character) => {
    setSelectedCharacter(char);
    setFormData(char);
    setIsEditing(false);
    setIsCreating(false);
    setGeneratedSheetPrompt(null);
    setVoiceTestAudio(null);

    // Fetch full enriched DNA, references, memories
    try {
      const res = await fetch(`/api/characters/${char.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCharacter(data.data);
        setFormData(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLock = async (charId: string) => {
    try {
      const res = await fetch(`/api/characters/${charId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "lock_toggle" }),
      });
      const data = await res.json();
      if (data.success) {
        setCharacters((prev) => prev.map((c) => (c.id === charId ? data.data : c)));
        if (selectedCharacter?.id === charId) setSelectedCharacter(data.data);
        setStatusMessage("Character lock status updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (charId: string) => {
    try {
      const res = await fetch(`/api/characters/${charId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate" }),
      });
      const data = await res.json();
      if (data.success) {
        setCharacters((prev) => [...prev, data.data]);
        setSelectedCharacter(data.data);
        setStatusMessage(`Duplicated as "${data.data.name}"`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSheetPrompt = async (charId: string) => {
    try {
      const res = await fetch(`/api/characters/${charId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_sheet_prompt" }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedSheetPrompt(data.prompt);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestVoice = async (char: Character) => {
    setVoiceTesting(true);
    setVoiceTestAudio(null);
    try {
      const testPhrase = `Sasa! I am ${char.name}. I am ready for the upcoming episode in Nairobi!`;
      const res = await fetch("/api/scenes/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: char.id,
          text: testPhrase,
          language: "en",
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.audioUrl) {
        setVoiceTestAudio(data.data.audioUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVoiceTesting(false);
    }
  };

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    const seriesId = seriesList[0]?.id || "series-nairobi-01";

    if (isCreating) {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, seriesId }),
      });
      const data = await res.json();
      if (data.success) {
        setCharacters([...characters, data.data]);
        setSelectedCharacter(data.data);
        setIsCreating(false);
        setStatusMessage(`Character "${data.data.name}" added to bible.`);
      }
    } else if (isEditing && selectedCharacter) {
      const res = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setCharacters(characters.map((c) => (c.id === selectedCharacter.id ? data.data : c)));
        setSelectedCharacter(data.data);
        setIsEditing(false);
        setStatusMessage("Character updated successfully.");
      }
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !newMemoryText.trim()) return;
    try {
      const res = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_memory",
          description: newMemoryText,
          type: newMemoryType,
          significance: newMemorySignificance,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCharacter(data.data);
        setCharacters((prev) => prev.map((c) => (c.id === data.data.id ? data.data : c)));
        setNewMemoryText("");
        setIsAddingMemory(false);
        setStatusMessage("Episodic memory recorded in Character DNA.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !newRefLabel.trim()) return;
    try {
      const res = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_reference",
          label: newRefLabel,
          type: newRefType,
          cameraAngle: newRefAngle,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCharacter(data.data);
        setCharacters((prev) => prev.map((c) => (c.id === data.data.id ? data.data : c)));
        setNewRefLabel("");
        setIsAddingRef(false);
        setStatusMessage("Reference keyframe added to consistency pack.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !overrideVal.trim() || !overrideJust.trim()) return;
    try {
      const res = await fetch(`/api/characters/${selectedCharacter.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_override",
          level: "character",
          entityId: selectedCharacter.id,
          attribute: overrideAttr,
          overrideValue: overrideVal,
          justification: overrideJust,
          approvedBy: "Studio Lead",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedCharacter(data.data);
        setCharacters((prev) => prev.map((c) => (c.id === data.data.id ? data.data : c)));
        setOverrideVal("");
        setOverrideJust("");
        setIsAddingOverride(false);
        setStatusMessage("Lock override recorded with audit trail.");
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-comic-cyan mb-1">
            <User className="w-3.5 h-3.5" />
            Persistent Consistency Engine
          </div>
          <h1 className="text-3xl font-black text-white">Character Bible</h1>
          <p className="text-xs text-studio-400 mt-1 max-w-xl">
            Store detailed visual and vocal anchors. The studio enforces face, hairstyle, clothing, and speech consistency across all 30-minute scenes and episodes.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setIsEditing(false);
            setSelectedCharacter(null);
            setFormData({
              name: "",
              age: 23,
              personality: "Witty and energetic",
              appearance: "Expressive eyes, warm brown skin",
              clothing: "Modern urban Kenyan streetwear",
              hairstyle: "Short fade with waves",
              skinTone: "Deep warm bronze",
              bodyType: "Lean athletic",
              accent: "Kenyan English / Sheng",
              speechStyle: "Casual, witty, fast-paced",
              characterDescription: "New recurring cast member.",
              isLocked: true,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium shadow-sm text-xs shadow-sm hover:scale-102 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Character
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-500 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Character Cards & Detail Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: List of Characters */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-xs font-bold text-studio-400 uppercase tracking-wider flex items-center justify-between">
            <span>Series Cast ({characters.length})</span>
            <span className="text-brand">Design Locked ({characters.filter((c) => c.isLocked).length})</span>
          </div>

          <div className="space-y-3">
            {characters.map((char) => {
              const isSelected = selectedCharacter?.id === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`p-4 rounded-[6px] border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#171717] border-brand shadow-sm"
                      : "bg-[#171717]/60 border-[#2e2e2e] hover:border-[#3e3e3e]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-[6px] bg-brand/15 border border-brand/30 flex items-center justify-center font-semibold text-brand text-base shadow-sm">
                        {char.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-white text-sm">{char.name}</div>
                        <div className="text-[11px] text-studio-400 mt-0.5">
                          Age {char.age} • {char.accent}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(char.id);
                      }}
                      title={char.isLocked ? "Design is locked (consistency enforced)" : "Design is unlocked"}
                      className={`p-1.5 rounded-lg border text-xs transition-colors ${
                        char.isLocked
                          ? "bg-brand/10 border-brand/25 text-brand"
                          : "bg-[#232323] border-[#3e3e3e] text-studio-400"
                      }`}
                    >
                      {char.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-studio-300 mt-3 line-clamp-2 leading-relaxed">
                    {char.clothing}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#2e2e2e] flex items-center justify-between text-[10px] text-studio-400">
                    <span>Hairstyle: <strong className="text-white">{char.hairstyle}</strong></span>
                    <span className="text-comic-cyan font-bold">{char.voice?.gender}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Character Inspector / Form */}
        <div className="lg:col-span-2">
          {isCreating || isEditing ? (
            /* Creation / Edit Form */
            <form onSubmit={handleSaveCharacter} className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#2e2e2e]">
                <h3 className="text-lg font-black text-white">
                  {isCreating ? "Add New Bible Character" : `Edit ${selectedCharacter?.name}`}
                </h3>
                <span className="text-xs text-brand font-bold">16 Stored Consistency Anchors</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Character Name</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Brian Otieno"
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age || 24}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Hairstyle</label>
                  <input
                    type="text"
                    value={formData.hairstyle || ""}
                    onChange={(e) => setFormData({ ...formData, hairstyle: e.target.value })}
                    placeholder="e.g. Tapered fade with neat waves"
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Skin Tone</label>
                  <input
                    type="text"
                    value={formData.skinTone || ""}
                    onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })}
                    placeholder="e.g. Deep warm bronze brown"
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Body Type</label>
                  <input
                    type="text"
                    value={formData.bodyType || ""}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                    placeholder="e.g. Athletic lean build, 5ft 11in"
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-studio-300 uppercase mb-1">
                  Signature Wardrobe / Clothing (Persistent Anchor)
                </label>
                <input
                  type="text"
                  value={formData.clothing || ""}
                  onChange={(e) => setFormData({ ...formData, clothing: e.target.value })}
                  placeholder="e.g. Dark green safari zip jacket, black tee, dark denim jeans, white sneakers"
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Accent & Language</label>
                  <input
                    type="text"
                    value={formData.accent || ""}
                    onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                    placeholder="e.g. Kenyan English, Sheng, Swahili"
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Speech Style</label>
                  <input
                    type="text"
                    value={formData.speechStyle || ""}
                    onChange={(e) => setFormData({ ...formData, speechStyle: e.target.value })}
                    placeholder="e.g. Fast-paced witty humor, tech jargon"
                    className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Personality</label>
                <textarea
                  value={formData.personality || ""}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                  rows={2}
                  placeholder="e.g. Ambitious developer, loyal, easily stressed under tight deadlines..."
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[6px] px-4 py-2 text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2e2e2e]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] text-xs font-bold text-studio-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[6px] bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 text-xs font-black"
                >
                  Save Character Anchor
                </button>
              </div>
            </form>
          ) : selectedCharacter ? (
            /* Character Detail View */
            <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-6 space-y-6">
              {/* Header and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-[6px] bg-brand/15 border border-brand/30 flex items-center justify-center font-semibold text-brand text-2xl shadow-lg">
                    {selectedCharacter.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">{selectedCharacter.name}</h2>
                      {selectedCharacter.isLocked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand/10 text-brand border border-amber-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Design Locked
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#232323] text-studio-400 border border-[#3e3e3e]">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-studio-400 mt-1">
                      Age {selectedCharacter.age} • {selectedCharacter.accent}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-studio-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(selectedCharacter.id)}
                    className="p-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-studio-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleToggleLock(selectedCharacter.id)}
                    className="p-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-brand text-xs font-bold flex items-center gap-1.5"
                  >
                    {selectedCharacter.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {selectedCharacter.isLocked ? "Unlock" : "Lock Design"}
                  </button>
                </div>
              </div>

              {/* Sub-Tab Navigation Bar */}
              <div className="flex items-center gap-1.5 border-b border-[#2e2e2e] pb-2 overflow-x-auto">
                <button
                  onClick={() => setActiveDetailTab("anchors")}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeDetailTab === "anchors"
                      ? "bg-[#232323] text-brand border border-brand/25 shadow-sm"
                      : "text-studio-400 hover:text-white hover:bg-[#1c1c1c]"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Anchors & Wardrobe
                </button>
                <button
                  onClick={() => setActiveDetailTab("dna")}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeDetailTab === "dna"
                      ? "bg-[#232323] text-brand border border-brand/25 shadow-sm"
                      : "text-studio-400 hover:text-white hover:bg-[#1c1c1c]"
                  }`}
                >
                  <Dna className="w-3.5 h-3.5" />
                  DNA Blueprint
                </button>
                <button
                  onClick={() => setActiveDetailTab("references")}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeDetailTab === "references"
                      ? "bg-[#232323] text-brand border border-brand/25 shadow-sm"
                      : "text-studio-400 hover:text-white hover:bg-[#1c1c1c]"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Reference Pack ({selectedCharacter.referencesPack?.length || 2})
                </button>
                <button
                  onClick={() => setActiveDetailTab("memories")}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeDetailTab === "memories"
                      ? "bg-[#232323] text-brand border border-brand/25 shadow-sm"
                      : "text-studio-400 hover:text-white hover:bg-[#1c1c1c]"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Memories ({selectedCharacter.memories?.length || 2})
                </button>
                <button
                  onClick={() => setActiveDetailTab("locks")}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeDetailTab === "locks"
                      ? "bg-[#232323] text-brand border border-brand/25 shadow-sm"
                      : "text-studio-400 hover:text-white hover:bg-[#1c1c1c]"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  Lock Overrides
                </button>
              </div>

              {/* TAB 1: Anchors & Wardrobe */}
              {activeDetailTab === "anchors" && (
                <div className="space-y-6">
                  {/* Physical Appearance Anchors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
                      <div className="text-[10px] font-bold text-studio-400 uppercase">Hairstyle</div>
                      <div className="text-xs font-bold text-white mt-1">{selectedCharacter.hairstyle}</div>
                    </div>
                    <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
                      <div className="text-[10px] font-bold text-studio-400 uppercase">Skin Tone</div>
                      <div className="text-xs font-bold text-white mt-1">{selectedCharacter.skinTone}</div>
                    </div>
                    <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
                      <div className="text-[10px] font-bold text-studio-400 uppercase">Body Type</div>
                      <div className="text-xs font-bold text-white mt-1">{selectedCharacter.bodyType}</div>
                    </div>
                    <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
                      <div className="text-[10px] font-bold text-studio-400 uppercase">Voice Profile</div>
                      <div className="text-xs font-bold text-white mt-1">{selectedCharacter.voice?.gender} ({selectedCharacter.voice?.tone})</div>
                    </div>
                  </div>

                  {/* Wardrobe Specification */}
                  <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1">
                    <div className="text-[11px] font-bold text-brand uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Locked Wardrobe Continuity Anchor
                    </div>
                    <div className="text-xs text-studio-200 leading-relaxed font-mono">
                      {selectedCharacter.clothing}
                    </div>
                  </div>

                  {/* Voice Testing Box */}
                  <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-comic-purple" />
                        Speech Profile & Accent Sync
                      </div>
                      <div className="text-[11px] text-studio-400 mt-0.5">
                        {selectedCharacter.accent} • {selectedCharacter.speechStyle}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTestVoice(selectedCharacter)}
                        disabled={voiceTesting}
                        className="px-4 py-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-xs font-bold text-comic-purple flex items-center gap-2"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        {voiceTesting ? "Synthesizing..." : "Test Voice Audio"}
                      </button>
                      {voiceTestAudio && (
                        <audio controls src={voiceTestAudio} autoPlay className="h-8 max-w-[200px]" />
                      )}
                    </div>
                  </div>

                  {/* Generate Turnaround Character Sheet */}
                  <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-comic-cyan" />
                          3-View Model Turnaround Sheet
                        </div>
                        <div className="text-[11px] text-studio-400 mt-0.5">
                          Generate front, three-quarter, and side reference keyframes for model conditioning.
                        </div>
                      </div>
                      <button
                        onClick={() => handleGenerateSheetPrompt(selectedCharacter.id)}
                        className="px-4 py-1.5 rounded-[6px] bg-comic-cyan/10 hover:bg-comic-cyan/20 border border-comic-cyan/30 text-xs font-bold text-comic-cyan flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate Turnaround Prompt
                      </button>
                    </div>

                    {generatedSheetPrompt && (
                      <div className="p-3 rounded-lg bg-[#171717] border border-cyan-500/30 text-xs text-studio-300 font-mono leading-relaxed">
                        <div className="text-[10px] uppercase font-bold text-comic-cyan mb-1">
                          Ready for Fal / Flux / DALL-E / Runway Keyframe:
                        </div>
                        {generatedSheetPrompt}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DNA Blueprint */}
              {activeDetailTab === "dna" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Identity DNA */}
                    <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                      <div className="text-[10px] font-bold text-brand uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Identity DNA
                      </div>
                      <div className="text-xs text-studio-300 space-y-1">
                        <div><strong className="text-white">Role:</strong> {selectedCharacter.dna?.identity?.role || "Lead Cast"}</div>
                        <div><strong className="text-white">Cultural Context:</strong> {selectedCharacter.dna?.identity?.culturalContext || "Nairobi Urban Tech & Street Culture"}</div>
                        <p className="text-studio-400 text-[11px] italic mt-1 leading-relaxed">{selectedCharacter.dna?.identity?.biography || selectedCharacter.characterDescription}</p>
                      </div>
                    </div>

                    {/* Visual DNA */}
                    <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                      <div className="text-[10px] font-bold text-comic-cyan uppercase flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" />
                        Visual DNA
                      </div>
                      <div className="text-xs text-studio-300 space-y-1">
                        <div><strong className="text-white">Facial Geometry:</strong> {selectedCharacter.dna?.visual?.faceDetails || "Expressive high cheekbones, distinct facial geometry"}</div>
                        <div><strong className="text-white">Color Language:</strong> {selectedCharacter.dna?.visual?.colorLanguage || "Warm earth tones with saturated urban accents"}</div>
                        <div><strong className="text-white">Visual Style:</strong> {selectedCharacter.dna?.visual?.visualStyle || "Cel-shaded African comic animation, bold ink lines"}</div>
                      </div>
                    </div>

                    {/* Personality DNA */}
                    <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                      <div className="text-[10px] font-bold text-comic-purple uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Personality DNA
                      </div>
                      <div className="text-xs text-studio-300 space-y-1">
                        <div><strong className="text-white">Core Values:</strong> {selectedCharacter.dna?.personality?.values?.join(", ") || "Loyalty, Ambition, Hustle"}</div>
                        <div><strong className="text-white">Fears:</strong> {selectedCharacter.dna?.personality?.fears?.join(", ") || "Failure, Dead battery in traffic"}</div>
                        <div><strong className="text-white">Humor Style:</strong> {selectedCharacter.dna?.personality?.humorStyle || "Witty, observational Nairobi satire"}</div>
                      </div>
                    </div>

                    {/* Performance DNA */}
                    <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Performance & Motion DNA
                      </div>
                      <div className="text-xs text-studio-300 space-y-1">
                        <div><strong className="text-white">Posture:</strong> {selectedCharacter.dna?.performance?.posture || "Confident yet alert posture"}</div>
                        <div><strong className="text-white">Reaction Pattern:</strong> {selectedCharacter.dna?.performance?.reactionPatterns?.[0] || "Quick double-take then jumps to problem-solving"}</div>
                        <div className="flex items-center gap-4 mt-2 text-[11px]">
                          <span>Energy: <strong className="text-white">{selectedCharacter.dna?.performance?.energyLevel || 8}/10</strong></span>
                          <span>Aggression: <strong className="text-white">{selectedCharacter.dna?.performance?.aggressionLevel || 3}/10</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Voice DNA */}
                  <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                    <div className="text-[10px] font-bold text-comic-pink uppercase flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5" />
                      Voice & Slang DNA
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-studio-300">
                      <div>
                        <div><strong className="text-white">Code-Switching Cadence:</strong> {selectedCharacter.dna?.voice?.language || "Kenyan English / Sheng / Swahili"}</div>
                        <div className="mt-1"><strong className="text-white">Delivery:</strong> {selectedCharacter.dna?.voice?.emotionalDelivery || "Energetic, authentic urban cadence"}</div>
                      </div>
                      <div>
                        <strong className="text-white">Slang Lexicon Anchors:</strong>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {(selectedCharacter.dna?.voice?.slang || ["Buda", "Manze", "Wasee", "Chapaa", "Noma"]).map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-[#171717] border border-[#2e2e2e] text-[10px] text-comic-pink font-mono">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Reference Pack */}
              {activeDetailTab === "references" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Multi-Angle Reference Pack</h4>
                      <p className="text-[11px] text-studio-400">Maintains structural character consistency across AI video generation models.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingRef(!isAddingRef)}
                      className="px-3 py-1.5 rounded-[6px] bg-[#232323] text-brand border border-brand/25 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      {isAddingRef ? "Close" : "Add Keyframe"}
                    </button>
                  </div>

                  {isAddingRef && (
                    <form onSubmit={handleAddReference} className="p-4 rounded-[6px] bg-[#121212] border border-brand/40 space-y-3">
                      <div className="text-xs font-bold text-brand">Add New Reference Anchor</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={newRefLabel}
                          onChange={(e) => setNewRefLabel(e.target.value)}
                          placeholder="Label (e.g. Front Face Shot, Urban Attire)"
                          required
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                        <select
                          value={newRefType}
                          onChange={(e) => setNewRefType(e.target.value as any)}
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="identity">Master Identity</option>
                          <option value="clothing">Clothing / Wardrobe</option>
                          <option value="turnaround">Turnaround Model</option>
                          <option value="expression">Expression Grid</option>
                          <option value="lighting">Lighting Reference</option>
                        </select>
                        <select
                          value={newRefAngle}
                          onChange={(e) => setNewRefAngle(e.target.value as any)}
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="front">Front View</option>
                          <option value="three_quarter">3/4 View</option>
                          <option value="side">Profile Side View</option>
                          <option value="back">Back View</option>
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#232323] text-brand border border-brand/25 text-xs font-black">
                          Save Reference Anchor
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(selectedCharacter.referencesPack || []).map((ref) => (
                      <div key={ref.id} className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-brand">{ref.type}</span>
                          {ref.isPrimary && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-amber-500/30 font-bold">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-white">{ref.label}</div>
                        <div className="text-[10px] text-studio-400">Angle: {ref.cameraAngle || "front"}</div>
                        {ref.imageUrl && (
                          <div className="w-full h-24 rounded-lg bg-[#171717] overflow-hidden border border-[#2e2e2e] flex items-center justify-center">
                            <img src={ref.imageUrl} alt={ref.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: Episodic Memories */}
              {activeDetailTab === "memories" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Episodic Memory Ledger</h4>
                      <p className="text-[11px] text-studio-400">Character personality evolves across 30-minute episodes based on previous events.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingMemory(!isAddingMemory)}
                      className="px-3 py-1.5 rounded-[6px] bg-[#232323] text-brand border border-brand/25 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      {isAddingMemory ? "Close" : "Record Memory"}
                    </button>
                  </div>

                  {isAddingMemory && (
                    <form onSubmit={handleAddMemory} className="p-4 rounded-[6px] bg-[#121212] border border-brand/40 space-y-3">
                      <div className="text-xs font-bold text-brand">Record New Episodic Memory</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={newMemoryType}
                          onChange={(e) => setNewMemoryType(e.target.value as any)}
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="event">Major Event</option>
                          <option value="relationship">Relationship Bond</option>
                          <option value="item">Acquired Item</option>
                          <option value="knowledge">Crucial Knowledge</option>
                        </select>
                        <select
                          value={newMemorySignificance}
                          onChange={(e) => setNewMemorySignificance(e.target.value as any)}
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="minor">Minor Detail</option>
                          <option value="moderate">Moderate Plot Point</option>
                          <option value="pivotal">Pivotal Series Event</option>
                        </select>
                      </div>
                      <textarea
                        value={newMemoryText}
                        onChange={(e) => setNewMemoryText(e.target.value)}
                        placeholder="Describe what occurred to the character..."
                        rows={2}
                        required
                        className="w-full bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#232323] text-brand border border-brand/25 text-xs font-black">
                          Save Memory to DNA
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {(selectedCharacter.memories || []).map((mem) => (
                      <div key={mem.id} className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#171717] text-brand border border-[#2e2e2e]">
                              {mem.type}
                            </span>
                            <span className={`text-[10px] font-bold ${
                              mem.significance === "pivotal" ? "text-red-400" : mem.significance === "moderate" ? "text-amber-400" : "text-studio-400"
                            }`}>
                              [{mem.significance.toUpperCase()}]
                            </span>
                          </div>
                          <p className="text-xs text-studio-200">{mem.description}</p>
                        </div>
                        <span className="text-[10px] text-studio-500 font-mono whitespace-nowrap">
                          {new Date(mem.acquiredAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: Lock Overrides */}
              {activeDetailTab === "locks" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase">Hierarchical Lock Overrides & Audit Trail</h4>
                      <p className="text-[11px] text-studio-400">Strict inheritance: Series → World → Character → Episode → Scene → Shot.</p>
                    </div>
                    <button
                      onClick={() => setIsAddingOverride(!isAddingOverride)}
                      className="px-3 py-1.5 rounded-[6px] bg-[#232323] text-brand border border-brand/25 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      {isAddingOverride ? "Close" : "Request Override"}
                    </button>
                  </div>

                  {/* 6-Tier Hierarchy Map */}
                  <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex items-center justify-between text-[11px] font-mono text-studio-400 overflow-x-auto">
                    <span className="text-white font-bold">1. Series Lock</span>
                    <span>→</span>
                    <span className="text-white font-bold">2. World Lock</span>
                    <span>→</span>
                    <span className="text-brand font-bold">3. Character Lock</span>
                    <span>→</span>
                    <span className="text-studio-300">4. Episode Lock</span>
                    <span>→</span>
                    <span className="text-studio-300">5. Scene Lock</span>
                    <span>→</span>
                    <span className="text-studio-300">6. Shot Lock</span>
                  </div>

                  {isAddingOverride && (
                    <form onSubmit={handleRequestOverride} className="p-4 rounded-[6px] bg-[#121212] border border-brand/40 space-y-3">
                      <div className="text-xs font-bold text-brand">Request Contextual Lock Override</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                          value={overrideAttr}
                          onChange={(e) => setOverrideAttr(e.target.value)}
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="wardrobe">Wardrobe / Outfit Change</option>
                          <option value="hairstyle">Hairstyle Change (e.g. Post-fight)</option>
                          <option value="accent">Vocal Accent Shift</option>
                          <option value="appearance">Physical Injury / Dirt</option>
                        </select>
                        <input
                          type="text"
                          value={overrideVal}
                          onChange={(e) => setOverrideVal(e.target.value)}
                          placeholder="New Attribute Value (e.g. Rain-soaked jacket)"
                          required
                          className="bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={overrideJust}
                        onChange={(e) => setOverrideJust(e.target.value)}
                        placeholder="Narrative Justification (e.g. Brian gets caught in sudden downpour in Scene 4)"
                        required
                        className="w-full bg-[#171717] border border-[#2e2e2e] rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <div className="flex justify-end">
                        <button type="submit" className="px-4 py-1.5 rounded-lg bg-[#232323] text-brand border border-brand/25 text-xs font-black">
                          Log Audited Override
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2">
                    {selectedCharacter.lockOverrides && selectedCharacter.lockOverrides.length > 0 ? (
                      selectedCharacter.lockOverrides.map((ov) => (
                        <div key={ov.id} className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-brand uppercase">{ov.attribute || ov.field} Override</span>
                            <span className="text-[10px] text-studio-400 font-mono">Approved: {ov.approvedBy || (ov.isApproved ? "Lead Animator" : "Pending")}</span>
                          </div>
                          <div className="text-white font-mono text-[11px]">Value: {ov.overrideValue}</div>
                          <div className="text-studio-400 text-[11px] italic">Justification: {ov.justification || ov.reason}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs text-studio-400 text-center">
                        No active overrides. Character strictly inherits locked attributes across all scenes.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-96 rounded-[6px] border border-dashed border-[#2e2e2e] flex flex-col items-center justify-center text-studio-500 text-xs">
              <User className="w-8 h-8 mb-2 opacity-50" />
              Select a character to view anchors or click Create Character
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

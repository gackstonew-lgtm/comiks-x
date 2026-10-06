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
      const [charRes, seriesRes] = await fetch("/api/characters").then((r) => r.json());
      const sRes = await fetch("/api/series").then((r) => r.json());
      if (charRes) setCharacters(charRes);
      if (sRes.success) setSeriesList(sRes.data);
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

  const handleSelectCharacter = (char: Character) => {
    setSelectedCharacter(char);
    setFormData(char);
    setIsEditing(false);
    setIsCreating(false);
    setGeneratedSheetPrompt(null);
    setVoiceTestAudio(null);
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

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:scale-102 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Create Character
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
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
            <span className="text-comic-yellow">Design Locked ({characters.filter((c) => c.isLocked).length})</span>
          </div>

          <div className="space-y-3">
            {characters.map((char) => {
              const isSelected = selectedCharacter?.id === char.id;
              return (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-studio-900 border-comic-yellow shadow-md shadow-amber-500/10"
                      : "bg-studio-900/60 border-studio-800 hover:border-studio-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-comic-purple flex items-center justify-center font-black text-studio-950 text-base shadow-sm">
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
                          ? "bg-amber-500/10 border-amber-500/30 text-comic-yellow"
                          : "bg-studio-800 border-studio-700 text-studio-400"
                      }`}
                    >
                      {char.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-studio-300 mt-3 line-clamp-2 leading-relaxed">
                    {char.clothing}
                  </p>

                  <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] text-studio-400">
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
            <form onSubmit={handleSaveCharacter} className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-studio-800">
                <h3 className="text-lg font-black text-white">
                  {isCreating ? "Add New Bible Character" : `Edit ${selectedCharacter?.name}`}
                </h3>
                <span className="text-xs text-comic-yellow font-bold">16 Stored Consistency Anchors</span>
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
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    value={formData.age || 24}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
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
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Skin Tone</label>
                  <input
                    type="text"
                    value={formData.skinTone || ""}
                    onChange={(e) => setFormData({ ...formData, skinTone: e.target.value })}
                    placeholder="e.g. Deep warm bronze brown"
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Body Type</label>
                  <input
                    type="text"
                    value={formData.bodyType || ""}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                    placeholder="e.g. Athletic lean build, 5ft 11in"
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
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
                  className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
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
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-studio-300 uppercase mb-1">Speech Style</label>
                  <input
                    type="text"
                    value={formData.speechStyle || ""}
                    onChange={(e) => setFormData({ ...formData, speechStyle: e.target.value })}
                    placeholder="e.g. Fast-paced witty humor, tech jargon"
                    className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
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
                  className="w-full bg-studio-950 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-studio-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-studio-850 hover:bg-studio-800 text-xs font-bold text-studio-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 text-xs font-black"
                >
                  Save Character Anchor
                </button>
              </div>
            </form>
          ) : selectedCharacter ? (
            /* Character Detail View */
            <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
              {/* Header and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-800">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-comic-purple flex items-center justify-center font-black text-studio-950 text-2xl shadow-lg">
                    {selectedCharacter.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">{selectedCharacter.name}</h2>
                      {selectedCharacter.isLocked ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-comic-yellow border border-amber-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Design Locked
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-studio-800 text-studio-400 border border-studio-700">
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
                    className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-studio-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(selectedCharacter.id)}
                    className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-studio-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleToggleLock(selectedCharacter.id)}
                    className="p-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-comic-yellow text-xs font-bold flex items-center gap-1.5"
                  >
                    {selectedCharacter.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {selectedCharacter.isLocked ? "Unlock" : "Lock Design"}
                  </button>
                </div>
              </div>

              {/* Physical Appearance Anchors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Hairstyle</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedCharacter.hairstyle}</div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Skin Tone</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedCharacter.skinTone}</div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Body Type</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedCharacter.bodyType}</div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Voice Profile</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedCharacter.voice?.gender} ({selectedCharacter.voice?.tone})</div>
                </div>
              </div>

              {/* Wardrobe Specification */}
              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-1">
                <div className="text-[11px] font-bold text-comic-yellow uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Locked Wardrobe Continuity Anchor
                </div>
                <div className="text-xs text-studio-200 leading-relaxed font-mono">
                  {selectedCharacter.clothing}
                </div>
              </div>

              {/* Voice Testing Box */}
              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    className="px-4 py-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-xs font-bold text-comic-purple flex items-center gap-2"
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
              <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 space-y-3">
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
                    className="px-4 py-1.5 rounded-xl bg-comic-cyan/10 hover:bg-comic-cyan/20 border border-comic-cyan/30 text-xs font-bold text-comic-cyan flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Turnaround Prompt
                  </button>
                </div>

                {generatedSheetPrompt && (
                  <div className="p-3 rounded-lg bg-studio-900 border border-cyan-500/30 text-xs text-studio-300 font-mono leading-relaxed">
                    <div className="text-[10px] uppercase font-bold text-comic-cyan mb-1">
                      Ready for Fal / Flux / DALL-E / Runway Keyframe:
                    </div>
                    {generatedSheetPrompt}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-2xl border border-dashed border-studio-800 flex flex-col items-center justify-center text-studio-500 text-xs">
              <User className="w-8 h-8 mb-2 opacity-50" />
              Select a character to view anchors or click Create Character
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

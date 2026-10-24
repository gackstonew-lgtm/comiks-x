"use client";

import { useState, useEffect } from "react";
import {
  Mic,
  Music,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Download,
  Loader2,
  Sliders,
  CheckCircle2,
  Radio,
  FileAudio,
} from "lucide-react";
import { MediaAsset } from "@/types";

export default function VoiceMusicStudioPage() {
  const [activeTab, setActiveTab] = useState<"tts" | "sfx" | "music">("tts");
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("sheng-comic-1");
  const [stability, setStability] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [applyShengPhonetics, setApplyShengPhonetics] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // Audio Playback
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // SFX and Music libraries from API
  const [sfxList, setSfxList] = useState<any[]>([]);
  const [musicList, setMusicList] = useState<any[]>([]);
  const [recentAudio, setRecentAudio] = useState<MediaAsset[]>([]);

  // Ducking Settings
  const [duckingDepth, setDuckingDepth] = useState(-18);
  const [broadcastLufs, setBroadcastLufs] = useState(true);

  useEffect(() => {
    fetchAudioStudioData();
  }, []);

  const fetchAudioStudioData = async () => {
    try {
      const res = await fetch("/api/voice-music");
      const data = await res.json();
      if (data.success) {
        setSfxList(data.sfxLibrary || []);
        setMusicList(data.musicLibrary || []);
        setRecentAudio(data.recentAudio || []);
      }
      const bRes = await fetch("/api/billing");
      const bData = await bRes.json();
      if (bData.success) {
        setCredits(bData.billing?.creditsRemaining ?? 250);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayAudio = (id: string, url: string) => {
    if (audioElement) {
      audioElement.pause();
    }

    if (playingId === id) {
      setPlayingId(null);
      return;
    }

    const audio = new Audio(url);
    audio.play();
    setAudioElement(audio);
    setPlayingId(id);
    audio.onended = () => setPlayingId(null);
  };

  const handleGenerateTTS = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/voice-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tts",
          text,
          voice,
          stability,
          speed,
          applyShengPhonetics,
          duckingDepth,
          loudnessLufs: broadcastLufs ? -14 : -16,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRecentAudio((prev) => [data.asset, ...prev]);
        setCredits(data.creditsRemaining);
        setStatusMessage(
          `Voice synthesized! ${data.processedText !== text ? `(Applied Sheng phonetics: "${data.processedText}")` : ""}`
        );
      } else {
        alert(data.error || "Generation failed");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            Voice & Music Studio
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Dialogue, Sound Effects & Music
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Multilingual dialogue synthesis, Sheng dialect phonetic processing, comic SFX, and automated -18 dB voice ducking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-[6px] bg-[#1a1a1a] border border-[#2e2e2e] flex items-center gap-2 text-xs">
            <span className="text-[#a0a0a0]">Balance:</span>
            <span className="font-semibold text-brand">
              {credits !== null ? `${credits} credits` : "Loading..."}
            </span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2e2e2e] pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("tts")}
          className={`px-4 py-2 rounded-[6px] transition-colors flex items-center gap-2 ${
            activeTab === "tts"
              ? "bg-[#1f2822] text-brand border border-brand/40 font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          Text to Speech & Sheng
        </button>
        <button
          onClick={() => setActiveTab("sfx")}
          className={`px-4 py-2 rounded-[6px] transition-colors flex items-center gap-2 ${
            activeTab === "sfx"
              ? "bg-[#1f2822] text-brand border border-brand/40 font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Cartoon SFX Library
        </button>
        <button
          onClick={() => setActiveTab("music")}
          className={`px-4 py-2 rounded-[6px] transition-colors flex items-center gap-2 ${
            activeTab === "music"
              ? "bg-[#1f2822] text-brand border border-brand/40 font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Background Music & Ducking
        </button>
      </div>

      {/* Tab 1: TTS */}
      {activeTab === "tts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#a0a0a0] font-medium block">
                  Dialogue Script (Supports English, Swahili & Sheng)
                </label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="e.g. Niaje buda! Leo form ni gani Nairobi? Hii movie lazima iive!"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] p-3 text-xs leading-relaxed focus:outline-none focus:border-brand placeholder-[#555]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                    Voice Actor
                  </label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="sheng-comic-1">Kip (Sheng Comic Male)</option>
                    <option value="swahili-narrator">Amina (Swahili Storyteller Female)</option>
                    <option value="deep-trailer">Goliath (Action Trailer Narrator)</option>
                    <option value="comic-sidekick">Oti (High-pitched Comedic Sidekick)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                    Speed ({speed}x)
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full accent-brand bg-[#2e2e2e] mt-2"
                  />
                </div>
              </div>

              {/* Sheng Phonetics Toggle */}
              <div className="p-3 rounded-[6px] bg-[#181818] border border-[#2e2e2e] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#ededed]">
                    Sheng Phonetic Normalizer
                  </h4>
                  <p className="text-[11px] text-[#888]">
                    Applies Nairobi slang phonetic markers for natural pronunciation
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={applyShengPhonetics}
                  onChange={(e) => setApplyShengPhonetics(e.target.checked)}
                  className="accent-brand rounded"
                />
              </div>

              <button
                onClick={handleGenerateTTS}
                disabled={isGenerating || !text.trim()}
                className="w-full py-2.5 px-4 rounded-[6px] bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#09090b] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Audio Track...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Voice Track (1 Credit)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Audio History */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
              Generated Audio Takes ({recentAudio.length})
            </h3>
            <div className="space-y-2">
              {recentAudio.length === 0 ? (
                <div className="p-6 rounded-[8px] bg-[#141414] border border-[#2e2e2e] text-center text-xs text-[#666]">
                  No audio takes generated yet.
                </div>
              ) : (
                recentAudio.map((track) => (
                  <div
                    key={track.id}
                    className="p-3 rounded-[6px] bg-[#141414] border border-[#2e2e2e] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlayAudio(track.id, track.url)}
                        className="w-8 h-8 rounded-full bg-brand/10 border border-brand/30 text-brand flex items-center justify-center hover:bg-brand/20 transition-colors"
                      >
                        {playingId === track.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div>
                        <p className="text-xs font-medium text-[#ededed] truncate max-w-[240px]">
                          {track.name}
                        </p>
                        <p className="text-[10px] text-[#888]">{track.duration} • {track.size}</p>
                      </div>
                    </div>
                    <a
                      href={track.url}
                      download
                      className="p-1.5 rounded-[4px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1 border border-[#2e2e2e]"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SFX Library */}
      {activeTab === "sfx" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sfxList.map((sfx) => (
              <div
                key={sfx.id}
                className="p-4 rounded-[8px] bg-[#141414] border border-[#2e2e2e] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayAudio(sfx.id, sfx.url)}
                    className="w-9 h-9 rounded-full bg-brand/10 border border-brand/30 text-brand flex items-center justify-center hover:bg-brand/20 transition-colors"
                  >
                    {playingId === sfx.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                  <div>
                    <h4 className="text-xs font-bold text-[#ededed]">{sfx.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-[#888] mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#222] text-brand">
                        {sfx.category}
                      </span>
                      <span>{sfx.duration}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={sfx.url}
                  download
                  className="p-1.5 rounded-[4px] bg-[#1e1e1e] text-[#ededed] hover:bg-[#282828] border border-[#2e2e2e]"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Music & Ducking */}
      {activeTab === "music" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
              Royalty-Free Comedy & African Beats
            </h3>
            <div className="space-y-3">
              {musicList.map((track) => (
                <div
                  key={track.id}
                  className="p-4 rounded-[8px] bg-[#141414] border border-[#2e2e2e] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayAudio(track.id, track.url)}
                      className="w-9 h-9 rounded-full bg-brand/10 border border-brand/30 text-brand flex items-center justify-center hover:bg-brand/20 transition-colors"
                    >
                      {playingId === track.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-[#ededed]">{track.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-[#888] mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#222] text-[#ccc]">
                          {track.genre}
                        </span>
                        <span>{track.bpm} BPM</span>
                        <span>{track.duration}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={track.url}
                    download
                    className="p-1.5 rounded-[4px] bg-[#1e1e1e] text-[#ededed] hover:bg-[#282828] border border-[#2e2e2e]"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Ducking & Master Output Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-4">
              <h3 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-brand" />
                Broadcast Audio Ducking & Mastering
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#a0a0a0]">
                  <span>Dialogue Ducking Depth</span>
                  <span className="font-semibold text-brand">{duckingDepth} dB</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="-6"
                  step="1"
                  value={duckingDepth}
                  onChange={(e) => setDuckingDepth(Number(e.target.value))}
                  className="w-full accent-brand bg-[#2e2e2e]"
                />
                <p className="text-[11px] text-[#666]">
                  Automatically lowers background music volume whenever a character speaks.
                </p>
              </div>

              <div className="p-3 rounded-[6px] bg-[#181818] border border-[#2e2e2e] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#ededed]">
                    Target -14 LUFS Loudness
                  </h4>
                  <p className="text-[11px] text-[#888]">
                    Mastering level for YouTube, TikTok & Reels
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={broadcastLufs}
                  onChange={(e) => setBroadcastLufs(e.target.checked)}
                  className="accent-brand rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

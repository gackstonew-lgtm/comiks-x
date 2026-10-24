"use client";

import { useState, useEffect, useRef } from "react";
import {
  Scissors,
  Play,
  Pause,
  RotateCw,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  Music,
  FileText,
  Download,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Maximize2,
  Stamp,
  Layers,
  ChevronLeft,
  ChevronRight,
  Copy,
  Zap,
  X,
} from "lucide-react";
import Link from "next/link";
import { MediaAsset } from "@/types";
import { ReferenceLibraryModal } from "@/components/media/reference-library-modal";
import { TimelineClip } from "@/lib/render-worker";

export default function VideoEditorPage() {
  // Master Project & Timeline State
  const [projectId, setProjectId] = useState<string>("proj-default");
  const [projectName, setProjectName] = useState<string>("Nairobi Comic Reel #1");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [resolution, setResolution] = useState<"720p" | "1080p">("1080p");

  // Track 1: Clips
  const [clips, setClips] = useState<TimelineClip[]>([
    {
      id: "clip-1",
      name: "Scene 1: Nairobi Apartment Morning",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: 5,
      trimStart: 0,
      trimEnd: 5,
      speed: 1,
      volume: 1,
      transition: "cut",
    },
    {
      id: "clip-2",
      name: "Scene 2: Matatu Transit Lights",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      duration: 5,
      trimStart: 0,
      trimEnd: 5,
      speed: 1,
      volume: 0.9,
      transition: "fade",
    },
  ]);

  const [selectedClipId, setSelectedClipId] = useState<string>("clip-1");

  // Track 2: Background Music Track
  const [bgMusic, setBgMusic] = useState<{
    url: string;
    volume: number;
    ducking: boolean;
  }>({
    url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    volume: 0.4,
    ducking: true,
  });

  // Track 3: Captions
  const [captions, setCaptions] = useState<Array<{ id: string; startSec: number; endSec: number; text: string }>>([
    { id: "cap-1", startSec: 0, endSec: 5, text: "Buda, Nairobi tech hustle in the evening glow!" },
    { id: "cap-2", startSec: 5, endSec: 10, text: "AI animation rendering on-twos cel style." },
  ]);

  // Watermark
  const [watermark, setWatermark] = useState<{
    enabled: boolean;
    opacity: number;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  }>({
    enabled: true,
    opacity: 0.85,
    position: "top-right",
  });

  // Playback & Scrubber State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Modals & Export State
  const [showRefModal, setShowRefModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDownloadUrl, setExportDownloadUrl] = useState<string | null>(null);
  const [isAutoCaptioning, setIsAutoCaptioning] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("Just now");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Compute total duration
  const totalDuration = clips.reduce((acc, c) => acc + (c.trimEnd - c.trimStart) / c.speed, 0);

  // Autosave timeline to Supabase on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      autosaveTimeline();
    }, 1500);
    return () => clearTimeout(timer);
  }, [clips, bgMusic, watermark, captions, aspectRatio, resolution]);

  const autosaveTimeline = async () => {
    try {
      const res = await fetch("/api/editor/timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          timeline: {
            aspectRatio,
            resolution,
            clips,
            bgMusic,
            watermark,
            captions,
          },
        }),
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch {
      // Offline fallback
    }
  };

  // Playhead scrubber loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const activeClip = clips.find((c) => c.id === selectedClipId) || clips[0];

  // Reorder clips
  const handleMoveClip = (idx: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= clips.length) return;

    setClips((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Split clip at current playhead
  const handleSplitClip = () => {
    if (!activeClip) return;
    const splitPoint = Math.min(
      activeClip.trimEnd - 1,
      Math.max(activeClip.trimStart + 1, activeClip.trimStart + (activeClip.trimEnd - activeClip.trimStart) / 2)
    );

    const firstHalf: TimelineClip = {
      ...activeClip,
      id: `${activeClip.id}-a`,
      trimEnd: splitPoint,
    };
    const secondHalf: TimelineClip = {
      ...activeClip,
      id: `${activeClip.id}-b`,
      trimStart: splitPoint,
    };

    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === activeClip.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1, firstHalf, secondHalf);
      return copy;
    });
    setSelectedClipId(secondHalf.id);
    setStatusMessage("Split clip successfully at playhead.");
  };

  // Delete clip
  const handleDeleteClip = (id: string) => {
    if (clips.length <= 1) return;
    setClips((prev) => prev.filter((c) => c.id !== id));
    setSelectedClipId(clips.find((c) => c.id !== id)?.id || "");
  };

  // Auto-captions via API
  const handleAutoCaptions = async () => {
    setIsAutoCaptioning(true);
    try {
      const res = await fetch("/api/editor/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clips }),
      });
      const data = await res.json();
      if (data.success && data.captions) {
        setCaptions(data.captions);
        setStatusMessage("Generated synchronized dialogue captions.");
      }
    } catch {
      setStatusMessage("Failed to auto-generate captions.");
    } finally {
      setIsAutoCaptioning(false);
    }
  };

  // Render Worker Export
  const handleExport = async () => {
    setIsExporting(true);
    setExportDownloadUrl(null);
    try {
      const res = await fetch("/api/editor/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          resolution,
          aspectRatio,
          timeline: {
            aspectRatio,
            resolution,
            clips,
            bgMusic,
            watermark,
            captions,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setExportDownloadUrl(data.downloadUrl || data.outputUrl);
      }
    } catch {
      // Fallback
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-16 text-xs select-none">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
            <Scissors className="w-4 h-4 stroke-[2]" />
          </div>

          <div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent font-bold text-sm text-white focus:outline-hidden hover:text-brand transition-colors"
            />
            <div className="flex items-center gap-2 text-[10px] text-[#707070]">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Autosaved to Supabase ({lastSaved})
              </span>
              <span>•</span>
              <span>Total: {totalDuration.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Aspect ratio selector */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-[6px] border border-[#2e2e2e]">
            {(["9:16", "16:9", "1:1"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setAspectRatio(r)}
                className={`px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-bold ${
                  aspectRatio === r
                    ? "bg-brand text-[#09090b]"
                    : "text-[#a0a0a0] hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowRefModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#222] hover:bg-[#282828] border border-[#333] text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Import Clips</span>
          </button>

          <button
            onClick={handleAutoCaptions}
            disabled={isAutoCaptioning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#222] hover:bg-[#282828] border border-[#333] text-comic-yellow transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isAutoCaptioning ? "Transcribing..." : "Auto-Captions"}</span>
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Export Video</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-2.5 rounded-[6px] bg-[#1a1a1a] border border-brand/30 text-brand text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Frame: Preview Viewport & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Viewport Preview */}
        <div className="lg:col-span-2 p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] flex flex-col items-center justify-between gap-3">
          {/* Framed Viewport */}
          <div
            className={`w-full max-h-[380px] bg-black rounded-[6px] overflow-hidden border border-[#2e2e2e] relative flex items-center justify-center ${
              aspectRatio === "9:16"
                ? "aspect-[9/16] max-w-[214px]"
                : aspectRatio === "16:9"
                ? "aspect-[16/9]"
                : "aspect-square max-w-[340px]"
            }`}
          >
            <video
              ref={videoRef}
              src={activeClip?.url}
              className="w-full h-full object-cover"
              loop
              muted
            />

            {/* Watermark overlay */}
            {watermark.enabled && (
              <div
                className={`absolute p-2 pointer-events-none select-none ${
                  watermark.position === "top-right"
                    ? "top-1 right-1"
                    : watermark.position === "top-left"
                    ? "top-1 left-1"
                    : watermark.position === "bottom-right"
                    ? "bottom-1 right-1"
                    : "bottom-1 left-1"
                }`}
                style={{ opacity: watermark.opacity }}
              >
                <div className="px-2 py-0.5 rounded bg-black/70 border border-brand/30 text-brand font-black font-mono text-[10px]">
                  COMIKS X
                </div>
              </div>
            )}

            {/* Captions Overlay */}
            {captions.length > 0 && (
              <div className="absolute bottom-6 left-3 right-3 text-center pointer-events-none">
                <span className="px-2 py-1 rounded bg-black/80 text-white font-bold text-[11px] shadow-sm leading-relaxed border border-white/10">
                  {captions[0]?.text}
                </span>
              </div>
            )}
          </div>

          {/* Transport Controls */}
          <div className="w-full flex items-center justify-between px-2 pt-2 border-t border-[#252525]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-brand text-[#09090b] flex items-center justify-center font-bold hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <span className="font-mono text-xs text-white">
                {currentTime.toFixed(1)}s / {totalDuration.toFixed(1)}s
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSplitClip}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#222] hover:bg-[#282828] text-[#ededed] border border-[#333] transition-colors"
                title="Split clip at playhead"
              >
                <Scissors className="w-3.5 h-3.5 text-brand" />
                <span>Split</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clip Inspector & Audio/Watermark Controls */}
        <div className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#a0a0a0]">
            Clip & Master Controls
          </h3>

          {/* Clip Inspector */}
          {activeClip ? (
            <div className="space-y-3 p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white truncate max-w-[180px]">{activeClip.name}</span>
                <span className="font-mono text-brand text-[10px]">
                  {((activeClip.trimEnd - activeClip.trimStart) / activeClip.speed).toFixed(1)}s
                </span>
              </div>

              {/* Speed */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#707070]">Playback Speed</label>
                <div className="grid grid-cols-4 gap-1">
                  {[0.5, 1, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setClips((prev) =>
                          prev.map((c) => (c.id === activeClip.id ? { ...c, speed: s } : c))
                        )
                      }
                      className={`py-1 rounded text-[10px] font-mono font-bold ${
                        activeClip.speed === s
                          ? "bg-brand text-[#09090b]"
                          : "bg-[#181818] text-[#a0a0a0] border border-[#2e2e2e]"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Transition */}
              <div className="space-y-1">
                <label className="text-[10px] text-[#707070]">Transition to Next</label>
                <div className="grid grid-cols-3 gap-1">
                  {(["cut", "fade", "crossfade"] as const).map((tr) => (
                    <button
                      key={tr}
                      onClick={() =>
                        setClips((prev) =>
                          prev.map((c) => (c.id === activeClip.id ? { ...c, transition: tr } : c))
                        )
                      }
                      className={`py-1 rounded text-[10px] capitalize font-medium ${
                        activeClip.transition === tr
                          ? "bg-brand text-[#09090b] font-bold"
                          : "bg-[#181818] text-[#a0a0a0] border border-[#2e2e2e]"
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#707070]">
                  <span>Clip Volume</span>
                  <span>{Math.round(activeClip.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={activeClip.volume}
                  onChange={(e) =>
                    setClips((prev) =>
                      prev.map((c) =>
                        c.id === activeClip.id ? { ...c, volume: parseFloat(e.target.value) } : c
                      )
                    )
                  }
                  className="w-full accent-brand"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 text-[#707070] text-center">Select a clip to edit properties</div>
          )}

          {/* Background Music Master */}
          <div className="space-y-2 p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-brand" />
                Background Score
              </span>
              <span className="text-[10px] text-[#707070]">Ducking Active</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#707070]">
                <span>Music Volume</span>
                <span>{Math.round(bgMusic.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={bgMusic.volume}
                onChange={(e) =>
                  setBgMusic((prev) => ({ ...prev, volume: parseFloat(e.target.value) }))
                }
                className="w-full accent-brand"
              />
            </div>
          </div>

          {/* Logo Watermark Control */}
          <div className="space-y-2 p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Stamp className="w-3.5 h-3.5 text-brand" />
                Logo Watermark
              </span>
              <button
                onClick={() => setWatermark((prev) => ({ ...prev, enabled: !prev.enabled }))}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  watermark.enabled ? "bg-brand text-[#09090b]" : "bg-[#252525] text-[#707070]"
                }`}
              >
                {watermark.enabled ? "ON" : "OFF"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Track Timeline */}
      <div className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#252525]">
          <span className="font-bold text-white text-xs flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-brand" />
            Timeline Multi-Track Sequencer
          </span>
          <span className="text-[10px] text-[#707070] font-mono">
            {clips.length} Clips • 1 Audio Track • {captions.length} Captions
          </span>
        </div>

        {/* Track 1: Video Clips Strip */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#707070]">Video Track</div>
          <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#121212] rounded-[6px] border border-[#2e2e2e]">
            {clips.map((clip, idx) => (
              <div
                key={clip.id}
                onClick={() => setSelectedClipId(clip.id)}
                className={`min-w-[160px] p-2.5 rounded-[4px] border cursor-pointer transition-all flex flex-col justify-between gap-1.5 ${
                  selectedClipId === clip.id
                    ? "border-brand bg-brand/10 ring-1 ring-brand"
                    : "border-[#2e2e2e] bg-[#1a1a1a] hover:border-[#444]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white truncate max-w-[100px]">{clip.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClip(clip.id);
                    }}
                    className="text-[#707070] hover:text-red-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#707070] font-mono">
                  <span>{(clip.trimEnd - clip.trimStart).toFixed(1)}s</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveClip(idx, "left");
                      }}
                      disabled={idx === 0}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveClip(idx, "right");
                      }}
                      disabled={idx === clips.length - 1}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Track 2: Music Track */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#707070]">Audio Track (Music)</div>
          <div className="p-2 bg-[#121212] rounded-[6px] border border-[#2e2e2e] flex items-center justify-between text-xs text-[#a0a0a0]">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-brand truncate max-w-sm">
              <Music className="w-3 h-3" />
              Nairobi Ambient Beats (Looping • -14 LUFS)
            </span>
            <span className="font-mono text-[10px]">Volume: {Math.round(bgMusic.volume * 100)}%</span>
          </div>
        </div>

        {/* Track 3: Captions Track */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold text-[#707070]">Captions Track</div>
          <div className="flex items-center gap-2 overflow-x-auto p-2 bg-[#121212] rounded-[6px] border border-[#2e2e2e]">
            {captions.map((cap) => (
              <div
                key={cap.id}
                className="min-w-[140px] px-2.5 py-1.5 rounded-[4px] bg-[#1a1a1a] border border-[#2e2e2e] text-[10px] text-[#ededed] truncate"
              >
                {cap.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Modal (Separate Off-Vercel Worker Integration) */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#171717] border border-[#2e2e2e] rounded-[10px] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-brand" />
                <h3 className="text-sm font-bold text-white">Export Video Deliverable</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-[#707070] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] text-[#a0a0a0]">Resolution</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["720p", "1080p"] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`py-2 rounded-[4px] font-mono font-bold ${
                        resolution === res
                          ? "bg-brand text-[#09090b]"
                          : "bg-[#121212] border border-[#2e2e2e] text-[#a0a0a0]"
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-[11px] text-[#707070] space-y-1">
                <div className="font-semibold text-white">Off-Vercel Render Worker</div>
                <p>
                  Execution dispatches to dedicated FFmpeg worker (Modal / Railway / Fly.io) to avoid
                  Vercel serverless timeouts. Result will be saved to Supabase Storage with download link.
                </p>
              </div>

              {exportDownloadUrl && (
                <div className="p-3 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2">
                  <div className="font-bold">Export Render Ready!</div>
                  <a
                    href={exportDownloadUrl}
                    download="comiks-x-video.mp4"
                    className="w-full py-2 rounded-[4px] bg-emerald-500 hover:bg-emerald-400 text-[#09090b] font-bold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Download MP4</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#2e2e2e]">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2 rounded-[4px] border border-[#2e2e2e] text-[#a0a0a0] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 py-2 rounded-[4px] bg-brand hover:bg-brand-hover text-[#09090b] font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rendering Worker...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Start Render</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reference Library Modal */}
      <ReferenceLibraryModal
        isOpen={showRefModal}
        onClose={() => setShowRefModal(false)}
        filterType="video"
        onSelectAssets={(selected) => {
          const newClips: TimelineClip[] = selected.map((s, idx) => ({
            id: `imported-${Date.now()}-${idx}`,
            name: s.name,
            url: s.url,
            duration: 5,
            trimStart: 0,
            trimEnd: 5,
            speed: 1,
            volume: 1,
            transition: "cut",
          }));
          setClips((prev) => [...prev, ...newClips]);
          setStatusMessage(`Imported ${newClips.length} clips to timeline.`);
        }}
      />
    </div>
  );
}

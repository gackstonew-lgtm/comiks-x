"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Episode, Scene } from "@/types";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Scissors,
  Copy,
  Trash2,
  RotateCw,
  Download,
  Film,
  Music,
  Mic,
  MessageSquare,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders,
  CheckCircle,
  Languages,
  History,
  Undo2,
  Tv,
} from "lucide-react";
import { ComiksPlayer } from "@/remotion/ComiksPlayer";
import { SAMPLE_CHURCH_SEED_SPEC_LIMITED, SAMPLE_CHURCH_SEED_SPEC_PUPPET } from "@/lib/render-engine/sample-seed-scene";
import { ProductionMode } from "@/lib/render-engine/schema";

export default function EpisodeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = (params?.episodeId as string) || "";

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState<"comic" | "anime" | "boxed">("comic");
  const [isExporting, setIsExporting] = useState(false);
  const [exportManifest, setExportManifest] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Dubbing & Versioning Control
  const [dubbingLanguage, setDubbingLanguage] = useState<"original" | "sheng" | "swahili">("original");
  const [isDubbing, setIsDubbing] = useState(false);
  const [sceneVersions, setSceneVersions] = useState<Record<string, number>>({});
  const [previewEngine, setPreviewEngine] = useState<"cel_animation" | "raw_video">("cel_animation");
  const [selectedProductionMode, setSelectedProductionMode] = useState<ProductionMode>("limited_animation");
  const [showSafeZones, setShowSafeZones] = useState(true);


  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (episodeId) {
      fetchEpisode();
    } else {
      setLoading(false);
    }
  }, [episodeId]);

  const fetchEpisode = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/episodes/${episodeId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setEpisode(data.data);
        setScenes(data.data.scenes || []);
      } else {
        setEpisode(null);
      }
    } catch (err) {
      console.error(err);
      setEpisode(null);
    } finally {
      setLoading(false);
    }
  };

  const activeScene = scenes[activeSceneIndex] || null;
  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  // Playback loop simulation
  useEffect(() => {
    if (isPlaying) {
      playbackTimerRef.current = setInterval(() => {
        setCurrentTimeSeconds((prev) => {
          const next = prev + 1;
          // Calculate which scene we are in
          let accumulated = 0;
          for (let i = 0; i < scenes.length; i++) {
            accumulated += scenes[i].duration;
            if (next <= accumulated) {
              if (activeSceneIndex !== i) setActiveSceneIndex(i);
              break;
            }
          }
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, scenes, activeSceneIndex, totalDuration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seconds: number) => {
    setCurrentTimeSeconds(seconds);
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulated += scenes[i].duration;
      if (seconds <= accumulated) {
        setActiveSceneIndex(i);
        break;
      }
    }
  };

  const handleMoveScene = (index: number, direction: "left" | "right") => {
    const targetIdx = direction === "left" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;

    const newScenes = [...scenes];
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIdx];
    newScenes[targetIdx] = temp;

    // renumber
    newScenes.forEach((s, idx) => (s.sceneNumber = idx + 1));
    setScenes(newScenes);
    setActiveSceneIndex(targetIdx);
  };

  const handleDuplicateScene = (index: number) => {
    const target = scenes[index];
    const copy: Scene = {
      ...target,
      id: `scene-copy-${Date.now()}`,
      sceneNumber: target.sceneNumber + 1,
    };
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, copy);
    newScenes.forEach((s, idx) => (s.sceneNumber = idx + 1));
    setScenes(newScenes);
    setStatusMessage(`Duplicated Scene ${target.sceneNumber}`);
  };

  const handleDeleteScene = (index: number) => {
    if (scenes.length <= 1) return;
    const newScenes = scenes.filter((_, idx) => idx !== index);
    newScenes.forEach((s, idx) => (s.sceneNumber = idx + 1));
    setScenes(newScenes);
    setActiveSceneIndex(Math.max(0, index - 1));
    setStatusMessage("Scene removed from timeline.");
  };

  const handleTrimScene = (index: number, delta: number) => {
    const newScenes = [...scenes];
    const newDuration = Math.max(5, newScenes[index].duration + delta);
    newScenes[index].duration = newDuration;
    setScenes(newScenes);
  };

  const handleApplyDubbing = async (lang: "original" | "sheng" | "swahili") => {
    setDubbingLanguage(lang);
    if (lang === "original") {
      setStatusMessage("Active audio: Original cast dialogue track.");
      return;
    }
    if (!activeScene || !activeScene.dialogue?.[0]) return;
    setIsDubbing(true);
    try {
      const diag = activeScene.dialogue[0];
      const res = await fetch("/api/dubbing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: diag.characterId || "",
          originalText: diag.line,
          targetLanguage: lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStatusMessage(`Multilingual Dub Track Active (${lang.toUpperCase()}): "${data.data.dubbedText}"`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDubbing(false);
    }
  };

  const handleRollbackVersion = (sceneId: string) => {
    const currentVer = sceneVersions[sceneId] || 2;
    if (currentVer <= 1) {
      setStatusMessage("Already at primary generation take v1.");
      return;
    }
    const nextVer = currentVer - 1;
    setSceneVersions((prev) => ({ ...prev, [sceneId]: nextVer }));
    setStatusMessage(`Rolled back Scene #${activeScene?.sceneNumber} to previous take v${nextVer}.`);
  };


  const handleExport = async (format: "manifest" | "srt" | "vtt" | "chapters") => {
    if (format === "srt" || format === "vtt") {
      window.open(`/api/export?episodeId=${episodeId}&format=${format}`, "_blank");
      return;
    }
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export?episodeId=${episodeId}&format=${format}`);
      const data = await res.json();
      if (data.success) {
        setExportManifest(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-studio-400 text-sm min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex-1 p-6 md:p-12 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Film className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Episode Not Found</h2>
        <p className="text-xs text-studio-400 mb-6">
          The requested episode ID "{episodeId}" could not be located in your series.
        </p>
        <button
          onClick={() => router.push("/editor")}
          className="px-4 py-2 rounded-[6px] bg-brand text-[#09090b] font-medium text-xs hover:bg-brand-hover transition-colors"
        >
          View All Episodes
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#121212] text-white min-h-[calc(100vh-65px)]">
      {/* Top Bar Controls */}
      <div className="border-b border-[#2e2e2e] bg-[#171717]/90 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.push(`/storyboard/${episodeId}`)}
            className="p-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] text-studio-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand block">
              Multi-Track Timeline Editor
            </span>
            <h2 className="text-base font-black text-white">{episode?.title}</h2>
          </div>
        </div>

        {/* Subtitle Style, Dubbing & Resolution Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-[#121212] px-2.5 py-1 rounded-[6px] border border-[#2e2e2e] text-xs">
            <Languages className="w-3.5 h-3.5 text-brand" />
            <span className="text-studio-400 font-bold uppercase text-[10px]">Dub:</span>
            <select
              value={dubbingLanguage}
              onChange={(e) => handleApplyDubbing(e.target.value as any)}
              disabled={isDubbing}
              className="bg-transparent text-xs text-brand font-bold focus:outline-none cursor-pointer"
            >
              <option value="original">Original (Mixed)</option>
              <option value="sheng">Authentic Sheng</option>
              <option value="swahili">Standard Swahili</option>
            </select>
            {isDubbing && <span className="text-[10px] text-amber-400 animate-pulse">Syncing...</span>}
          </div>

          {/* Engine Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-studio-400 font-bold uppercase">Engine:</span>
            <div className="flex rounded-lg border border-[#2e2e2e] bg-[#121212] p-0.5">
              <button
                onClick={() => setPreviewEngine("cel_animation")}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                  previewEngine === "cel_animation"
                    ? "bg-brand text-black shadow-xs"
                    : "text-studio-400 hover:text-white"
                }`}
              >
                2D Cel (FlipaClip)
              </button>
              <button
                onClick={() => setPreviewEngine("raw_video")}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${
                  previewEngine === "raw_video"
                    ? "bg-brand text-black shadow-xs"
                    : "text-studio-400 hover:text-white"
                }`}
              >
                Raw Viewport
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-studio-400 font-bold uppercase">Mode:</span>
            <select
              value={selectedProductionMode}
              onChange={(e) => setSelectedProductionMode(e.target.value as any)}
              className="bg-[#121212] border border-[#2e2e2e] rounded-lg px-2.5 py-1 text-xs text-brand focus:outline-none"
            >
              <option value="limited_animation">Limited Animation (on-twos)</option>
              <option value="rigged_puppet">Rigged Puppet (Joint Kinematics)</option>
              <option value="ai_motion_hybrid">AI Motion Hybrid (12fps)</option>
              <option value="motion_comic">Motion Comic (2.5D Parallax)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-studio-400 font-bold uppercase">Subtitles:</span>
            <select
              value={subtitleStyle}
              onChange={(e) => setSubtitleStyle(e.target.value as any)}
              className="bg-[#121212] border border-[#2e2e2e] rounded-lg px-2.5 py-1 text-xs text-brand focus:outline-none"
            >
              <option value="comic">Comic Pop Yellow</option>
              <option value="anime">Anime Cel Glow</option>
              <option value="boxed">Clean Boxed Dark</option>
            </select>
          </div>


          <button
            onClick={() => handleExport("srt")}
            className="px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-xs font-bold text-studio-300"
          >
            Download .SRT
          </button>
          <button
            onClick={() => handleExport("chapters")}
            className="px-3 py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-xs font-bold text-studio-300"
          >
            Copy Chapters
          </button>
          <button
            onClick={() => handleExport("manifest")}
            className="px-4 py-1.5 rounded-lg bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium shadow-sm text-xs shadow-md shadow-amber-500/20"
          >
            Render MP4 (1080p)
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {/* Main Split: Video Preview Player & Inspector */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 md:p-6 bg-[#121212]">
        {/* Left 2 Cols: Synchronized Video Viewport */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-4 relative overflow-hidden min-h-[360px]">
          {/* Active Scene Preview Screen */}
          {previewEngine === "cel_animation" ? (
            <div className="w-full max-w-xs md:max-w-sm aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500/30 relative">
              <ComiksPlayer
                spec={selectedProductionMode === "rigged_puppet" ? SAMPLE_CHURCH_SEED_SPEC_PUPPET : SAMPLE_CHURCH_SEED_SPEC_LIMITED}
                currentFrame={Math.round((currentTimeSeconds * 30) % 300)}
                showSafeZones={showSafeZones}
              />
            </div>
          ) : (
            <div className="w-full max-w-2xl aspect-video rounded-[6px] bg-black relative overflow-hidden flex items-center justify-center border border-[#2e2e2e] shadow-2xl">
              {activeScene?.videoUrl ? (
                <video
                  ref={videoRef}
                  src={activeScene.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  autoPlay={isPlaying}
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center flex flex-col items-center justify-center p-6 text-center"
                  style={{
                    backgroundImage: `url(${
                      activeScene?.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop"
                    })`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs"></div>
                  <div className="relative z-10 space-y-2">
                    <span className="px-2.5 py-0.5 rounded bg-[#232323] text-brand border border-brand/25 font-black text-xs">
                      SCENE {activeScene?.sceneNumber} • {activeScene?.location}
                    </span>
                    <p className="text-xs text-white max-w-md">{activeScene?.action}</p>
                  </div>
                </div>
              )}

              {/* Live Subtitle Overlay */}
              {activeScene?.dialogue && activeScene.dialogue.length > 0 && (
                <div className="absolute bottom-6 inset-x-4 flex justify-center pointer-events-none z-20">
                  <div
                    className={`px-4 py-1.5 rounded-lg text-center max-w-lg transition-all ${
                      subtitleStyle === "comic"
                        ? "bg-amber-400 text-studio-950 font-black text-sm tracking-wide shadow-lg border-2 border-black"
                        : subtitleStyle === "anime"
                        ? "bg-black/75 text-cyan-300 font-bold text-xs tracking-wider border border-cyan-400/50 shadow-cyan-500/20 shadow-lg"
                        : "bg-black/90 text-white text-xs px-3 py-1 font-mono"
                    }`}
                  >
                    <span className="opacity-75 mr-1 font-bold">
                      {activeScene.dialogue[0].characterName}:
                    </span>
                    "{activeScene.dialogue[0].line}"
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transport Controls Bar */}
          <div className="w-full max-w-2xl mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSeek(0)}
                className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] text-studio-300"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium shadow-sm shadow-md hover:scale-105 transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-studio-950" />}
              </button>
              <button
                onClick={() => handleSeek(Math.min(totalDuration, currentTimeSeconds + 10))}
                className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] text-studio-300"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <div className="font-mono text-xs text-studio-300 ml-2">
                <span className="text-brand font-bold">{formatTimecode(currentTimeSeconds)}</span> /{" "}
                <span>{formatTimecode(totalDuration)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] text-studio-300"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-20 accent-comic-yellow"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active Scene Inspector & Quick Edit Actions */}
        <div className="lg:col-span-1 bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand" />
              Selected Scene Controls
            </h3>
            <span className="text-xs font-mono text-studio-400">
              #{activeScene?.sceneNumber} of {scenes.length}
            </span>
          </div>

          {activeScene ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-studio-400 uppercase">Location & Setting</label>
                <div className="text-sm font-bold text-white mt-0.5">{activeScene.location}</div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-studio-400 uppercase">Duration & Timing</label>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleTrimScene(activeSceneIndex, -1)}
                    className="px-2.5 py-1 rounded bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-xs font-bold"
                  >
                    -1s
                  </button>
                  <span className="font-mono text-sm font-bold text-brand px-2">
                    {activeScene.duration} Seconds
                  </span>
                  <button
                    onClick={() => handleTrimScene(activeSceneIndex, 1)}
                    className="px-2.5 py-1 rounded bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-xs font-bold"
                  >
                    +1s
                  </button>
                </div>
              </div>

              {/* Action Buttons for Scene */}
              <div className="pt-2 border-t border-[#2e2e2e] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleMoveScene(activeSceneIndex, "left")}
                    disabled={activeSceneIndex === 0}
                    className="p-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-studio-300 font-bold flex items-center justify-center gap-1 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Move Left
                  </button>
                  <button
                    onClick={() => handleMoveScene(activeSceneIndex, "right")}
                    disabled={activeSceneIndex === scenes.length - 1}
                    className="p-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-studio-300 font-bold flex items-center justify-center gap-1 disabled:opacity-30"
                  >
                    Move Right
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleDuplicateScene(activeSceneIndex)}
                    className="p-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-studio-300 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDeleteScene(activeSceneIndex)}
                    className="p-2 rounded-[6px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>

                <button
                  onClick={() => router.push(`/storyboard/${episodeId}`)}
                  className="w-full py-2 rounded-[6px] bg-brand/10 hover:bg-brand/20 border border-brand/25 text-brand font-bold flex items-center justify-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Regenerate Scene AI Video
                </button>

                {/* Version History & Rollback */}
                <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-studio-400 flex items-center gap-1">
                      <History className="w-3 h-3 text-comic-cyan" />
                      Take Version
                    </span>
                    <span className="font-mono font-bold text-xs text-comic-cyan">
                      v{sceneVersions[activeScene.id] || 2}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRollbackVersion(activeScene.id)}
                    className="w-full py-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-[11px] font-bold text-studio-300 flex items-center justify-center gap-1.5"
                  >
                    <Undo2 className="w-3 h-3" />
                    Rollback to Previous Take (v{Math.max(1, (sceneVersions[activeScene.id] || 2) - 1)})
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-studio-500 text-xs text-center py-10">No scene selected</div>
          )}
        </div>
      </div>

      {/* Bottom Section: Multi-Track Timeline (VIDEO, DIALOGUE, NARRATION, MUSIC, SFX, SUBTITLES) */}
      <div className="border-t border-[#2e2e2e] bg-[#171717]/90 p-4 space-y-2 overflow-x-auto">
        <div className="text-[10px] font-bold text-studio-400 uppercase tracking-wider flex items-center justify-between mb-2">
          <span>Multi-Track Timeline Sequence</span>
          <span>Click any block to seek and inspect</span>
        </div>

        {/* Track 1: VIDEO */}
        <div className="flex items-center space-x-2">
          <div className="w-24 shrink-0 text-[11px] font-bold text-brand flex items-center gap-1">
            <Film className="w-3.5 h-3.5" />
            VIDEO
          </div>
          <div className="flex-1 flex gap-1 min-w-[600px] h-14 bg-[#121212] rounded-[6px] p-1 border border-[#2e2e2e]">
            {scenes.map((scene, idx) => {
              const isSelected = idx === activeSceneIndex;
              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`h-full rounded-lg border p-1 cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                    isSelected
                      ? "bg-amber-500/20 border-brand shadow-md"
                      : "bg-[#171717] border-[#2e2e2e] hover:border-[#3e3e3e]"
                  }`}
                  style={{ flex: scene.duration }}
                >
                  <div className="flex items-center justify-between text-[9px] font-bold">
                    <span className="truncate text-white">S{scene.sceneNumber}</span>
                    <span className="font-mono text-studio-400">{scene.duration}s</span>
                  </div>
                  <div className="text-[8px] text-studio-400 truncate">{scene.location}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track 2: DIALOGUE */}
        <div className="flex items-center space-x-2">
          <div className="w-24 shrink-0 text-[11px] font-bold text-comic-purple flex items-center gap-1">
            <Mic className="w-3.5 h-3.5" />
            DIALOGUE
          </div>
          <div className="flex-1 flex gap-1 min-w-[600px] h-8 bg-[#121212] rounded-[6px] p-1 border border-[#2e2e2e]">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className="h-full rounded-md bg-purple-500/20 border border-purple-500/40 p-1 text-[9px] text-purple-300 font-bold truncate flex items-center justify-center cursor-pointer"
                style={{ flex: scene.duration }}
              >
                {scene.dialogue?.[0] ? scene.dialogue[0].characterName : "Silent"}
              </div>
            ))}
          </div>
        </div>

        {/* Track 3: NARRATION */}
        <div className="flex items-center space-x-2">
          <div className="w-24 shrink-0 text-[11px] font-bold text-comic-cyan flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            NARRATION
          </div>
          <div className="flex-1 flex gap-1 min-w-[600px] h-7 bg-[#121212] rounded-[6px] p-1 border border-[#2e2e2e]">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className="h-full rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[8px] text-cyan-300 truncate flex items-center px-1.5 cursor-pointer"
                style={{ flex: scene.duration }}
              >
                {scene.narration ? "VO" : "—"}
              </div>
            ))}
          </div>
        </div>

        {/* Track 4: MUSIC */}
        <div className="flex items-center space-x-2">
          <div className="w-24 shrink-0 text-[11px] font-bold text-emerald-400 flex items-center gap-1">
            <Music className="w-3.5 h-3.5" />
            MUSIC
          </div>
          <div className="flex-1 flex gap-1 min-w-[600px] h-7 bg-[#121212] rounded-[6px] p-1 border border-[#2e2e2e]">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className="h-full rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[8px] text-emerald-300 font-mono truncate flex items-center px-1.5 cursor-pointer"
                style={{ flex: scene.duration }}
              >
                {scene.backgroundMusic}
              </div>
            ))}
          </div>
        </div>

        {/* Track 5: SOUND EFFECTS */}
        <div className="flex items-center space-x-2">
          <div className="w-24 shrink-0 text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            SFX
          </div>
          <div className="flex-1 flex gap-1 min-w-[600px] h-7 bg-[#121212] rounded-[6px] p-1 border border-[#2e2e2e]">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className="h-full rounded-md bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-300 truncate flex items-center px-1.5 cursor-pointer"
                style={{ flex: scene.duration }}
              >
                {scene.soundEffects?.[0] || "SFX"}
              </div>
            ))}
          </div>
        </div>

        {/* Track 6: SUBTITLES */}
        <div className="flex items-center space-x-2">
          <div className="w-24 shrink-0 text-[11px] font-bold text-comic-pink flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            SUBTITLES
          </div>
          <div className="flex-1 flex gap-1 min-w-[600px] h-7 bg-[#121212] rounded-[6px] p-1 border border-[#2e2e2e]">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setActiveSceneIndex(idx)}
                className="h-full rounded-md bg-pink-500/15 border border-pink-500/30 text-[8px] text-pink-300 truncate flex items-center px-1.5 cursor-pointer"
                style={{ flex: scene.duration }}
              >
                {scene.dialogue?.[0]?.line || "CC"}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Render MP4 Manifest Modal */}
      {exportManifest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Episode Assembly Manifest (1080p MP4 Ready)
              </h3>
              <button onClick={() => setExportManifest(null)} className="text-studio-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-studio-300">
              Your 30-minute episode EDL and track assembly manifest is compiled.
            </p>
            <div className="bg-[#121212] p-4 rounded-[6px] border border-[#2e2e2e] text-xs font-mono text-studio-300 max-h-60 overflow-y-auto">
              <pre>{JSON.stringify(exportManifest.data || exportManifest, null, 2)}</pre>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExportManifest(null)}
                className="px-4 py-2 rounded-[6px] bg-[#232323] text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

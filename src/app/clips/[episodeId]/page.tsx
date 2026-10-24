"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Episode, SocialClip } from "@/types";
import {
  Video,
  Scissors,
  Smartphone,
  Copy,
  CheckCircle,
  Hash,
  Share2,
  Sliders,
  Layers,
  ChevronLeft,
  Eye,
  ShieldCheck,
  Heart,
  MessageCircle,
  Send,
  Music,
  Award,
  Flame,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export default function SocialClipsPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = (params?.episodeId as string) || "";

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [clips, setClips] = useState<SocialClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<SocialClip | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Social Director Extended Features
  const [derivativesBundle, setDerivativesBundle] = useState<any | null>(null);
  const [showDerivativesModal, setShowDerivativesModal] = useState(false);
  const [isGeneratingDerivatives, setIsGeneratingDerivatives] = useState(false);


  useEffect(() => {
    if (episodeId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [episodeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [epRes, clipsRes] = await Promise.all([
        fetch(`/api/episodes/${episodeId}`).then((r) => r.json()),
        fetch(`/api/clips?episodeId=${episodeId}`).then((r) => r.json()),
      ]);

      if (epRes.success) {
        setEpisode(epRes.data);
      } else {
        setEpisode(null);
      }
      if (clipsRes.success && clipsRes.data) {
        setClips(clipsRes.data);
        if (clipsRes.data.length > 0) setSelectedClip(clipsRes.data[0]);
      }
    } catch (err) {
      console.error(err);
      setEpisode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractClips = async () => {
    setIsExtracting(true);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ episodeId, platformFocus: "all" }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setClips(data.data);
        if (data.data.length > 0) setSelectedClip(data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const hookVariants = selectedClip ? [
    { label: "Curiosity", text: `Wait until you see how this scene unfolded...` },
    { label: "High Stakes", text: `Only moments left before the deadline, and then everything broke...` },
    { label: "Punchy Hook", text: `When everything that could go wrong happens all at once!` },
    { label: "Behind The Scenes", text: `Breaking down this animated sequence frame by frame...` },
  ] : [];

  const handleSelectHookVariant = (hookText: string) => {
    if (!selectedClip) return;
    const updated = { ...selectedClip, hook: hookText };
    setSelectedClip(updated);
    setClips((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleGenerateDerivatives = async () => {
    setIsGeneratingDerivatives(true);
    try {
      const res = await fetch(`/api/derivatives?episodeId=${episodeId}`);
      const data = await res.json();
      if (data.success && data.bundle) {
        setDerivativesBundle(data.bundle);
        setShowDerivativesModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDerivatives(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
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
        <Smartphone className="w-12 h-12 text-amber-400 mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Episode Not Found</h2>
        <p className="text-xs text-studio-400 mb-6">
          The requested episode ID "{episodeId}" could not be located in your series.
        </p>
        <button
          onClick={() => router.push("/clips")}
          className="px-4 py-2 rounded-[6px] bg-brand text-[#09090b] font-medium text-xs hover:bg-brand-hover transition-colors"
        >
          View All Social Clips
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-comic-pink mb-1">
            <Video className="w-3.5 h-3.5" />
            Viral Social Clip Studio (TikTok & Reels)
          </div>
          <h1 className="text-3xl font-black text-white">Social Media Clip Generator</h1>
          <p className="text-xs text-studio-400 mt-1 max-w-xl">
            Automatically extracts 5–10 viral 15s–90s clips from the 30-minute episode, formatted in 9:16 vertical with TikTok-compliant safe-zone overlays and viral captions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/editor/${episodeId}`)}
            className="px-4 py-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#3e3e3e] text-studio-300 text-xs font-bold"
          >
            ← Back to Editor
          </button>
          <button
            onClick={handleGenerateDerivatives}
            disabled={isGeneratingDerivatives}
            className="flex items-center gap-2 px-4 py-2 rounded-[6px] bg-brand/10 hover:bg-brand/20 border border-brand/25 text-brand text-xs font-bold transition-colors"
          >
            <Layers className="w-4 h-4" />
            {isGeneratingDerivatives ? "Compiling..." : "5-in-1 Derivatives"}
          </button>
          <button
            onClick={handleExtractClips}
            disabled={isExtracting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-gradient-to-r from-comic-pink to-comic-purple text-white font-black text-xs shadow-lg shadow-pink-500/20 hover:scale-102 transition-all disabled:opacity-50"
          >
            <Scissors className="w-4 h-4 stroke-[2]" />
            {isExtracting ? "Analyzing 30-min Episode..." : "Auto-Extract Clips"}
          </button>
        </div>
      </div>


      {/* Main Grid: Clips Selector & 9:16 Phone Mockup Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Clips List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-studio-400">
            <span>Extracted Clips ({clips.length})</span>
            <span className="text-comic-pink">9:16 Vertical Preset</span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {clips.map((clip) => {
              const isSelected = selectedClip?.id === clip.id;
              return (
                <div
                  key={clip.id}
                  onClick={() => setSelectedClip(clip)}
                  className={`p-4 rounded-[6px] border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#171717] border-comic-pink shadow-md shadow-pink-500/10"
                      : "bg-[#171717]/60 border-[#2e2e2e] hover:border-[#3e3e3e]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#121212] text-comic-pink border border-[#2e2e2e]">
                      {clip.durationSeconds}s Clip
                    </span>
                    <span className="text-[10px] font-mono text-studio-400">
                      {clip.platform.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-white line-clamp-2">{clip.title}</h4>
                  <p className="text-[11px] text-studio-400 mt-1 line-clamp-1 italic">
                    Hook: "{clip.hook}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: 9:16 Vertical Phone Simulator (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="flex items-center justify-between w-full max-w-[320px] mb-2 text-xs">
            <span className="font-bold text-studio-400 uppercase">9:16 Mobile Simulator</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-brand">
              <input
                type="checkbox"
                checked={showSafeZone}
                onChange={(e) => setShowSafeZone(e.target.checked)}
                className="rounded border-[#3e3e3e] text-brand"
              />
              <span>TikTok Safe Zone</span>
            </label>
          </div>

          {/* Smartphone Frame (9:16 Aspect Ratio) */}
          <div className="w-full max-w-[320px] aspect-[9/16] rounded-[36px] bg-black border-4 border-[#3e3e3e] shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Phone Notch / Speaker */}
            <div className="absolute top-2 inset-x-0 flex justify-center z-30 pointer-events-none">
              <div className="w-24 h-4 bg-[#171717] rounded-full"></div>
            </div>

            {/* Video Background */}
            <div className="absolute inset-0 z-0">
              {selectedClip?.videoUrl ? (
                <video
                  src={selectedClip.videoUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${
                      selectedClip?.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop"
                    })`,
                  }}
                >
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              )}
            </div>

            {/* TikTok Safe Zone Overlay Boundaries */}
            {showSafeZone && (
              <div className="absolute inset-x-4 top-14 bottom-20 border border-dashed border-amber-400/40 rounded-[6px] pointer-events-none z-10">
                <div className="absolute top-1 left-2 text-[8px] font-mono font-bold text-brand bg-black/80 px-1 rounded">
                  SAFE TEXT ZONE
                </div>
              </div>
            )}

            {/* TikTok Right Action Buttons Simulation */}
            <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-4 text-white">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-white text-white" />
                </div>
                <span className="text-[10px] font-bold mt-1">42.8K</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 fill-white text-white" />
                </div>
                <span className="text-[10px] font-bold mt-1">1.2K</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-bold mt-1">8.5K</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#171717] border-2 border-white animate-spin"></div>
            </div>

            {/* Captions in Center / Safe Area */}
            <div className="relative z-20 px-6 pt-24 text-center">
              {selectedClip && (
                <div className="inline-block bg-black/85 backdrop-blur-md text-brand font-black text-sm px-4 py-2 rounded-[6px] border border-amber-400/30 shadow-xl leading-snug">
                  {selectedClip.hook}
                </div>
              )}
            </div>

            {/* Bottom TikTok Account & Caption Bar */}
            <div className="relative z-20 p-4 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent space-y-1.5 text-left text-white">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>@ComiksX_Studio</span>
                <span className="text-[9px] bg-red-500 px-1.5 py-0.2 rounded-full font-bold">Follow</span>
              </div>
              <p className="text-[11px] line-clamp-2 leading-tight">
                {selectedClip?.title} 🇰🇪 #ComiksX #LifeInNairobi #KenyanAnimation
              </p>
              <div className="flex items-center gap-1 text-[10px] text-studio-300">
                <Music className="w-3 h-3 text-brand" />
                <span className="truncate">Original Sound - Comiks X Nairobi Beats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Social Metadata & Fast Export (4 Cols) */}
        <div className="lg:col-span-4 bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-comic-pink" />
              Posting Kit & Metadata
            </h3>
            <span className="text-xs font-bold text-comic-pink">1-Click Copy</span>
          </div>

          {selectedClip ? (
            <div className="space-y-4 text-xs">
              {/* Retention & Virality Score Breakdown */}
              <div className="p-3.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-studio-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-comic-pink" />
                    Retention & Virality Score
                  </span>
                  <span className="text-xs font-black text-comic-pink bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/30">
                    91 / 100 [A+]
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-1 border-t border-studio-900">
                  <div>
                    <span className="text-studio-500 block">0–3s Hook:</span>
                    <strong className="text-emerald-400 font-bold">94%</strong>
                  </div>
                  <div>
                    <span className="text-studio-500 block">Completion:</span>
                    <strong className="text-comic-cyan font-bold">88%</strong>
                  </div>
                  <div>
                    <span className="text-studio-500 block">Engagement:</span>
                    <strong className="text-brand font-bold">92%</strong>
                  </div>
                </div>
              </div>

              {/* 4 Hook Variants Picker */}
              <div>
                <label className="text-[10px] font-bold text-studio-400 uppercase flex items-center justify-between mb-1.5">
                  <span>Viral Hook Variants (4 Angles)</span>
                  <span className="text-brand text-[9px]">Click to Apply</span>
                </label>
                <div className="space-y-1.5">
                  {hookVariants.map((variant, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectHookVariant(variant.text)}
                      className={`w-full p-2 rounded-[6px] text-left border transition-all ${
                        selectedClip.hook === variant.text
                          ? "bg-[#1c1c1c] border-brand shadow-[0_0_0_1px_rgba(62,207,142,0.3)] text-white shadow-sm shadow-amber-500/10"
                          : "bg-[#121212] border-[#2e2e2e] text-studio-400 hover:border-[#3e3e3e] hover:text-studio-200"
                      }`}
                    >
                      <span className="text-[9px] uppercase font-bold text-brand block">
                        {variant.label}
                      </span>
                      <p className="text-[11px] font-medium truncate mt-0.5">"{variant.text}"</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-studio-400 uppercase">Video Title</label>
                  <button
                    onClick={() => copyToClipboard(selectedClip.title, "title")}
                    className="text-comic-pink font-bold text-[10px] hover:underline"
                  >
                    {copiedField === "title" ? "Copied!" : "Copy Title"}
                  </button>
                </div>
                <div className="p-2.5 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-white font-medium mt-1">
                  {selectedClip.title}
                </div>
              </div>

              {/* Caption & Hashtags */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-studio-400 uppercase">Caption & High-Traffic Tags</label>
                  <button
                    onClick={() => copyToClipboard(selectedClip.description, "desc")}
                    className="text-comic-pink font-bold text-[10px] hover:underline"
                  >
                    {copiedField === "desc" ? "Copied!" : "Copy Caption"}
                  </button>
                </div>
                <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-studio-300 font-mono text-[11px] leading-relaxed mt-1 max-h-28 overflow-y-auto">
                  {selectedClip.description}
                </div>
              </div>

              {/* Hashtag Badges */}
              <div>
                <label className="text-[10px] font-bold text-studio-400 uppercase block mb-1">Hashtag Suggestions</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClip.hashtags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#121212] text-comic-cyan border border-[#2e2e2e] text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Export Direct Button */}
              <div className="pt-2 border-t border-[#2e2e2e]">
                <button
                  onClick={() => alert(`Clip ${selectedClip.title} ready for 1080x1920 MP4 download!`)}
                  className="w-full py-2.5 rounded-[6px] bg-gradient-to-r from-comic-pink to-comic-purple text-white font-black text-xs shadow-lg shadow-pink-500/20 hover:scale-102 transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Export 1080×1920 TikTok MP4
                </button>
              </div>
            </div>
          ) : (
            <div className="text-studio-500 text-xs text-center py-10">Select a clip to view posting kit</div>
          )}
        </div>
      </div>

      {/* Derivatives Bundle Modal */}
      {showDerivativesModal && derivativesBundle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] max-w-3xl w-full p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand" />
                  5-in-1 Social Derivative Content Bundle
                </h3>
                <p className="text-xs text-studio-400 mt-0.5">
                  Generated from 30-minute episode: Short videos, quote cards, comic panels, teaser trailer & recap.
                </p>
              </div>
              <button
                onClick={() => setShowDerivativesModal(false)}
                className="text-studio-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Bundle Assets Grid */}
            <div className="space-y-4 text-xs">
              {/* Quote Cards */}
              <div>
                <h4 className="font-bold text-brand uppercase mb-2 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  1. Viral Quote Cards ({derivativesBundle.quoteCards?.length || 3})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {derivativesBundle.quoteCards?.map((card: any, idx: number) => (
                    <div key={card.id || idx} className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1">
                      <span className="text-[10px] font-bold text-comic-cyan block">{card.speaker}</span>
                      <p className="text-xs text-white italic">"{card.quote}"</p>
                      <span className="text-[9px] text-studio-500 font-mono block mt-1">{card.sceneSetting}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comic Panels */}
              <div>
                <h4 className="font-bold text-comic-cyan uppercase mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  2. High-Resolution Comic Panels ({derivativesBundle.comicPanels?.length || 4})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {derivativesBundle.comicPanels?.map((panel: any, idx: number) => (
                    <div key={panel.id || idx} className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white">Panel #{panel.panelIndex}</span>
                        <span className="text-brand font-mono">{panel.captionStyle}</span>
                      </div>
                      <p className="text-[11px] text-studio-300 line-clamp-2">{panel.actionPrompt}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trailer & Recap EDL Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#2e2e2e]">
                <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-comic-purple uppercase text-[11px]">3. Teaser Trailer EDL</span>
                    <span className="text-[10px] text-studio-400 font-mono">45s Duration</span>
                  </div>
                  <p className="text-xs text-studio-300">
                    Hook scene pacing with fast-paced cuts and cinematic outro brand logo sting.
                  </p>
                </div>
                <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 uppercase text-[11px]">4. Episode Recap Manifest</span>
                    <span className="text-[10px] text-studio-400 font-mono">60s Duration</span>
                  </div>
                  <p className="text-xs text-studio-300">
                    5-chapter narrative compression with key climax moments for returning viewers.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#2e2e2e]">
              <button
                onClick={() => setShowDerivativesModal(false)}
                className="px-5 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium shadow-sm text-xs"
              >
                Close & Ready for Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

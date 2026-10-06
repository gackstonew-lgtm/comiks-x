"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Episode, SocialClip } from "@/types";
import {
  Video,
  Sparkles,
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
} from "lucide-react";

export default function SocialClipsPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = (params?.episodeId as string) || "ep-01-the-pitch";

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [clips, setClips] = useState<SocialClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<SocialClip | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [episodeId]);

  const fetchData = async () => {
    try {
      const [epRes, clipsRes] = await Promise.all([
        fetch(`/api/episodes/${episodeId}`).then((r) => r.json()),
        fetch(`/api/clips?episodeId=${episodeId}`).then((r) => r.json()),
      ]);

      if (epRes.success) setEpisode(epRes.data);
      if (clipsRes.success && clipsRes.data) {
        setClips(clipsRes.data);
        if (clipsRes.data.length > 0) setSelectedClip(clipsRes.data[0]);
      }
    } catch (err) {
      console.error(err);
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

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/editor/${episodeId}`)}
            className="px-4 py-2 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-studio-300 text-xs font-bold"
          >
            ← Back to Editor
          </button>
          <button
            onClick={handleExtractClips}
            disabled={isExtracting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-comic-pink to-comic-purple text-white font-black text-xs shadow-lg shadow-pink-500/20 hover:scale-102 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isExtracting ? "Analyzing 30-min Episode..." : "Auto-Extract 5–10 Viral Clips"}
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-studio-900 border-comic-pink shadow-md shadow-pink-500/10"
                      : "bg-studio-900/60 border-studio-800 hover:border-studio-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-studio-950 text-comic-pink border border-studio-800">
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
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-comic-yellow">
              <input
                type="checkbox"
                checked={showSafeZone}
                onChange={(e) => setShowSafeZone(e.target.checked)}
                className="rounded border-studio-700 text-comic-yellow"
              />
              <span>TikTok Safe Zone</span>
            </label>
          </div>

          {/* Smartphone Frame (9:16 Aspect Ratio) */}
          <div className="w-full max-w-[320px] aspect-[9/16] rounded-[36px] bg-black border-4 border-studio-700 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            {/* Phone Notch / Speaker */}
            <div className="absolute top-2 inset-x-0 flex justify-center z-30 pointer-events-none">
              <div className="w-24 h-4 bg-studio-900 rounded-full"></div>
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
              <div className="absolute inset-x-4 top-14 bottom-20 border border-dashed border-amber-400/40 rounded-2xl pointer-events-none z-10">
                <div className="absolute top-1 left-2 text-[8px] font-mono font-bold text-comic-yellow bg-black/80 px-1 rounded">
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
              <div className="w-8 h-8 rounded-full bg-studio-900 border-2 border-white animate-spin"></div>
            </div>

            {/* Captions in Center / Safe Area */}
            <div className="relative z-20 px-6 pt-24 text-center">
              {selectedClip && (
                <div className="inline-block bg-black/85 backdrop-blur-md text-comic-yellow font-black text-sm px-4 py-2 rounded-xl border border-amber-400/30 shadow-xl leading-snug">
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
                <Music className="w-3 h-3 text-comic-yellow" />
                <span className="truncate">Original Sound - Comiks X Nairobi Beats</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Social Metadata & Fast Export (4 Cols) */}
        <div className="lg:col-span-4 bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-studio-800">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-comic-pink" />
              Posting Kit & Metadata
            </h3>
            <span className="text-xs font-bold text-comic-pink">1-Click Copy</span>
          </div>

          {selectedClip ? (
            <div className="space-y-4 text-xs">
              {/* Viral Hook */}
              <div>
                <label className="text-[10px] font-bold text-studio-400 uppercase">Opening Hook (0–3s)</label>
                <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 font-bold text-comic-yellow mt-1">
                  "{selectedClip.hook}"
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
                <div className="p-2.5 rounded-xl bg-studio-950 border border-studio-800 text-white font-medium mt-1">
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
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800 text-studio-300 font-mono text-[11px] leading-relaxed mt-1 max-h-36 overflow-y-auto">
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
                      className="px-2 py-0.5 rounded-md bg-studio-950 text-comic-cyan border border-studio-800 text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Export Direct Button */}
              <div className="pt-2 border-t border-studio-800">
                <button
                  onClick={() => alert(`Clip ${selectedClip.title} ready for 1080x1920 MP4 download!`)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-comic-pink to-comic-purple text-white font-black text-xs shadow-lg shadow-pink-500/20 hover:scale-102 transition-all flex items-center justify-center gap-2"
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
    </div>
  );
}

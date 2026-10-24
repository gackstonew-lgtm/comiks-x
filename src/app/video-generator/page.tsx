"use client";

import { useState, useEffect } from "react";
import {
  Video,
  Play,
  Clapperboard,
  Zap,
  Sliders,
  Maximize2,
  Download,
  Send,
  Loader2,
  Film,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { MediaAsset } from "@/types";

export default function VideoGeneratorPage() {
  const [mode, setMode] = useState<"text-to-video" | "image-to-video" | "video-to-video">("text-to-video");
  const [prompt, setPrompt] = useState("");
  const [firstFrameUrl, setFirstFrameUrl] = useState("");
  const [lastFrameUrl, setLastFrameUrl] = useState("");
  const [provider, setProvider] = useState("luma");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [motionIntensity, setMotionIntensity] = useState(5);
  const [cameraMotion, setCameraMotion] = useState("static");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeVideo, setActiveVideo] = useState<MediaAsset | null>(null);
  const [history, setHistory] = useState<MediaAsset[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch initial history & credits
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/video-generator");
      const data = await res.json();
      if (data.success) {
        setHistory(data.assets || []);
        if (data.assets && data.assets.length > 0 && !activeVideo) {
          setActiveVideo(data.assets[0]);
        }
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

  const estimatedCost = Math.max(5, Math.round(duration * 1.5));

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      setPrompt("High octane comic animation sequence with dynamic cell shading, dramatic backlighting, and expressive comic action lines.");
      return;
    }
    setPrompt(
      `${prompt.trim()}, hand-drawn 2D animation style, expressive character motion, high-contrast inks, smooth camera tracking, broadcast quality.`
    );
  };

  const handleGenerate = async () => {
    if (!prompt && !firstFrameUrl) return;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/video-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode,
          firstFrameUrl,
          lastFrameUrl,
          cameraMotion,
          motionIntensity,
          duration,
          aspectRatio,
          provider,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveVideo(data.asset);
        setHistory((prev) => [data.asset, ...prev]);
        setCredits(data.creditsRemaining);
        setStatusMessage(`Generated successfully! Deducted ${data.creditsDeducted} credits.`);
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
            <Video className="w-3.5 h-3.5" />
            AI Video Generation Studio
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Cinematic AI Video Studio
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Generate high-consistency animated video shots, camera moves, and transitions powered by Luma, Kling, Runway, and Fal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-[6px] bg-[#1a1a1a] border border-[#2e2e2e] flex items-center gap-2 text-xs">
            <span className="text-[#a0a0a0]">Balance:</span>
            <span className="font-semibold text-brand">
              {credits !== null ? `${credits} credits` : "Loading..."}
            </span>
          </div>
          <Link
            href="/editor"
            className="px-3.5 py-1.5 rounded-[6px] bg-[#222222] hover:bg-[#2a2a2a] border border-[#2e2e2e] text-xs font-medium text-[#ededed] inline-flex items-center gap-1.5 transition-colors"
          >
            <Film className="w-3.5 h-3.5" />
            Timeline Editor
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Generator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Generation Mode Selector */}
          <div className="p-1 rounded-[6px] bg-[#181818] border border-[#2e2e2e] grid grid-cols-3 text-xs font-medium">
            <button
              onClick={() => setMode("text-to-video")}
              className={`py-1.5 rounded-[4px] transition-colors ${
                mode === "text-to-video"
                  ? "bg-[#252525] text-brand shadow-sm font-semibold"
                  : "text-[#a0a0a0] hover:text-[#ededed]"
              }`}
            >
              Text to Video
            </button>
            <button
              onClick={() => setMode("image-to-video")}
              className={`py-1.5 rounded-[4px] transition-colors ${
                mode === "image-to-video"
                  ? "bg-[#252525] text-brand shadow-sm font-semibold"
                  : "text-[#a0a0a0] hover:text-[#ededed]"
              }`}
            >
              Image to Video
            </button>
            <button
              onClick={() => setMode("video-to-video")}
              className={`py-1.5 rounded-[4px] transition-colors ${
                mode === "video-to-video"
                  ? "bg-[#252525] text-brand shadow-sm font-semibold"
                  : "text-[#a0a0a0] hover:text-[#ededed]"
              }`}
            >
              Video to Video
            </button>
          </div>

          {/* Model & Aspect Ratio Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
                AI Provider Model
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
              >
                <option value="luma">Luma Dream Machine</option>
                <option value="kling">Kling AI v1.5 Pro</option>
                <option value="runway">Runway Gen-3 Alpha</option>
                <option value="fal">Fal Wan 2.1 / Kling</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
                Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
              >
                <option value="16:9">16:9 (Landscape / YouTube)</option>
                <option value="9:16">9:16 (Vertical / TikTok / Shorts)</option>
                <option value="1:1">1:1 (Square / Instagram)</option>
                <option value="4:5">4:5 (Social Feed)</option>
              </select>
            </div>
          </div>

          {/* Prompt Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#a0a0a0] font-medium">Prompt</label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                className="text-[11px] text-brand hover:underline inline-flex items-center gap-1 font-medium"
              >
                <Zap className="w-3 h-3" />
                Enhance Prompt
              </button>
            </div>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe motion, animation style, background atmosphere, and camera motion..."
              className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] p-3 text-xs leading-relaxed focus:outline-none focus:border-brand placeholder-[#555]"
            />
          </div>

          {/* First Frame & Last Frame for I2V */}
          {mode !== "text-to-video" && (
            <div className="space-y-3 p-3 rounded-[6px] bg-[#181818] border border-[#2e2e2e]">
              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  First Frame Image URL
                </label>
                <input
                  type="text"
                  value={firstFrameUrl}
                  onChange={(e) => setFirstFrameUrl(e.target.value)}
                  placeholder="https://... image source"
                  className="w-full bg-[#121212] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                />
              </div>
              {mode === "image-to-video" && (
                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                    Last Frame Image URL (Optional Interpolation)
                  </label>
                  <input
                    type="text"
                    value={lastFrameUrl}
                    onChange={(e) => setLastFrameUrl(e.target.value)}
                    placeholder="https://... target end frame"
                    className="w-full bg-[#121212] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                  />
                </div>
              )}
            </div>
          )}

          {/* Camera Motion & Motion Intensity */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-brand" />
                Camera Direction
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                {[
                  { id: "static", label: "Static" },
                  { id: "pan_left", label: "Pan Left" },
                  { id: "pan_right", label: "Pan Right" },
                  { id: "zoom_in", label: "Zoom In" },
                  { id: "zoom_out", label: "Zoom Out" },
                  { id: "tilt_up", label: "Tilt Up" },
                  { id: "tilt_down", label: "Tilt Down" },
                  { id: "orbit", label: "Orbit" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCameraMotion(item.id)}
                    className={`py-1 px-2 rounded-[4px] border text-center transition-colors ${
                      cameraMotion === item.id
                        ? "bg-brand/10 border-brand text-brand font-medium"
                        : "bg-[#181818] border-[#2e2e2e] text-[#a0a0a0] hover:text-[#ededed]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex justify-between text-xs text-[#a0a0a0] mb-1">
                  <span>Duration</span>
                  <span className="font-semibold text-[#ededed]">{duration}s</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-brand bg-[#2e2e2e]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#a0a0a0] mb-1">
                  <span>Motion Intensity</span>
                  <span className="font-semibold text-[#ededed]">{motionIntensity}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={motionIntensity}
                  onChange={(e) => setMotionIntensity(Number(e.target.value))}
                  className="w-full accent-brand bg-[#2e2e2e]"
                />
              </div>
            </div>
          </div>

          {/* Generate Button with Estimated Cost */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt && !firstFrameUrl)}
              className="w-full py-2.5 px-4 rounded-[6px] bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#09090b] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Video ({duration}s)...
                </>
              ) : (
                <>
                  <Clapperboard className="w-4 h-4" />
                  Generate Video ({estimatedCost} Credits)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview & Video Output Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e] mb-3">
              <span className="text-xs font-semibold text-[#ededed] flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-brand" />
                Active Video Preview
              </span>
              {activeVideo && (
                <span className="text-[11px] text-[#a0a0a0]">
                  {activeVideo.duration} • {activeVideo.aspectRatio} • {activeVideo.size}
                </span>
              )}
            </div>

            <div className="relative aspect-video w-full rounded-[6px] overflow-hidden bg-black flex items-center justify-center border border-[#262626]">
              {activeVideo ? (
                <video
                  key={activeVideo.url}
                  src={activeVideo.url}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 text-[#666]">
                  <Film className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No active video clip selected.</p>
                  <p className="text-[11px] text-[#555] mt-1">
                    Enter a prompt and click Generate to produce your first clip.
                  </p>
                </div>
              )}
            </div>

            {activeVideo && (
              <div className="mt-3 flex items-center justify-between pt-2">
                <p className="text-xs text-[#ededed] font-medium truncate max-w-[60%]">
                  {activeVideo.name}
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={activeVideo.url}
                    download
                    className="p-1.5 rounded-[4px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1 border border-[#2e2e2e]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  <Link
                    href="/editor"
                    className="px-3 py-1.5 rounded-[4px] bg-brand text-[#09090b] text-xs font-semibold inline-flex items-center gap-1"
                  >
                    Send to Timeline
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* History Gallery */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
              Recent Video Generations ({history.length})
            </h3>
            {history.length === 0 ? (
              <div className="p-4 rounded-[6px] bg-[#141414] border border-[#2e2e2e] text-center text-xs text-[#666]">
                No generated clips yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveVideo(item)}
                    className={`cursor-pointer rounded-[6px] overflow-hidden border p-2 transition-all ${
                      activeVideo?.id === item.id
                        ? "border-brand bg-[#1c221e]"
                        : "border-[#2e2e2e] bg-[#161616] hover:border-[#444]"
                    }`}
                  >
                    <div className="aspect-video bg-black rounded-[4px] overflow-hidden relative flex items-center justify-center">
                      <video src={item.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-[11px] font-medium text-[#ededed] mt-1.5 truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#888] mt-0.5">
                      <span>{item.aspectRatio}</span>
                      <span>{item.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

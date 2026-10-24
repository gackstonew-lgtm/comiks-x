"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  Layers,
  Download,
  Scissors,
  Maximize2,
  Video,
  User,
  Loader2,
  CheckCircle2,
  Ratio,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { Character, MediaAsset } from "@/types";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [style, setStyle] = useState("flipaclip-2d");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [characterId, setCharacterId] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeImage, setActiveImage] = useState<MediaAsset | null>(null);
  const [history, setHistory] = useState<MediaAsset[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/image-generator");
      const data = await res.json();
      if (data.success) {
        setHistory(data.assets || []);
        setCharacters(data.characters || []);
        if (data.assets && data.assets.length > 0 && !activeImage) {
          setActiveImage(data.assets[0]);
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

  const handleGenerate = async (action: "generate" | "upscale" | "remove-bg" | "turnaround" = "generate") => {
    if (!prompt && action === "generate") return;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/image-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          style,
          aspectRatio,
          characterId: characterId || undefined,
          action,
          imageUrl: activeImage?.url,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveImage(data.asset);
        setHistory((prev) => [data.asset, ...prev]);
        setCredits(data.creditsRemaining);
        setStatusMessage(`Success! ${action === "generate" ? "Generated image" : action} completed (${data.creditsDeducted} credits deducted).`);
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
            <ImageIcon className="w-3.5 h-3.5" />
            AI Image & Panel Generator
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Comic Art & Character Stills
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Generate visual keyframes, comic panels, turnarounds, and character sheets conditioned on your Character Bible.
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
            href="/characters"
            className="px-3.5 py-1.5 rounded-[6px] bg-[#222222] hover:bg-[#2a2a2a] border border-[#2e2e2e] text-xs font-medium text-[#ededed] inline-flex items-center gap-1.5 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-brand" />
            Character Bible
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#a0a0a0] font-medium block">
              Prompt & Scene Description
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Master shot of Kip standing on a rooftop at sunset, expressive hand-drawn 2D comic art style, vibrant Nairobi colors..."
              className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] p-3 text-xs leading-relaxed focus:outline-none focus:border-brand placeholder-[#555]"
            />
          </div>

          {/* Negative Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs text-[#a0a0a0] font-medium block">
              Negative Prompt (Avoid)
            </label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="photorealistic, 3d render, blurry, distorted hands, watermark"
              className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand placeholder-[#555]"
            />
          </div>

          {/* Character Anchor & Style Preset */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
                Character Anchor
              </label>
              <select
                value={characterId}
                onChange={(e) => setCharacterId(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
              >
                <option value="">None (Freeform Generation)</option>
                {characters.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} ({char.personality || "Protagonist"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
                Art Style Preset
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
              >
                <option value="flipaclip-2d">FlipaClip 2D Cel</option>
                <option value="comic-book">Graphic Comic Inks</option>
                <option value="anime">Anime Shonen Style</option>
                <option value="pixar-3d">Pixar Stylized 3D</option>
                <option value="cyberpunk">Cyberpunk Noir</option>
              </select>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-5 gap-1.5 text-xs">
              {["1:1", "16:9", "9:16", "4:3", "3:2"].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 rounded-[4px] border text-center transition-colors ${
                    aspectRatio === ratio
                      ? "bg-brand/10 border-brand text-brand font-semibold"
                      : "bg-[#181818] border-[#2e2e2e] text-[#a0a0a0] hover:text-[#ededed]"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleGenerate("generate")}
              disabled={isGenerating || !prompt}
              className="w-full py-2.5 px-4 rounded-[6px] bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#09090b] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Art...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Image (2 Credits)
                </>
              )}
            </button>

            <button
              onClick={() => handleGenerate("turnaround")}
              disabled={isGenerating || !prompt}
              className="w-full py-2 px-4 rounded-[6px] bg-[#1a1a1a] hover:bg-[#222222] border border-[#2e2e2e] text-[#ededed] font-medium text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-brand" />
              Generate 4-Angle Turnaround Sheet (4 Credits)
            </button>
          </div>
        </div>

        {/* Output & Post-Processing Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] p-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e] mb-3">
              <span className="text-xs font-semibold text-[#ededed] flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-brand" />
                Active Canvas
              </span>
              {activeImage && (
                <span className="text-[11px] text-[#a0a0a0]">
                  {activeImage.aspectRatio} • {activeImage.size}
                </span>
              )}
            </div>

            <div className="relative aspect-square max-h-[420px] w-full rounded-[6px] overflow-hidden bg-black flex items-center justify-center border border-[#262626]">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8 text-[#666]">
                  <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No image selected.</p>
                  <p className="text-[11px] text-[#555] mt-1">
                    Describe your scene and click Generate.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions Bar for Active Image */}
            {activeImage && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#262626]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate("upscale")}
                    disabled={isGenerating}
                    className="px-2.5 py-1.5 rounded-[4px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1.5 border border-[#2e2e2e]"
                  >
                    <Maximize2 className="w-3 h-3 text-brand" />
                    Upscale 4x
                  </button>
                  <button
                    onClick={() => handleGenerate("remove-bg")}
                    disabled={isGenerating}
                    className="px-2.5 py-1.5 rounded-[4px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1.5 border border-[#2e2e2e]"
                  >
                    <Scissors className="w-3 h-3 text-brand" />
                    Remove BG
                  </button>
                  <Link
                    href={`/video-generator?firstFrameUrl=${encodeURIComponent(activeImage.url)}`}
                    className="px-2.5 py-1.5 rounded-[4px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1.5 border border-[#2e2e2e]"
                  >
                    <Video className="w-3 h-3 text-brand" />
                    Animate with Video AI
                  </Link>
                </div>

                <a
                  href={activeImage.url}
                  download
                  className="p-1.5 rounded-[4px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1 border border-[#2e2e2e]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save
                </a>
              </div>
            )}
          </div>

          {/* History Gallery */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
              Asset History ({history.length})
            </h3>
            {history.length === 0 ? (
              <div className="p-4 rounded-[6px] bg-[#141414] border border-[#2e2e2e] text-center text-xs text-[#666]">
                No generated artwork yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveImage(item)}
                    className={`cursor-pointer rounded-[6px] overflow-hidden border p-1.5 transition-all ${
                      activeImage?.id === item.id
                        ? "border-brand bg-[#1c221e]"
                        : "border-[#2e2e2e] bg-[#161616] hover:border-[#444]"
                    }`}
                  >
                    <div className="aspect-square bg-black rounded-[4px] overflow-hidden">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-medium text-[#ededed] mt-1 truncate">
                      {item.name}
                    </p>
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

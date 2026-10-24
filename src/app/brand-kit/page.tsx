"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Save,
  CheckCircle2,
  Sparkles,
  Type,
  Sliders,
  Video,
  Shield,
  Loader2,
} from "lucide-react";
import { BrandKitConfig } from "@/types";

export default function BrandKitPage() {
  const [brandKit, setBrandKit] = useState<BrandKitConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBrandKit();
  }, []);

  const fetchBrandKit = async () => {
    try {
      const res = await fetch("/api/brand-kit");
      const data = await res.json();
      if (data.success && data.brandKit) {
        const bk = data.brandKit;
        if (!bk.captionPreset || typeof bk.captionPreset !== "object") {
          bk.captionPreset = {
            fontFamily: "FlipaClip Sans",
            fontSize: 42,
            textColor: "#FFE600",
            backgroundPill: true,
          };
        }
        setBrandKit(bk);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandKit) return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/brand-kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandKit),
      });

      const data = await res.json();
      if (data.success) {
        setBrandKit(data.brandKit);
        setStatusMessage("Brand kit configurations saved across studio pipelines.");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!brandKit) {
    return (
      <div className="flex items-center justify-center p-12 text-[#888] text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-brand mr-2" />
        Loading Brand Kit...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <Palette className="w-3.5 h-3.5" />
            Brand Kit Studio
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Visual Identity & Watermark
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Standardize your studio palette, caption typography, watermark placement, and intro/outro bumpers.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm self-start md:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Brand Kit
            </>
          )}
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* Colors */}
          <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-4">
            <h3 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-brand" />
              Brand Color Palette
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) =>
                      setBrandKit({ ...brandKit, primaryColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border border-[#2e2e2e] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandKit.primaryColor}
                    onChange={(e) =>
                      setBrandKit({ ...brandKit, primaryColor: e.target.value })
                    }
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[4px] px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.secondaryColor}
                    onChange={(e) =>
                      setBrandKit({ ...brandKit, secondaryColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border border-[#2e2e2e] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandKit.secondaryColor}
                    onChange={(e) =>
                      setBrandKit({ ...brandKit, secondaryColor: e.target.value })
                    }
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[4px] px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Accent Green</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.accentColor}
                    onChange={(e) =>
                      setBrandKit({ ...brandKit, accentColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border border-[#2e2e2e] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandKit.accentColor}
                    onChange={(e) =>
                      setBrandKit({ ...brandKit, accentColor: e.target.value })
                    }
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[4px] px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Watermark / Logo */}
          <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-4">
            <h3 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-brand" />
              Watermark & Corner Overlay
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Watermark Image URL</label>
                <input
                  type="text"
                  value={brandKit.watermarkUrl || ""}
                  onChange={(e) =>
                    setBrandKit({ ...brandKit, watermarkUrl: e.target.value })
                  }
                  placeholder="https://... logo PNG"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#a0a0a0] block mb-1">
                    Placement Position
                  </label>
                  <select
                    value={brandKit.watermarkPosition}
                    onChange={(e) =>
                      setBrandKit({
                        ...brandKit,
                        watermarkPosition: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#a0a0a0] mb-1">
                    <span>Opacity</span>
                    <span className="font-semibold text-brand">
                      {Math.round(brandKit.watermarkOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={brandKit.watermarkOpacity}
                    onChange={(e) =>
                      setBrandKit({
                        ...brandKit,
                        watermarkOpacity: Number(e.target.value),
                      })
                    }
                    className="w-full accent-brand bg-[#2e2e2e]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Caption Style Presets */}
          <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-4">
            <h3 className="text-xs font-bold text-[#ededed] flex items-center gap-2">
              <Type className="w-3.5 h-3.5 text-brand" />
              Dynamic Subtitle & Caption Preset
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Font Family</label>
                <select
                  value={brandKit.captionPreset.fontFamily}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      captionPreset: {
                        ...brandKit.captionPreset,
                        fontFamily: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                >
                  <option value="FlipaClip Sans">FlipaClip Sans (Punchy Bold)</option>
                  <option value="Impact">Impact / Meme Gothic</option>
                  <option value="Inter">Inter Clean</option>
                  <option value="Comic Neue">Comic Neue Bold</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Font Size (px)</label>
                <input
                  type="number"
                  min="20"
                  max="90"
                  value={brandKit.captionPreset.fontSize}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      captionPreset: {
                        ...brandKit.captionPreset,
                        fontSize: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] block mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandKit.captionPreset.textColor}
                    onChange={(e) =>
                      setBrandKit({
                        ...brandKit,
                        captionPreset: {
                          ...brandKit.captionPreset,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="w-8 h-8 rounded border border-[#2e2e2e] bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandKit.captionPreset.textColor}
                    onChange={(e) =>
                      setBrandKit({
                        ...brandKit,
                        captionPreset: {
                          ...brandKit.captionPreset,
                          textColor: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[4px] px-2 py-1 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <span className="text-xs text-[#a0a0a0]">Background Pill</span>
                <input
                  type="checkbox"
                  checked={brandKit.captionPreset.backgroundPill}
                  onChange={(e) =>
                    setBrandKit({
                      ...brandKit,
                      captionPreset: {
                        ...brandKit.captionPreset,
                        backgroundPill: e.target.checked,
                      },
                    })
                  }
                  className="accent-brand rounded"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Live Rendering Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-3">
            <h3 className="text-xs font-bold text-[#ededed]">Brand Kit Live Preview</h3>
            <p className="text-[11px] text-[#888]">
              Simulated 9:16 export canvas showing watermark placement and caption styling.
            </p>

            <div className="relative aspect-[9/16] max-h-[460px] mx-auto rounded-[8px] overflow-hidden bg-black border border-[#2e2e2e] flex flex-col justify-between p-4 shadow-xl">
              {/* Background Mock Video Frame */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${brandKit.primaryColor} 0%, #000 100%)`,
                }}
              />

              {/* Watermark Placement */}
              <div
                className={`absolute z-10 p-3 ${
                  brandKit.watermarkPosition === "top-left"
                    ? "top-0 left-0"
                    : brandKit.watermarkPosition === "top-right"
                    ? "top-0 right-0"
                    : brandKit.watermarkPosition === "bottom-left"
                    ? "bottom-0 left-0"
                    : "bottom-0 right-0"
                }`}
                style={{ opacity: brandKit.watermarkOpacity }}
              >
                <div
                  className="px-2 py-1 rounded text-[11px] font-black tracking-wider uppercase border"
                  style={{
                    backgroundColor: brandKit.primaryColor,
                    borderColor: brandKit.accentColor,
                    color: brandKit.accentColor,
                  }}
                >
                  Comiks X Studio
                </div>
              </div>

              {/* Center Screen / Content */}
              <div className="relative z-10 my-auto text-center">
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                  [9:16 Animation Track]
                </span>
              </div>

              {/* Caption Overlay */}
              <div className="relative z-10 text-center mb-6">
                <span
                  style={{
                    fontFamily: brandKit.captionPreset.fontFamily,
                    fontSize: `${Math.round(brandKit.captionPreset.fontSize * 0.45)}px`,
                    color: brandKit.captionPreset.textColor,
                    backgroundColor: brandKit.captionPreset.backgroundPill
                      ? "rgba(0,0,0,0.8)"
                      : "transparent",
                    padding: brandKit.captionPreset.backgroundPill ? "4px 10px" : "0",
                    borderRadius: "4px",
                    textShadow: "2px 2px 0px #000, -1px -1px 0 #000",
                    fontWeight: 900,
                  }}
                >
                  "NIAJE BUDABOSS! HII FORM NI YA LEO!"
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

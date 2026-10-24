"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Plus,
  Play,
  ShieldCheck,
  Zap,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
  Download,
} from "lucide-react";
import { AvatarProfile, MediaAsset } from "@/types";

export default function AvatarsPage() {
  const [avatars, setAvatars] = useState<AvatarProfile[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [scriptText, setScriptText] = useState("");
  const [background, setBackground] = useState("studio");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<MediaAsset | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Avatar Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("AI Host / Presenter");
  const [newVoice, setNewVoice] = useState("voice-ke-1");
  const [newStyle, setNewStyle] = useState("comic-vibrant");
  const [newConsent, setNewConsent] = useState(false);
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const res = await fetch("/api/avatars");
      const data = await res.json();
      if (data.success && data.avatars) {
        setAvatars(data.avatars);
        if (data.avatars.length > 0 && !selectedAvatar) {
          setSelectedAvatar(data.avatars[0]);
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

  const handleCreateAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newConsent) return;
    setIsCreatingAvatar(true);

    try {
      const res = await fetch("/api/avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_avatar",
          name: newName,
          role: newRole,
          voiceId: newVoice,
          stylePreset: newStyle,
          consentVerified: newConsent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAvatars((prev) => [...prev, data.avatar]);
        setSelectedAvatar(data.avatar);
        setShowCreateModal(false);
        setNewName("");
        setNewConsent(false);
        setStatusMessage(`Avatar "${data.avatar.name}" verified and created.`);
      } else {
        alert(data.error || "Failed to create avatar");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsCreatingAvatar(false);
    }
  };

  const handleGeneratePresenterVideo = async () => {
    if (!selectedAvatar || !scriptText.trim()) return;
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_presenter_video",
          avatarId: selectedAvatar.id,
          scriptText,
          voiceId: selectedAvatar.voiceId,
          background,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedVideo(data.asset);
        setCredits(data.creditsRemaining);
        setStatusMessage("Presenter video generated with synchronized lip-sync! (6 credits deducted)");
      } else {
        alert(data.error || "Failed to generate presenter video");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAvatar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this avatar profile?")) return;
    try {
      const res = await fetch(`/api/avatars?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        const remaining = avatars.filter((a) => a.id !== id);
        setAvatars(remaining);
        if (selectedAvatar?.id === id) {
          setSelectedAvatar(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <UserCheck className="w-3.5 h-3.5" />
            AI Avatars & Presenters Studio
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Digital Likeness & Talking Heads
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Build consistent presenter personas, script dialogues, and generate speech-driven lip-sync animations with verified consent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-[6px] bg-[#1a1a1a] border border-[#2e2e2e] flex items-center gap-2 text-xs">
            <span className="text-[#a0a0a0]">Balance:</span>
            <span className="font-semibold text-brand">
              {credits !== null ? `${credits} credits` : "Loading..."}
            </span>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Avatar
          </button>
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
        {/* Avatars List / Selector (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#a0a0a0]">
            Avatar Roster ({avatars.length})
          </h2>

          <div className="space-y-2.5">
            {avatars.map((avatar) => (
              <div
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar)}
                className={`p-3 rounded-[8px] border cursor-pointer transition-all flex items-center justify-between ${
                  selectedAvatar?.id === avatar.id
                    ? "bg-[#18231c] border-brand shadow-sm"
                    : "bg-[#141414] border-[#2e2e2e] hover:border-[#444]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-black border border-[#2e2e2e] flex-shrink-0">
                    <img
                      src={avatar.previewUrl}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#ededed] flex items-center gap-1.5">
                      {avatar.name}
                      {avatar.consentVerified && (
                        <span title="Verified Digital Likeness">
                          <ShieldCheck className="w-3 h-3 text-brand" />
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#a0a0a0]">{avatar.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-[#888]">
                        {avatar.voiceId}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#222] text-brand">
                        {avatar.stylePreset}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteAvatar(avatar.id, e)}
                  className="p-1 text-[#666] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Script & Video Generator Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedAvatar ? (
            <div className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#ededed]">
                    Generate with {selectedAvatar.name}
                  </span>
                  <span className="text-[11px] text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
                    Phoneme Lip-Sync Ready
                  </span>
                </div>
                <div className="text-xs text-[#a0a0a0]">Cost: 6 Credits</div>
              </div>

              {/* Script Input */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#a0a0a0] font-medium block">
                  Script / Spoken Dialogue
                </label>
                <textarea
                  rows={4}
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Enter the exact lines for the avatar to speak (English, Sheng, or Swahili supported)..."
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] p-3 text-xs leading-relaxed focus:outline-none focus:border-brand placeholder-[#555]"
                />
              </div>

              {/* Background & Aspect Ratio Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
                    Background Scene
                  </label>
                  <select
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="studio">Modern Creator Studio</option>
                    <option value="green-screen">Green Screen (Alpha Key)</option>
                    <option value="transparent">Transparent Overlay</option>
                    <option value="nairobi-comic">Nairobi Street Art Backdrop</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1.5">
                    Format & Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="9:16">9:16 Vertical (TikTok / Reels / Shorts)</option>
                    <option value="16:9">16:9 Widescreen (YouTube)</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleGeneratePresenterVideo}
                disabled={isGenerating || !scriptText.trim()}
                className="w-full py-2.5 px-4 rounded-[6px] bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#09090b] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Speech & Visemes...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Generate Talking Avatar Video
                  </>
                )}
              </button>

              {/* Generated Video Player */}
              {generatedVideo && (
                <div className="mt-4 pt-4 border-t border-[#2e2e2e] space-y-3">
                  <span className="text-xs font-semibold text-[#ededed] flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-brand" />
                    Generated Presenter Video
                  </span>
                  <div className="aspect-[9/16] max-h-[360px] mx-auto rounded-[6px] overflow-hidden bg-black border border-[#2e2e2e]">
                    <video
                      src={generatedVideo.url}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex justify-center">
                    <a
                      href={generatedVideo.url}
                      download
                      className="px-4 py-2 rounded-[6px] bg-[#1e1e1e] hover:bg-[#282828] text-[#ededed] text-xs font-medium inline-flex items-center gap-1.5 border border-[#2e2e2e]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Video
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-[8px] bg-[#141414] border border-[#2e2e2e] text-center text-[#666] text-xs">
              Select an avatar from the roster or create a new one to begin generating presenter clips.
            </div>
          )}
        </div>
      </div>

      {/* Create Avatar Modal with Ethical Consent */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#2e2e2e] rounded-[10px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <h2 className="text-sm font-bold text-[#ededed] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand" />
                Register New AI Avatar
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#666] hover:text-[#ededed] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAvatar} className="space-y-4">
              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Avatar Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Kip Host, Maria Reporter"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Role / Description
                </label>
                <input
                  type="text"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="e.g. Comedy Narrator, Tech Explainer"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                    Voice Profile
                  </label>
                  <select
                    value={newVoice}
                    onChange={(e) => setNewVoice(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="voice-ke-1">Sheng Comic Host (Male)</option>
                    <option value="voice-ke-2">African Storyteller (Female)</option>
                    <option value="voice-en-1">Cinematic Deep Voice</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                    Style Preset
                  </label>
                  <select
                    value={newStyle}
                    onChange={(e) => setNewStyle(e.target.value)}
                    className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-1.5 text-xs focus:outline-none focus:border-brand"
                  >
                    <option value="comic-vibrant">Vibrant Comic</option>
                    <option value="flipaclip-2d">2D Cel Animation</option>
                    <option value="photorealistic">Photorealistic</option>
                  </select>
                </div>
              </div>

              {/* Digital Likeness & Ethics Consent Checkbox */}
              <div className="p-3 rounded-[6px] bg-[#1a1c1a] border border-brand/20 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent-check"
                    checked={newConsent}
                    onChange={(e) => setNewConsent(e.target.checked)}
                    className="mt-0.5 accent-brand rounded"
                  />
                  <label htmlFor="consent-check" className="text-[11px] text-[#ccc] leading-snug cursor-pointer">
                    I declare and verify that I hold explicit authorization, copyright, or digital likeness consent to generate videos with this avatar persona.
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#222] text-[#ededed] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAvatar || !newName || !newConsent}
                  className="px-4 py-1.5 rounded-[6px] bg-brand text-[#09090b] font-semibold text-xs disabled:opacity-50"
                >
                  {isCreatingAvatar ? "Creating..." : "Create Avatar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  BrainCircuit,
  FileText,
  User,
  ThumbsUp,
  ThumbsDown,
  Upload,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Tag,
  FolderOpen,
  ImagePlus,
  Eye,
  Check,
  X,
  Save,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { MediaAsset } from "@/types";
import { ReferenceLibraryModal } from "@/components/media/reference-library-modal";
import { MediaUploader } from "@/components/media/media-uploader";

type TrainingTab = "guidelines" | "profiles" | "rules" | "knowledge";

export default function StudioMemoryPage() {
  const [activeTab, setActiveTab] = useState<TrainingTab>("guidelines");

  // Tab 1: Studio Guidelines
  const [guidelines, setGuidelines] = useState({
    brandVoice: "Vibrant, authentic, witty, high-energy Nairobi comic tone",
    visualStyle: "African comic animation on-twos with rich cel shading, sharp ink linework, saturated tropical palettes",
    doRules: [
      "Keep character outfits strictly consistent with character sheet",
      "Frame subjects dynamically with wide comic angles",
      "Incorporate authentic urban Nairobi street textures",
    ],
    dontRules: [
      "No photorealistic 3D rendering",
      "No western comic speech bubbles",
      "No distorted anatomy or extra limbs",
    ],
    cameraPreferences: "24mm-35mm dynamic comic angles, subtle dutch tilts, dramatic push-ins",
    bannedContent: ["NSFW", "Graphic violence", "Hate speech"],
  });
  const [newDoRule, setNewDoRule] = useState("");
  const [newDontRule, setNewDontRule] = useState("");
  const [isSavingGuidelines, setIsSavingGuidelines] = useState(false);

  // Tab 2: Character Profiles
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDesc, setNewProfileDesc] = useState("");
  const [newProfileWardrobe, setNewProfileWardrobe] = useState("");
  const [newProfileImages, setNewProfileImages] = useState<string[]>([]);
  const [showRefModal, setShowRefModal] = useState(false);

  // Tab 3: Learned Rules & Feedback
  const [rules, setRules] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isDistilling, setIsDistilling] = useState(false);
  const [quickRating, setQuickRating] = useState<"thumbs_up" | "thumbs_down">("thumbs_up");
  const [quickNote, setQuickNote] = useState("");
  const [quickTags, setQuickTags] = useState<string[]>([]);

  // Status message
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchGuidelines();
    fetchProfiles();
    fetchRules();
    fetchFeedback();
  }, []);

  const fetchGuidelines = async () => {
    try {
      const res = await fetch("/api/training/guidelines");
      const data = await res.json();
      if (data.success && data.guidelines) {
        setGuidelines(data.guidelines);
      }
    } catch {
      // Fallback
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/training/profiles");
      const data = await res.json();
      if (data.success && data.profiles) {
        setProfiles(data.profiles);
      }
    } catch {
      // Fallback
    }
  };

  const fetchRules = async () => {
    try {
      const res = await fetch("/api/training/rules");
      const data = await res.json();
      if (data.success && data.rules) {
        setRules(data.rules);
      }
    } catch {
      // Fallback
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch("/api/training/feedback");
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedbackList(data.feedback);
      }
    } catch {
      // Fallback
    }
  };

  // Save Guidelines
  const handleSaveGuidelines = async () => {
    setIsSavingGuidelines(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/training/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guidelines),
      });
      if (res.ok) {
        setStatusMessage("Studio guidelines saved and applied to all generations.");
      }
    } catch {
      setStatusMessage("Failed to save guidelines.");
    } finally {
      setIsSavingGuidelines(false);
    }
  };

  // Add Character Profile
  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || !newProfileDesc.trim()) return;

    try {
      const res = await fetch("/api/training/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProfileName,
          description: newProfileDesc,
          wardrobeAnchor: newProfileWardrobe,
          referenceImageUrls: newProfileImages,
          visualAnchors: [newProfileWardrobe].filter(Boolean),
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfiles((prev) => [data.profile, ...prev]);
        setShowNewProfileModal(false);
        setNewProfileName("");
        setNewProfileDesc("");
        setNewProfileWardrobe("");
        setNewProfileImages([]);
        setStatusMessage("Character DNA profile saved to Studio Memory.");
      }
    } catch {
      setStatusMessage("Failed to create profile.");
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    try {
      const res = await fetch("/api/training/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: quickRating,
          note: quickNote,
          errorTags: quickTags,
        }),
      });

      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedbackList((prev) => [data.feedback, ...prev]);
        setQuickNote("");
        setQuickTags([]);
        setStatusMessage("Feedback recorded. Will be consolidated into learned rules.");
      }
    } catch {
      setStatusMessage("Failed to record feedback.");
    }
  };

  // Run Rule Distillation Background Job
  const handleDistillRules = async () => {
    setIsDistilling(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/training/distill", { method: "POST" });
      const data = await res.json();
      if (data.success && data.rule) {
        setRules((prev) => [data.rule, ...prev]);
        setStatusMessage("Consolidated feedback into new learned rules.");
      }
    } catch {
      setStatusMessage("Distillation job failed.");
    } finally {
      setIsDistilling(false);
    }
  };

  // Pin/Dismiss Rule
  const handleTogglePinRule = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "pinned" ? "approved" : "pinned";
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
    );
    await fetch("/api/training/rules", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
  };

  // Delete Rule
  const handleDeleteRule = async (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/training/rules?id=${id}`, { method: "DELETE" });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 text-xs">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[11px] font-semibold">
            <BrainCircuit className="w-3.5 h-3.5 stroke-[2]" />
            Module 3: Studio Memory (Context Training)
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Training & Studio Memory</h1>
          <p className="text-xs text-[#a0a0a0]">
            Teaches the app&apos;s AI through stored guidelines, character DNA profiles, and distilled generation feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#171717] border border-[#2e2e2e]">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-white text-[11px] font-bold">Memory Active</span>
          </div>
        </div>
      </div>

      {/* Honest Architecture Disclaimer Banner */}
      <div className="p-3.5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0">
            <ShieldCheck className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="font-bold text-white text-xs">Deterministic Context Injection</span>
            <p className="text-[11px] text-[#707070] mt-0.5">
              This does not retrain base weights. It injects persistent guidelines, wardrobe anchors, and
              distilled feedback into every generation prompt and image-to-video reference pack for zero drift.
            </p>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-brand text-xs flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#2e2e2e] pb-2 text-xs">
        {[
          { key: "guidelines", label: "1. Studio Guidelines", icon: FileText },
          { key: "profiles", label: "2. Characters & Styles", icon: User },
          { key: "rules", label: "3. Learned Rules & Feedback", icon: Zap },
          { key: "knowledge", label: "4. What AI Knows", icon: BrainCircuit },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as TrainingTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                isActive
                  ? "bg-[#232323] text-brand font-semibold border border-brand/30"
                  : "text-[#a0a0a0] hover:text-[#ededed]"
              }`}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2]" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STUDIO GUIDELINES                                  */}
      {/* ======================================================== */}
      {activeTab === "guidelines" && (
        <div className="space-y-6">
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#252525]">
              <div>
                <h3 className="text-sm font-bold text-white">Studio Guidelines Document</h3>
                <p className="text-[11px] text-[#707070]">
                  Master production rulebook injected into the prompt compiler.
                </p>
              </div>
              <button
                onClick={handleSaveGuidelines}
                disabled={isSavingGuidelines}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-bold text-xs shadow-sm transition-all disabled:opacity-40"
              >
                {isSavingGuidelines ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Guidelines</span>
              </button>
            </div>

            {/* Brand Voice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Brand Voice & Narrative Tone</label>
              <input
                type="text"
                value={guidelines.brandVoice}
                onChange={(e) => setGuidelines((prev) => ({ ...prev, brandVoice: e.target.value }))}
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] px-3 py-2 text-xs text-white outline-hidden"
              />
            </div>

            {/* Visual Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Visual Art Style Anchors</label>
              <textarea
                rows={2}
                value={guidelines.visualStyle}
                onChange={(e) => setGuidelines((prev) => ({ ...prev, visualStyle: e.target.value }))}
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] p-3 text-xs text-white outline-hidden"
              />
            </div>

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#252525]">
              {/* Do Rules */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-emerald-400">DO Rules (Always Enforce)</label>
                <div className="space-y-1.5">
                  {guidelines.doRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-[4px] bg-[#121212] border border-emerald-500/20 text-[11px] text-white"
                    >
                      <span>{rule}</span>
                      <button
                        onClick={() =>
                          setGuidelines((prev) => ({
                            ...prev,
                            doRules: prev.doRules.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-[#707070] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add a DO rule..."
                      value={newDoRule}
                      onChange={(e) => setNewDoRule(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newDoRule.trim()) {
                          setGuidelines((prev) => ({ ...prev, doRules: [...prev.doRules, newDoRule.trim()] }));
                          setNewDoRule("");
                        }
                      }}
                      className="flex-1 bg-[#121212] border border-[#2e2e2e] rounded px-2.5 py-1 text-xs text-white outline-hidden focus:border-brand"
                    />
                    <button
                      onClick={() => {
                        if (newDoRule.trim()) {
                          setGuidelines((prev) => ({ ...prev, doRules: [...prev.doRules, newDoRule.trim()] }));
                          setNewDoRule("");
                        }
                      }}
                      className="px-3 py-1 rounded bg-[#222] hover:bg-[#282828] text-white font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Don't Rules */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-red-400">DON&apos;T Rules (Negative Guardrails)</label>
                <div className="space-y-1.5">
                  {guidelines.dontRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-[4px] bg-[#121212] border border-red-500/20 text-[11px] text-white"
                    >
                      <span>{rule}</span>
                      <button
                        onClick={() =>
                          setGuidelines((prev) => ({
                            ...prev,
                            dontRules: prev.dontRules.filter((_, i) => i !== idx),
                          }))
                        }
                        className="text-[#707070] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add a DON'T rule..."
                      value={newDontRule}
                      onChange={(e) => setNewDontRule(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newDontRule.trim()) {
                          setGuidelines((prev) => ({ ...prev, dontRules: [...prev.dontRules, newDontRule.trim()] }));
                          setNewDontRule("");
                        }
                      }}
                      className="flex-1 bg-[#121212] border border-[#2e2e2e] rounded px-2.5 py-1 text-xs text-white outline-hidden focus:border-brand"
                    />
                    <button
                      onClick={() => {
                        if (newDontRule.trim()) {
                          setGuidelines((prev) => ({ ...prev, dontRules: [...prev.dontRules, newDontRule.trim()] }));
                          setNewDontRule("");
                        }
                      }}
                      className="px-3 py-1 rounded bg-[#222] hover:bg-[#282828] text-white font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Camera Preferences */}
            <div className="space-y-1.5 pt-2 border-t border-[#252525]">
              <label className="text-xs font-semibold text-white">Camera & Motion Preferences</label>
              <input
                type="text"
                value={guidelines.cameraPreferences}
                onChange={(e) =>
                  setGuidelines((prev) => ({ ...prev, cameraPreferences: e.target.value }))
                }
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] px-3 py-2 text-xs text-white outline-hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CHARACTERS & STYLES PROFILES                      */}
      {/* ======================================================== */}
      {activeTab === "profiles" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
            <div>
              <h3 className="text-sm font-bold text-white">Character & Style Profiles ({profiles.length})</h3>
              <p className="text-[11px] text-[#707070]">
                Reusable character DNA and style anchors injected into generation prompts and reference packs.
              </p>
            </div>
            <button
              onClick={() => setShowNewProfileModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-bold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="p-5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{profile.name}</span>
                    <span className="px-2 py-0.5 rounded bg-brand/10 border border-brand/20 text-brand text-[10px] font-mono font-bold">
                      DNA Locked
                    </span>
                  </div>

                  <p className="text-xs text-[#a0a0a0] leading-relaxed">{profile.description}</p>

                  {profile.wardrobeAnchor && (
                    <div className="p-2.5 rounded-[4px] bg-[#121212] border border-[#252525] text-[11px]">
                      <span className="text-brand font-semibold">Wardrobe Anchor: </span>
                      <span className="text-[#ededed]">{profile.wardrobeAnchor}</span>
                    </div>
                  )}

                  {/* Reference Image Previews */}
                  {profile.referenceImageUrls && profile.referenceImageUrls.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {profile.referenceImageUrls.map((url: string, i: number) => (
                        <div
                          key={i}
                          className="w-14 h-14 rounded-[4px] bg-black overflow-hidden border border-[#2e2e2e]"
                        >
                          <img src={url} alt={profile.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#252525] text-[11px] text-[#707070]">
                  <span>Automatically injected in prompt builder</span>
                  <span className="text-emerald-400 font-medium">✓ Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: LEARNED RULES & EXPERIENCE FEEDBACK               */}
      {/* ======================================================== */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          {/* Distillation action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
            <div>
              <h3 className="text-sm font-bold text-white">Distilled Studio Rules ({rules.length})</h3>
              <p className="text-[11px] text-[#707070]">
                Accumulated feedback and ratings synthesized into concise rules. Pin rules to force them on all models.
              </p>
            </div>
            <button
              onClick={handleDistillRules}
              disabled={isDistilling}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-bold transition-all disabled:opacity-40"
            >
              {isDistilling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              <span>Distill Feedback into Rules</span>
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-2.5">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 rounded-[6px] bg-[#171717] border border-[#2e2e2e] flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      rule.category === "style"
                        ? "bg-comic-purple/20 text-comic-purple border border-comic-purple/30"
                        : rule.category === "motion"
                        ? "bg-comic-yellow/20 text-comic-yellow border border-comic-yellow/30"
                        : rule.category === "face"
                        ? "bg-comic-pink/20 text-comic-pink border border-comic-pink/30"
                        : "bg-brand/20 text-brand border border-brand/30"
                    }`}
                  >
                    {rule.category}
                  </span>
                  <span className="text-[#ededed] font-medium leading-relaxed">{rule.ruleText}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePinRule(rule.id, rule.status)}
                    className={`p-1.5 rounded-[4px] transition-colors ${
                      rule.status === "pinned"
                        ? "bg-brand text-[#09090b] font-bold"
                        : "text-[#707070] hover:text-white"
                    }`}
                    title={rule.status === "pinned" ? "Unpin rule" : "Pin rule"}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 rounded-[4px] text-[#707070] hover:text-red-400"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Feedback Submission Box */}
          <div className="p-5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-[#a0a0a0]">
              Submit Generation Feedback
            </h4>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuickRating("thumbs_up")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border ${
                    quickRating === "thumbs_up"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold"
                      : "border-[#2e2e2e] text-[#a0a0a0]"
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Looks Great</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickRating("thumbs_down")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border ${
                    quickRating === "thumbs_down"
                      ? "bg-red-500/10 border-red-500 text-red-400 font-bold"
                      : "border-[#2e2e2e] text-[#a0a0a0]"
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Needs Improvement</span>
                </button>
              </div>

              {/* Error Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[#707070] text-[11px]">Tag Issue:</span>
                {["face", "motion", "style", "pacing"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setQuickTags((prev) =>
                        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                      )
                    }
                    className={`px-2.5 py-1 rounded-[4px] capitalize text-[10px] font-mono ${
                      quickTags.includes(tag)
                        ? "bg-brand text-[#09090b] font-bold"
                        : "bg-[#121212] border border-[#2e2e2e] text-[#a0a0a0]"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="What was wrong or right with the generation (e.g. jacket color, camera jerk)?"
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] p-2.5 text-xs text-white outline-hidden"
              />

              <button
                type="submit"
                disabled={!quickNote.trim()}
                className="px-4 py-1.5 rounded-[6px] bg-brand text-[#09090b] font-bold text-xs disabled:opacity-40"
              >
                Save Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: WHAT THE AI KNOWS                                  */}
      {/* ======================================================== */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#707070]">Studio Guidelines</span>
              <div className="text-2xl font-black text-brand">Active</div>
              <p className="text-[10px] text-[#707070]">Voice, style, do/don&apos;t guardrails loaded</p>
            </div>
            <div className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#707070]">DNA Profiles</span>
              <div className="text-2xl font-black text-white">{profiles.length}</div>
              <p className="text-[10px] text-[#707070]">Persistent character appearances</p>
            </div>
            <div className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#707070]">Learned Rules</span>
              <div className="text-2xl font-black text-white">{rules.length}</div>
              <p className="text-[10px] text-[#707070]">Distilled from accumulated feedback</p>
            </div>
            <div className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#707070]">Recorded Feedbacks</span>
              <div className="text-2xl font-black text-white">{feedbackList.length}</div>
              <p className="text-[10px] text-[#707070]">Continuous learning events</p>
            </div>
          </div>

          {/* Compiled Prompt Preview */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-brand" />
                Live Prompt Injection Preview
              </h3>
              <span className="text-[10px] text-brand font-mono">Compiled at Generation Time</span>
            </div>

            <p className="text-[11px] text-[#707070]">
              This is the exact structured prompt assembled by the Studio Memory engine and sent to fal.ai or Replicate:
            </p>

            <div className="p-4 rounded-[6px] bg-[#121212] border border-[#252525] font-mono text-[11px] text-[#ededed] leading-relaxed space-y-2">
              <span className="text-brand">[STUDIO_STYLE]:</span> {guidelines.visualStyle}
              <br />
              <span className="text-comic-yellow">[CHARACTER_DNA]:</span> Brian Otieno (dark green safari tech jacket with front zip, black tee, dreadlocks)
              <br />
              <span className="text-comic-cyan">[LEARNED_GUARDRAIL]:</span> {rules[0]?.ruleText || "No facial morphing during fast pan movements"}
              <br />
              <span className="text-emerald-400">[CAMERA]:</span> {guidelines.cameraPreferences}
              <br />
              <span className="text-red-400">[NEGATIVE_GUARDRAILS]:</span> {guidelines.dontRules.join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* New Profile Modal */}
      {showNewProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleCreateProfile}
            className="w-full max-w-lg bg-[#171717] border border-[#2e2e2e] rounded-[10px] p-6 space-y-4 shadow-2xl text-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <h3 className="text-sm font-bold text-white">New Character / Style DNA Profile</h3>
              <button
                type="button"
                onClick={() => setShowNewProfileModal(false)}
                className="text-[#707070] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white">Character Name</label>
              <input
                type="text"
                required
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="e.g. Brian Otieno"
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[4px] px-3 py-1.5 text-xs text-white outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white">Appearance & Traits</label>
              <textarea
                rows={2}
                required
                value={newProfileDesc}
                onChange={(e) => setNewProfileDesc(e.target.value)}
                placeholder="22-year-old developer, neat dreadlocks, sharp observant eyes..."
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[4px] p-2.5 text-xs text-white outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white">Signature Wardrobe Anchor</label>
              <input
                type="text"
                value={newProfileWardrobe}
                onChange={(e) => setNewProfileWardrobe(e.target.value)}
                placeholder="Signature dark green safari tech jacket with front zip, black tee..."
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[4px] px-3 py-1.5 text-xs text-white outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#2e2e2e]">
              <button
                type="button"
                onClick={() => setShowNewProfileModal(false)}
                className="px-4 py-1.5 rounded-[4px] border border-[#2e2e2e] text-[#a0a0a0] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-[4px] bg-brand text-[#09090b] font-bold"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

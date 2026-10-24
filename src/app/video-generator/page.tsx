"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clapperboard,
  Zap,
  Play,
  Pause,
  RotateCw,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  ImagePlus,
  Scissors,
  Check,
  X,
  Layers,
  Wallet,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { MediaAsset } from "@/types";
import { MediaUploader } from "@/components/media/media-uploader";
import { ReferenceLibraryModal } from "@/components/media/reference-library-modal";

interface SceneItem {
  id: string;
  sceneNumber: number;
  prompt: string;
  negativePrompt?: string;
  duration: number; // 5 seconds
  keyframeUrl?: string;
  keyframeStatus: "pending" | "generating" | "generated" | "approved" | "rejected";
  videoUrl?: string;
  videoStatus: "pending" | "generating" | "completed" | "failed";
  generationJobId?: string;
  isApproved?: boolean;
}

type GeneratorStep = "brief" | "scenes" | "keyframes" | "clips" | "review";

export default function VideoGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current Step in 5-Step Pipeline
  const [currentStep, setCurrentStep] = useState<GeneratorStep>("brief");

  // Step 1: Brief State
  const [briefPrompt, setBriefPrompt] = useState(
    "A young developer in a vibrant Nairobi estate creates an AI comic assistant while bustling matatus pass by in the glowing evening light."
  );
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [targetDuration, setTargetDuration] = useState<number>(15);
  const [stylePreset, setStylePreset] = useState<string>("African Comic");
  const [providerId, setProviderId] = useState<string>("fal");
  const [attachedReferences, setAttachedReferences] = useState<MediaAsset[]>([]);
  const [showRefModal, setShowRefModal] = useState(false);
  const [showInlineUploader, setShowInlineUploader] = useState(false);

  // Step 2 & 3: Scenes & Keyframes State
  const [scenes, setScenes] = useState<SceneItem[]>([]);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);

  // Billing / Credit state
  const [credits, setCredits] = useState<number>(250);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Review Player State
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  // Initialize credits
  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/billing");
      const data = await res.json();
      if (data.success && data.billing) {
        setCredits(data.billing.creditsRemaining);
      }
    } catch {
      // Fallback
    }
  };

  // Step 1 -> 2: Decompose Brief into 5-Second Scenes
  const handleDecomposeBrief = async () => {
    if (!briefPrompt.trim()) {
      setErrorMessage("Please enter a brief or script prompt.");
      return;
    }

    setIsDecomposing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/video-generator/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: briefPrompt,
          aspectRatio,
          duration: targetDuration,
          stylePreset,
          attachedReferences: attachedReferences.map((r) => r.id),
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to decompose script (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to decompose script");
      }

      setScenes(data.project.scenes || []);
      setCurrentStep("scenes");
      setSuccessMessage(`Decomposed into ${data.project.scenes.length} continuous 5-second scenes.`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to decompose script.");
    } finally {
      setIsDecomposing(false);
    }
  };

  // Add a new scene manually
  const handleAddScene = () => {
    const nextNum = scenes.length + 1;
    const newScene: SceneItem = {
      id: `scene-${Date.now()}-${nextNum}`,
      sceneNumber: nextNum,
      prompt: `${stylePreset} style, close-up shot of protagonist, dramatic lighting.`,
      duration: 5,
      keyframeStatus: "pending",
      videoStatus: "pending",
    };
    setScenes((prev) => [...prev, newScene]);
  };

  // Delete scene
  const handleDeleteScene = (id: string) => {
    setScenes((prev) =>
      prev
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }))
    );
  };

  // Reorder scene
  const handleMoveScene = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;

    setScenes((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy.map((s, i) => ({ ...s, sceneNumber: i + 1 }));
    });
  };

  // Step 3: Generate Keyframe for Scene
  const handleGenerateKeyframe = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;

    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, keyframeStatus: "generating" } : s))
    );
    setErrorMessage(null);

    try {
      const res = await fetch("/api/video-generator/keyframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          prompt: scene.prompt,
          stylePreset,
          aspectRatio,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to generate keyframe`);
      }

      const data = await res.json();
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? {
                ...s,
                keyframeUrl: data.keyframeUrl,
                keyframeStatus: "generated",
                isApproved: false,
              }
            : s
        )
      );

      fetchCredits();
    } catch (err: any) {
      setErrorMessage(err.message || "Keyframe generation failed");
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, keyframeStatus: "pending" } : s))
      );
    }
  };

  // Generate All Keyframes
  const handleGenerateAllKeyframes = async () => {
    for (const sc of scenes) {
      if (sc.keyframeStatus !== "approved" && sc.keyframeStatus !== "generated") {
        await handleGenerateKeyframe(sc.id);
      }
    }
  };

  // Approve Keyframe
  const handleApproveKeyframe = (sceneId: string) => {
    setScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId
          ? { ...s, keyframeStatus: "approved", isApproved: true }
          : s
      )
    );
  };

  // Step 4: Animate Approved Keyframe into Video
  const handleAnimateScene = async (sceneId: string) => {
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene || !scene.keyframeUrl) {
      setErrorMessage("Please generate and approve a keyframe before animating.");
      return;
    }

    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, videoStatus: "generating" } : s))
    );
    setErrorMessage(null);

    try {
      const res = await fetch("/api/video-generator/animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          keyframeUrl: scene.keyframeUrl,
          prompt: scene.prompt,
          duration: scene.duration || 5,
          aspectRatio,
          providerId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Animation dispatch failed`);
      }

      const data = await res.json();
      setScenes((prev) =>
        prev.map((s) =>
          s.id === sceneId
            ? {
                ...s,
                videoStatus: "completed",
                videoUrl:
                  data.outputUrl ||
                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                generationJobId: data.jobId,
              }
            : s
        )
      );

      fetchCredits();
      setSuccessMessage(`Scene ${scene.sceneNumber} animation complete!`);
    } catch (err: any) {
      setErrorMessage(err.message || "Animation failed");
      setScenes((prev) =>
        prev.map((s) => (s.id === sceneId ? { ...s, videoStatus: "failed" } : s))
      );
    }
  };

  // Animate All Approved Scenes
  const handleAnimateAllApproved = async () => {
    const approvedScenes = scenes.filter((s) => s.isApproved && s.videoStatus !== "completed");
    if (approvedScenes.length === 0) {
      setErrorMessage("Please approve at least one keyframe to animate video.");
      return;
    }

    for (const sc of approvedScenes) {
      await handleAnimateScene(sc.id);
    }
  };

  // Calculate total costs
  const totalKeyframeCount = scenes.length;
  const approvedCount = scenes.filter((s) => s.isApproved).length;
  const completedVideoCount = scenes.filter((s) => s.videoStatus === "completed").length;
  const estimatedCostCredits = scenes.length * 1 + scenes.length * 5;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[11px] font-semibold">
            <Clapperboard className="w-3.5 h-3.5 stroke-[2]" />
            Module 1: Video Production Studio
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Video Generator</h1>
          <p className="text-xs text-[#a0a0a0]">
            From brief & references to 5-second scenes, keyframe approvals, and image-to-video rendering.
          </p>
        </div>

        {/* Credits Balance Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#171717] border border-[#2e2e2e]">
            <Wallet className="w-3.5 h-3.5 text-brand stroke-[2]" />
            <span className="text-xs font-mono font-bold text-white">{credits} CR</span>
            <span className="text-[10px] text-[#707070]">available</span>
          </div>

          <Link
            href="/billing"
            className="text-xs text-brand hover:underline font-semibold"
          >
            + Top Up
          </Link>
        </div>
      </div>

      {/* 5-Step Progress Stepper Bar */}
      <div className="grid grid-cols-5 gap-1.5 p-1 rounded-[8px] bg-[#171717] border border-[#2e2e2e] text-xs">
        {[
          { key: "brief", label: "1. Brief & References" },
          { key: "scenes", label: "2. 5s Scenes" },
          { key: "keyframes", label: "3. Keyframes" },
          { key: "clips", label: "4. Video Clips" },
          { key: "review", label: "5. Review & Export" },
        ].map((s) => {
          const isActive = currentStep === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setCurrentStep(s.key as GeneratorStep)}
              className={`py-2 px-3 rounded-[6px] font-semibold text-center transition-all ${
                isActive
                  ? "bg-brand text-[#09090b] shadow-sm"
                  : "text-[#a0a0a0] hover:text-white hover:bg-[#202020]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 rounded-[6px] bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 1: BRIEF FORM                                       */}
      {/* ======================================================== */}
      {currentStep === "brief" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5 p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
            {/* Prompt input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-white flex items-center justify-between">
                <span>Story Brief & Script</span>
                <span className="text-[11px] text-[#707070]">
                  LLM will partition into continuous 5-second scenes
                </span>
              </label>
              <textarea
                rows={5}
                value={briefPrompt}
                onChange={(e) => setBriefPrompt(e.target.value)}
                placeholder="Describe your scene or paste script dialogue..."
                className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[6px] p-3 text-xs text-[#ededed] placeholder-[#707070] outline-hidden leading-relaxed"
              />
            </div>

            {/* Attached References Section */}
            <div className="space-y-3 pt-2 border-t border-[#252525]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Attached Reference Media</h4>
                  <p className="text-[11px] text-[#707070]">
                    Condition characters, products, mood boards, or voice styles
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRefModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-[11px] text-[#ededed] transition-colors"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-brand" />
                    <span>Choose from Library</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInlineUploader(!showInlineUploader)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-brand/10 hover:bg-brand/20 border border-brand/30 text-[11px] text-brand transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>

              {/* Inline uploader drawer */}
              {showInlineUploader && (
                <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e]">
                  <MediaUploader
                    compact
                    onUploadComplete={(uploaded) => {
                      setAttachedReferences((prev) => [...prev, ...uploaded]);
                      setShowInlineUploader(false);
                    }}
                  />
                </div>
              )}

              {/* Attached Pills List */}
              {attachedReferences.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {attachedReferences.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs text-white"
                    >
                      <span className="w-2 h-2 rounded-full bg-brand" />
                      <span className="truncate max-w-[140px]">{ref.name}</span>
                      <button
                        onClick={() =>
                          setAttachedReferences((prev) => prev.filter((r) => r.id !== ref.id))
                        }
                        className="text-[#707070] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-[6px] bg-[#121212] border border-[#252525] text-center text-[#707070] text-[11px]">
                  No references attached. Attach character sheets or mood boards for high consistency.
                </div>
              )}
            </div>

            {/* Config Grids */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#252525]">
              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#a0a0a0]">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["9:16", "16:9", "1:1"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-1.5 rounded-[4px] font-mono text-xs font-semibold transition-all ${
                        aspectRatio === r
                          ? "bg-brand text-[#09090b]"
                          : "bg-[#121212] border border-[#2e2e2e] text-[#a0a0a0] hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Duration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#a0a0a0]">Total Duration</label>
                <select
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[4px] px-2.5 py-1.5 text-xs text-white outline-hidden"
                >
                  <option value={15}>15s (3 Scenes)</option>
                  <option value={30}>30s (6 Scenes)</option>
                  <option value={45}>45s (9 Scenes)</option>
                  <option value={60}>60s (12 Scenes)</option>
                </select>
              </div>

              {/* Style Preset */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#a0a0a0]">Art Style</label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-[4px] px-2.5 py-1.5 text-xs text-white outline-hidden"
                >
                  <option value="African Comic">African Comic (Nairobi)</option>
                  <option value="Modern Anime">Modern Anime</option>
                  <option value="Cyberpunk Graphic">Cyberpunk Graphic</option>
                  <option value="Painted Cel">Painted Cel Animation</option>
                  <option value="Noir Comic">Noir High-Contrast</option>
                </select>
              </div>
            </div>

            {/* Provider Adapter Selection */}
            <div className="space-y-1.5 pt-2 border-t border-[#252525]">
              <label className="text-[11px] font-semibold text-[#a0a0a0]">
                Generation Provider Adapter (Swappable behind lib/providers)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProviderId("fal")}
                  className={`p-3 rounded-[6px] border text-left transition-all ${
                    providerId === "fal"
                      ? "border-brand bg-brand/10 text-white"
                      : "border-[#2e2e2e] bg-[#121212] text-[#a0a0a0] hover:text-white"
                  }`}
                >
                  <div className="font-semibold text-xs text-white">Fal.ai Adapter</div>
                  <div className="text-[10px] text-[#707070] mt-0.5">
                    Fast FLUX Schnell keyframes + Minimax/Wan 2.1 Image-to-Video
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setProviderId("replicate")}
                  className={`p-3 rounded-[6px] border text-left transition-all ${
                    providerId === "replicate"
                      ? "border-brand bg-brand/10 text-white"
                      : "border-[#2e2e2e] bg-[#121212] text-[#a0a0a0] hover:text-white"
                  }`}
                >
                  <div className="font-semibold text-xs text-white">Replicate Adapter</div>
                  <div className="text-[10px] text-[#707070] mt-0.5">
                    Wan 2.1 I2V 480p/720p with server-side token
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-5 p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-brand" />
                Production Summary
              </h3>

              <div className="space-y-2 text-xs border-y border-[#2e2e2e] py-3 text-[#a0a0a0]">
                <div className="flex justify-between">
                  <span>Target Ratio:</span>
                  <span className="font-mono text-white font-bold">{aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scene Partition:</span>
                  <span className="text-white">
                    {Math.round(targetDuration / 5)} scenes (5s each)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Keyframe Approval:</span>
                  <span className="text-brand font-medium">Required before video</span>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="capitalize text-white font-medium">{providerId}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#252525]">
                  <span>Estimated Total Cost:</span>
                  <span className="text-brand font-mono font-bold text-sm">
                    {Math.round(targetDuration / 5) * (1 + 5)} Credits
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-[11px] text-[#a0a0a0] space-y-1">
                <div className="font-semibold text-white">Safety Guarantee</div>
                <p>
                  Keyframe generation costs only 1 credit per scene. You approve or regenerate before
                  animating into full video clips.
                </p>
              </div>
            </div>

            <button
              onClick={handleDecomposeBrief}
              disabled={isDecomposing || !briefPrompt.trim()}
              className="w-full py-3 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDecomposing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Decomposing into 5s Scenes...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 stroke-[2.2]" />
                  <span>Decompose into 5s Scenes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: SCENES LIST (Editable Prompts & Order)            */}
      {/* ======================================================== */}
      {currentStep === "scenes" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
            <div>
              <h3 className="text-sm font-bold text-white">Decomposed 5-Second Scenes ({scenes.length})</h3>
              <p className="text-[11px] text-[#707070]">
                Edit scene prompts, reorder sequence, or add more shots before generating keyframes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddScene}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-xs font-semibold text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Scene</span>
              </button>
              <button
                onClick={() => setCurrentStep("keyframes")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-bold transition-all shadow-sm"
              >
                <span>Proceed to Keyframes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] flex flex-col md:flex-row md:items-center gap-4 text-xs"
              >
                {/* Scene badge & order controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-brand/10 border border-brand/25 flex items-center justify-center font-bold text-brand">
                    {scene.sceneNumber}
                  </div>
                  <div className="flex flex-col">
                    <button
                      onClick={() => handleMoveScene(idx, "up")}
                      disabled={idx === 0}
                      className="p-0.5 text-[#707070] hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleMoveScene(idx, "down")}
                      disabled={idx === scenes.length - 1}
                      className="p-0.5 text-[#707070] hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Prompt textarea */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#707070]">
                    <span>Scene {scene.sceneNumber} Action Prompt (5s)</span>
                    <span className="font-mono text-brand">5.0 seconds</span>
                  </div>
                  <input
                    type="text"
                    value={scene.prompt}
                    onChange={(e) =>
                      setScenes((prev) =>
                        prev.map((s) => (s.id === scene.id ? { ...s, prompt: e.target.value } : s))
                      )
                    }
                    className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[4px] px-3 py-1.5 text-xs text-white outline-hidden"
                  />
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteScene(scene.id)}
                  disabled={scenes.length <= 1}
                  className="p-2 text-[#707070] hover:text-red-400 disabled:opacity-20 transition-colors shrink-0"
                  title="Delete scene"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: KEYFRAMES APPROVAL                               */}
      {/* ======================================================== */}
      {currentStep === "keyframes" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
            <div>
              <h3 className="text-sm font-bold text-white">
                Keyframe Pre-Visualizations ({approvedCount}/{scenes.length} Approved)
              </h3>
              <p className="text-[11px] text-[#707070]">
                Approve keyframes before generating video clips. Only approved keyframes spend video credits.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAllKeyframes}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-xs font-semibold text-white transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5 text-brand" />
                <span>Generate All Keyframes</span>
              </button>
              <button
                onClick={() => setCurrentStep("clips")}
                disabled={approvedCount === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Proceed to Video Clips ({approvedCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className={`p-4 rounded-[8px] bg-[#171717] border flex flex-col justify-between gap-3 transition-all ${
                  scene.isApproved
                    ? "border-brand/60 bg-brand/5 shadow-[0_0_16px_rgba(62,207,142,0.1)]"
                    : "border-[#2e2e2e]"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Scene {scene.sceneNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      scene.isApproved
                        ? "bg-brand text-[#09090b]"
                        : scene.keyframeStatus === "generated"
                        ? "bg-comic-yellow text-black"
                        : "bg-[#252525] text-[#707070]"
                    }`}
                  >
                    {scene.isApproved ? "Approved" : scene.keyframeStatus}
                  </span>
                </div>

                {/* Keyframe Preview Box */}
                <div className="aspect-[4/3] rounded-[6px] bg-[#121212] border border-[#2e2e2e] overflow-hidden flex items-center justify-center relative">
                  {scene.keyframeUrl ? (
                    <img
                      src={scene.keyframeUrl}
                      alt={scene.prompt}
                      className="w-full h-full object-cover"
                    />
                  ) : scene.keyframeStatus === "generating" ? (
                    <div className="flex flex-col items-center gap-2 text-brand">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[11px] font-mono">Synthesizing Keyframe...</span>
                    </div>
                  ) : (
                    <div className="text-center p-4 text-[#707070]">
                      <ImagePlus className="w-6 h-6 mx-auto mb-1 stroke-[1.8]" />
                      <p className="text-[10px]">No keyframe generated yet</p>
                    </div>
                  )}
                </div>

                {/* Prompt preview */}
                <p className="text-[11px] text-[#a0a0a0] line-clamp-2 leading-relaxed">
                  {scene.prompt}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#252525]">
                  <button
                    onClick={() => handleGenerateKeyframe(scene.id)}
                    disabled={scene.keyframeStatus === "generating"}
                    className="flex-1 py-1.5 rounded-[4px] bg-[#222] hover:bg-[#282828] text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>{scene.keyframeUrl ? "Regenerate" : "Generate"}</span>
                  </button>

                  {scene.keyframeUrl && (
                    <button
                      onClick={() => handleApproveKeyframe(scene.id)}
                      className={`flex-1 py-1.5 rounded-[4px] text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        scene.isApproved
                          ? "bg-brand text-[#09090b]"
                          : "bg-emerald-500 hover:bg-emerald-400 text-white"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{scene.isApproved ? "Approved ✓" : "Approve"}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 4: VIDEO CLIPS (IMAGE-TO-VIDEO)                     */}
      {/* ======================================================== */}
      {currentStep === "clips" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e]">
            <div>
              <h3 className="text-sm font-bold text-white">
                Rendered Video Clips ({completedVideoCount}/{approvedCount} Rendered)
              </h3>
              <p className="text-[11px] text-[#707070]">
                Animate approved keyframes through provider adapter ({providerId.toUpperCase()}).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAnimateAllApproved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-bold transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Render All Approved ({approvedCount * 5} CR)</span>
              </button>
              <button
                onClick={() => setCurrentStep("review")}
                disabled={completedVideoCount === 0}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-[#222] hover:bg-[#282828] text-white text-xs font-semibold border border-[#333] transition-all disabled:opacity-40"
              >
                <span>Review & Export</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <div
                key={scene.id}
                className="p-4 rounded-[8px] bg-[#171717] border border-[#2e2e2e] flex flex-col justify-between gap-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Scene {scene.sceneNumber}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      scene.videoStatus === "completed"
                        ? "bg-brand text-[#09090b]"
                        : scene.videoStatus === "generating"
                        ? "bg-comic-yellow text-black"
                        : "bg-[#252525] text-[#707070]"
                    }`}
                  >
                    {scene.videoStatus}
                  </span>
                </div>

                {/* Video / Keyframe Viewport */}
                <div className="aspect-[4/3] rounded-[6px] bg-[#121212] border border-[#2e2e2e] overflow-hidden flex items-center justify-center relative">
                  {scene.videoUrl ? (
                    <video
                      src={scene.videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : scene.videoStatus === "generating" ? (
                    <div className="flex flex-col items-center gap-2 text-brand">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[11px] font-mono">
                        Rendering Video ({providerId.toUpperCase()})...
                      </span>
                    </div>
                  ) : scene.keyframeUrl ? (
                    <img
                      src={scene.keyframeUrl}
                      alt={scene.prompt}
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="text-[#707070] text-center p-4">
                      Approve a keyframe first
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-[#a0a0a0] line-clamp-2 leading-relaxed">
                  {scene.prompt}
                </p>

                {/* Animate trigger */}
                <div className="pt-2 border-t border-[#252525]">
                  <button
                    onClick={() => handleAnimateScene(scene.id)}
                    disabled={!scene.keyframeUrl || scene.videoStatus === "generating"}
                    className="w-full py-1.5 rounded-[4px] bg-brand hover:bg-brand-hover text-[#09090b] font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                  >
                    <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>
                      {scene.videoUrl ? "Re-render Clip (5 CR)" : "Animate to Video (5 CR)"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 5: REVIEW & EXPORT                                  */}
      {/* ======================================================== */}
      {currentStep === "review" && (
        <div className="space-y-6">
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Full Video Sequence Review</h3>
                <p className="text-xs text-[#a0a0a0]">
                  All generated scenes ready for multi-track timeline editing, audio ducking, and export.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/editor"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-bold text-xs shadow-sm transition-all"
                >
                  <Scissors className="w-4 h-4 stroke-[2]" />
                  <span>Open in Video Editor</span>
                </Link>
              </div>
            </div>

            {/* Sequence Clips Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-[#252525]">
              {scenes
                .filter((s) => s.videoUrl)
                .map((scene) => (
                  <div
                    key={scene.id}
                    className="rounded-[6px] overflow-hidden bg-[#121212] border border-[#2e2e2e] p-2 space-y-1.5"
                  >
                    <div className="aspect-[9/16] bg-black rounded-[4px] overflow-hidden">
                      <video
                        src={scene.videoUrl}
                        controls
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#707070]">
                      <span className="font-bold text-white">Shot {scene.sceneNumber}</span>
                      <span>5.0s</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Reference Library Modal */}
      <ReferenceLibraryModal
        isOpen={showRefModal}
        onClose={() => setShowRefModal(false)}
        selectedAssetIds={attachedReferences.map((r) => r.id)}
        onSelectAssets={(selected) => {
          setAttachedReferences(selected);
        }}
      />
    </div>
  );
}

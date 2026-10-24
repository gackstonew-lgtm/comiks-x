"use client";

import { useState, useEffect } from "react";
import { Episode } from "@/types";
import {
  Play,
  Pause,
  XCircle,
  RotateCw,
  Clock,
  DollarSign,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function QueuePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("");
  const [queueData, setQueueData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  useEffect(() => {
    if (selectedEpisodeId) {
      fetchQueueStatus();
      const interval = setInterval(fetchQueueStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedEpisodeId]);

  const fetchEpisodes = async () => {
    try {
      const res = await fetch("/api/episodes");
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setEpisodes(data.data);
        setSelectedEpisodeId(data.data[0].id);
      } else {
        setEpisodes([]);
        setSelectedEpisodeId("");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchQueueStatus = async () => {
    try {
      const res = await fetch(`/api/queue?episodeId=${selectedEpisodeId}`);
      const data = await res.json();
      if (data.success) {
        setQueueData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQueueAction = async (action: "start" | "pause" | "resume" | "cancel" | "retry", sceneId?: string) => {
    setActionLoading(true);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId: selectedEpisodeId,
          action,
          sceneId,
        }),
      });
      await fetchQueueStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const progress = queueData?.progress;
  const cost = queueData?.costEstimate;
  const currentEp = episodes.find((e) => e.id === selectedEpisodeId);

  if (!loading && episodes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto w-full p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-14 h-14 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4">
          <Clock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Generation Queue Idle</h2>
        <p className="text-xs text-studio-400 max-w-md mb-6 leading-relaxed">
          No episodes are currently queued or pending generation. Create an episode in Story Creator to generate scenes and track AI rendering jobs.
        </p>
        <a
          href="/story-creator"
          className="px-4 py-2 rounded-[6px] bg-brand text-[#09090b] font-medium text-xs hover:bg-brand-hover transition-colors"
        >
          Create Episode
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Background Generation Queue & Cost Engine
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#ededed] tracking-tight">
            Generation Queue & Budget
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1 max-w-xl leading-relaxed">
            Non-blocking background rendering for multi-scene episodes. Track progress, pause/cancel, retry failed scenes, and avoid duplicate generation costs.
          </p>
        </div>

        {/* Episode Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-[#707070] uppercase">Episode:</span>
          <select
            value={selectedEpisodeId}
            onChange={(e) => setSelectedEpisodeId(e.target.value)}
            className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] px-3 py-1.5 text-xs text-[#ededed] focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40"
          >
            {episodes.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.title} ({ep.scenes?.length || 0} scenes)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Status & Queue Controls Card */}
      <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#2e2e2e]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                Live Episode Queue Status
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-[4px] ${
                  progress?.status === "processing"
                    ? "bg-brand/10 text-brand border border-brand/25 animate-pulse"
                    : progress?.status === "completed"
                    ? "bg-brand/10 text-brand border border-brand/25"
                    : "bg-[#1c1c1c] text-[#a0a0a0] border border-[#2e2e2e]"
                }`}
              >
                {progress?.status || "Idle"}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-[#ededed] tracking-tight">
              Episode Generation: {progress?.completedScenes || 0} / {progress?.totalScenes || 0} scenes
            </h2>

            {progress?.currentSceneNumber ? (
              <p className="text-xs text-brand mt-1 font-mono">
                Current: <strong className="text-white font-medium">Generating Scene {progress.currentSceneNumber}</strong> •{" "}
                Estimated remaining: {Math.ceil((progress.estimatedRemainingSeconds || 0) / 60)} min
              </p>
            ) : (
              <p className="text-xs text-[#707070] mt-1">
                All scenes ready or queue idle. Click Start Generation to process pending scenes.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {progress?.status === "processing" ? (
              <button
                onClick={() => handleQueueAction("pause")}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] text-amber-400 font-medium text-xs border border-[#2e2e2e] transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Queue</span>
              </button>
            ) : (
              <button
                onClick={() => handleQueueAction("start")}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-sm transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start / Resume Generation</span>
              </button>
            )}

            <button
              onClick={() => handleQueueAction("cancel")}
              disabled={actionLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-[6px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-medium text-xs transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Queue</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#a0a0a0]">
            <span>
              Overall Render Progress (
              {Math.round(
                ((progress?.completedScenes || 0) / Math.max(1, progress?.totalScenes || 1)) * 100
              )}
              %)
            </span>
            <span className="font-mono text-[11px] text-[#707070]">
              {progress?.completedScenes || 0} completed • {progress?.pendingScenes || 0} pending •{" "}
              {progress?.failedScenes || 0} failed
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#121212] overflow-hidden border border-[#2e2e2e]">
            <div
              className="h-full bg-brand rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(
                  ((progress?.completedScenes || 0) / Math.max(1, progress?.totalScenes || 1)) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Cost Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#707070] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Est. Cost</span>
            <DollarSign className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="text-xl font-semibold text-[#ededed] font-mono">
            ${cost?.totalEstimatedCostUsd || "0.00"}
          </div>
          <div className="text-[11px] text-[#707070] mt-0.5">
            Provider: {cost?.activeProvider?.toUpperCase() || "LUMA"}
          </div>
        </div>

        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#707070] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Saved by Cache</span>
            <TrendingUp className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="text-xl font-semibold text-brand font-mono">
            ${cost?.moneySavedUsd || "0.00"}
          </div>
          <div className="text-[11px] text-[#707070] mt-0.5">
            {cost?.cachedScenesCount || 0} cached scenes reused
          </div>
        </div>

        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#707070] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Daily Budget Cap</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#3ecf8e]" />
          </div>
          <div className="text-xl font-semibold text-[#ededed] font-mono">$50.00 / Day</div>
          <div className="text-[11px] text-[#707070] mt-0.5">Protects against overages</div>
        </div>

        <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-4 shadow-sm">
          <div className="flex items-center justify-between text-[#707070] mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">New Video Seconds</span>
            <Clock className="w-3.5 h-3.5 text-[#a0a0a0]" />
          </div>
          <div className="text-xl font-semibold text-[#ededed] font-mono">
            {cost?.estimatedVideoSeconds || 0}s
          </div>
          <div className="text-[11px] text-[#707070] mt-0.5">To be newly generated</div>
        </div>
      </div>

      {/* Scene Render Roster */}
      <div className="bg-[#171717] border border-[#2e2e2e] rounded-[6px] p-5 space-y-3.5 shadow-sm">
        <h3 className="text-xs font-semibold text-[#ededed] uppercase tracking-wider">
          Episode Scenes Render Roster ({currentEp?.scenes?.length || 0})
        </h3>

        <div className="space-y-1.5">
          {currentEp?.scenes?.map((scene) => (
            <div
              key={scene.id}
              className="flex items-center justify-between p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs hover:border-[#3e3e3e] transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="font-mono text-[11px] text-brand bg-[#171717] px-2 py-0.5 rounded border border-[#2e2e2e]">
                  Scene {scene.sceneNumber}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-[#ededed] truncate">{scene.location}</div>
                  <div className="text-[11px] text-[#707070] line-clamp-1">{scene.action}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 shrink-0 ml-3">
                <span className="font-mono text-[11px] text-[#707070]">{scene.duration}s</span>

                <span
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase ${
                    scene.status === "completed" || scene.status === "cached"
                      ? "bg-brand/10 text-brand border border-brand/25"
                      : scene.status === "generating"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse"
                      : scene.status === "failed"
                      ? "bg-red-500/10 text-red-400 border border-red-500/25"
                      : "bg-[#171717] text-[#707070] border border-[#2e2e2e]"
                  }`}
                >
                  {scene.status}
                </span>

                {scene.status === "failed" && (
                  <button
                    onClick={() => handleQueueAction("retry", scene.id)}
                    className="p-1 rounded-[4px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25"
                    title="Retry this failed scene"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

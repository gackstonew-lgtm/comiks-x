"use client";

import { useState, useEffect } from "react";
import { Episode, Scene } from "@/types";
import {
  Layers,
  Sparkles,
  Play,
  Pause,
  XCircle,
  RotateCw,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  TrendingUp,
} from "lucide-react";

export default function QueuePage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("ep-01-the-pitch");
  const [queueData, setQueueData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEpisodes();
  }, []);

  useEffect(() => {
    if (selectedEpisodeId) {
      fetchQueueStatus();
      const interval = setInterval(fetchQueueStatus, 3000); // Poll status every 3s
      return () => clearInterval(interval);
    }
  }, [selectedEpisodeId]);

  const fetchEpisodes = async () => {
    try {
      const res = await fetch("/api/episodes");
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setEpisodes(data.data);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Background Generation Queue & Cost Engine
          </div>
          <h1 className="text-3xl font-black text-white">Generation Queue & Budget</h1>
          <p className="text-xs text-studio-400 mt-1 max-w-xl">
            Non-blocking background rendering for multi-scene episodes. Track progress, pause/cancel, retry failed scenes, and avoid duplicate generation costs.
          </p>
        </div>

        {/* Episode Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-studio-400 uppercase">Episode:</span>
          <select
            value={selectedEpisodeId}
            onChange={(e) => setSelectedEpisodeId(e.target.value)}
            className="bg-studio-900 border border-studio-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-comic-yellow"
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
      <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-studio-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-comic-yellow">
                Live Episode Queue Status
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  progress?.status === "processing"
                    ? "bg-amber-500/20 text-comic-yellow border border-amber-500/30 animate-pulse"
                    : progress?.status === "completed"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-studio-800 text-studio-400"
                }`}
              >
                {progress?.status || "Idle"}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white">
              Episode Generation: {progress?.completedScenes || 0} / {progress?.totalScenes || 0} scenes
            </h2>

            {progress?.currentSceneNumber ? (
              <p className="text-xs text-comic-cyan mt-1">
                Current: <strong className="text-white">Generating Scene {progress.currentSceneNumber}</strong> •{" "}
                Estimated remaining: {Math.ceil((progress.estimatedRemainingSeconds || 0) / 60)} min
              </p>
            ) : (
              <p className="text-xs text-studio-400 mt-1">
                All scenes ready or queue idle. Click Start Generation to process pending scenes.
              </p>
            )}
          </div>

          {/* Action Buttons: Start / Pause / Resume / Cancel */}
          <div className="flex flex-wrap items-center gap-2.5">
            {progress?.status === "processing" ? (
              <button
                onClick={() => handleQueueAction("pause")}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-studio-800 hover:bg-studio-700 text-amber-400 font-bold text-xs border border-studio-700"
              >
                <Pause className="w-4 h-4" />
                Pause Queue
              </button>
            ) : (
              <button
                onClick={() => handleQueueAction("start")}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-102 transition-all"
              >
                <Play className="w-4 h-4 fill-studio-950" />
                Start / Resume Generation
              </button>
            )}

            <button
              onClick={() => handleQueueAction("cancel")}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-xs"
            >
              <XCircle className="w-4 h-4" />
              Cancel Queue
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-studio-400">
            <span>
              Overall Render Progress (
              {Math.round(
                ((progress?.completedScenes || 0) / Math.max(1, progress?.totalScenes || 1)) * 100
              )}
              %)
            </span>
            <span className="font-mono text-studio-300">
              {progress?.completedScenes || 0} completed • {progress?.pendingScenes || 0} pending •{" "}
              {progress?.failedScenes || 0} failed
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-studio-950 overflow-hidden border border-studio-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-comic-yellow to-emerald-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(
                  ((progress?.completedScenes || 0) / Math.max(1, progress?.totalScenes || 1)) * 100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Cost Management and Cached Savings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Est. Cost</span>
            <DollarSign className="w-4 h-4 text-comic-yellow" />
          </div>
          <div className="text-2xl font-black text-white">
            ${cost?.totalEstimatedCostUsd || "0.00"}
          </div>
          <div className="text-[11px] text-studio-400 mt-1">
            Provider: {cost?.activeProvider?.toUpperCase() || "LUMA"}
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Saved by Cache</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${cost?.moneySavedUsd || "0.00"}
          </div>
          <div className="text-[11px] text-emerald-500 mt-1">
            {cost?.cachedScenesCount || 0} cached scenes reused
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Daily Budget Cap</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">$50.00 / Day</div>
          <div className="text-[11px] text-studio-400 mt-1">Protects against overages</div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">New Video Seconds</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {cost?.estimatedVideoSeconds || 0}s
          </div>
          <div className="text-[11px] text-studio-400 mt-1">To be newly generated</div>
        </div>
      </div>

      {/* Detailed Scene-by-Scene Queue Status Table */}
      <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">
          Episode Scenes Render Roster ({currentEp?.scenes?.length || 0})
        </h3>

        <div className="space-y-2">
          {currentEp?.scenes?.map((scene) => (
            <div
              key={scene.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-studio-950 border border-studio-800 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-comic-yellow bg-studio-900 px-2.5 py-1 rounded border border-studio-800">
                  Scene {scene.sceneNumber}
                </span>
                <div>
                  <div className="font-bold text-white">{scene.location}</div>
                  <div className="text-[11px] text-studio-400 line-clamp-1">{scene.action}</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="font-mono text-studio-400">{scene.duration}s</span>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    scene.status === "completed" || scene.status === "cached"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : scene.status === "generating"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse"
                      : scene.status === "failed"
                      ? "bg-red-500/10 text-red-400 border border-red-500/30"
                      : "bg-studio-900 text-studio-400 border border-studio-800"
                  }`}
                >
                  {scene.status}
                </span>

                {scene.status === "failed" && (
                  <button
                    onClick={() => handleQueueAction("retry", scene.id)}
                    className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-comic-yellow border border-amber-500/30"
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

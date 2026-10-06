"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Episode, Scene } from "@/types";
import {
  Layers,
  Sparkles,
  Play,
  RotateCw,
  Video,
  Volume2,
  Sliders,
  MapPin,
  Clock,
  Camera,
  Film,
  Music,
  Bell,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function StoryboardPage() {
  const params = useParams();
  const router = useRouter();
  const episodeId = (params?.episodeId as string) || "ep-01-the-pitch";

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [filterAct, setFilterAct] = useState<number | null>(null);

  useEffect(() => {
    fetchEpisode();
  }, [episodeId]);

  const fetchEpisode = async () => {
    try {
      const res = await fetch(`/api/episodes/${episodeId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setEpisode(data.data);
        setScenes(data.data.scenes || []);
        if (data.data.scenes?.length > 0 && !selectedScene) {
          setSelectedScene(data.data.scenes[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateScene = async (sceneId: string) => {
    setRegeneratingSceneId(sceneId);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/scenes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          episodeId,
          sceneId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Scene ${selectedScene?.sceneNumber} submitted for AI video regeneration.`);
        await fetchEpisode();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingSceneId(null);
    }
  };

  const filteredScenes = filterAct ? scenes.filter((s) => s.actNumber === filterAct) : scenes;

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-comic-green mb-1">
            <Layers className="w-3.5 h-3.5" />
            Visual Storyboard Director
          </div>
          <h1 className="text-3xl font-black text-white">
            {episode ? episode.title : "Episode Storyboard"}
          </h1>
          <p className="text-xs text-studio-400 mt-1">
            Scene-by-scene cinematography breakdown. Regenerate individual scenes independently without altering the rest of the 30-minute episode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/editor/${episodeId}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-comic-yellow text-xs font-bold transition-colors"
          >
            <Film className="w-4 h-4" />
            Open Timeline Editor
          </button>
          <button
            onClick={() => router.push(`/queue`)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 text-studio-950 text-xs font-black shadow-lg shadow-amber-500/20 hover:scale-102 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Send to Generation Queue
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>✕</button>
        </div>
      )}

      {/* Act Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-studio-400 uppercase">Filter Act:</span>
          <div className="inline-flex rounded-xl bg-studio-900 p-1 border border-studio-800">
            <button
              onClick={() => setFilterAct(null)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                filterAct === null ? "bg-comic-yellow text-studio-950" : "text-studio-400 hover:text-white"
              }`}
            >
              All Scenes ({scenes.length})
            </button>
            {[1, 2, 3].map((act) => (
              <button
                key={act}
                onClick={() => setFilterAct(act)}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  filterAct === act ? "bg-comic-yellow text-studio-950" : "text-studio-400 hover:text-white"
                }`}
              >
                Act {act}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-studio-400">
          Showing <strong className="text-white">{filteredScenes.length}</strong> scenes
        </div>
      </div>

      {/* Grid: Scene List Cards and Scene Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Scene Cards List */}
        <div className="lg:col-span-1 space-y-3 max-h-[800px] overflow-y-auto pr-1">
          {filteredScenes.map((scene) => {
            const isSelected = selectedScene?.id === scene.id;
            const isDone = scene.status === "completed" || scene.status === "cached";
            return (
              <div
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-studio-900 border-comic-yellow shadow-md shadow-amber-500/10"
                    : "bg-studio-900/60 border-studio-800 hover:border-studio-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-comic-yellow bg-studio-950 px-2 py-0.5 rounded border border-studio-800">
                      SCENE {scene.sceneNumber < 10 ? `0${scene.sceneNumber}` : scene.sceneNumber}
                    </span>
                    <span className="text-[10px] text-studio-400">Act {scene.actNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-studio-300">
                      {scene.duration}s
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isDone ? "bg-emerald-400" : scene.status === "generating" ? "bg-amber-400 animate-pulse" : "bg-studio-600"
                      }`}
                    ></span>
                  </div>
                </div>

                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-comic-cyan shrink-0" />
                  {scene.location}
                </div>

                <p className="text-xs text-studio-300 mt-2 line-clamp-2 leading-relaxed">
                  {scene.action}
                </p>

                {scene.dialogue?.[0] && (
                  <div className="mt-2 text-[11px] text-studio-400 bg-studio-950/80 p-2 rounded-lg border border-studio-800/80 truncate">
                    <strong className="text-comic-yellow">{scene.dialogue[0].characterName}:</strong> "{scene.dialogue[0].line}"
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Full Director Scene Spec Inspector */}
        <div className="lg:col-span-2">
          {selectedScene ? (
            <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 space-y-6">
              {/* Scene Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black px-2.5 py-0.5 rounded bg-comic-yellow text-studio-950">
                      SCENE {selectedScene.sceneNumber}
                    </span>
                    <span className="text-xs text-studio-400 font-mono">
                      Duration: {selectedScene.duration}s • Act {selectedScene.actNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-comic-cyan" />
                    {selectedScene.location}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerateScene(selectedScene.id)}
                    disabled={regeneratingSceneId === selectedScene.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-comic-yellow text-xs font-bold transition-colors"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${regeneratingSceneId === selectedScene.id ? "animate-spin" : ""}`} />
                    {regeneratingSceneId === selectedScene.id ? "Regenerating Scene..." : "Regenerate This Scene"}
                  </button>
                </div>
              </div>

              {/* Action and Visual Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-comic-yellow uppercase mb-1">Action & Staging</div>
                  <p className="text-xs text-studio-200 leading-relaxed">{selectedScene.action}</p>
                </div>

                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-comic-cyan uppercase mb-1">Visual Description & Lighting</div>
                  <p className="text-xs text-studio-200 leading-relaxed">{selectedScene.visualDescription}</p>
                </div>
              </div>

              {/* Camera Angle & Movement */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Camera Angle</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedScene.cameraAngle}</div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Camera Movement</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedScene.cameraMovement}</div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Facial Expression</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedScene.facialExpressions}</div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase">Transition</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedScene.transition}</div>
                </div>
              </div>

              {/* Dialogue Box */}
              <div>
                <div className="text-xs font-bold text-studio-300 uppercase mb-2 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-comic-purple" />
                  Dialogue & Sheng / Swahili Speech
                </div>
                {selectedScene.dialogue && selectedScene.dialogue.length > 0 ? (
                  <div className="space-y-2">
                    {selectedScene.dialogue.map((diag, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-studio-950 border border-studio-800 flex items-start justify-between gap-4 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{diag.characterName}</span>
                            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-studio-900 text-comic-yellow border border-studio-800">
                              {diag.language}
                            </span>
                            <span className="text-[10px] text-studio-400">({diag.emotion})</span>
                          </div>
                          <p className="text-studio-200 mt-1 italic">"{diag.line}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-studio-950 border border-studio-800 text-xs text-studio-500">
                    No dialogue (Silent visual action or ambient transition).
                  </div>
                )}
              </div>

              {/* Sound & Music */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase flex items-center gap-1">
                    <Bell className="w-3 h-3 text-amber-400" />
                    Sound Effects
                  </div>
                  <div className="text-xs text-white mt-1">
                    {selectedScene.soundEffects?.join(", ") || "Ambient city noise"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800">
                  <div className="text-[10px] font-bold text-studio-400 uppercase flex items-center gap-1">
                    <Music className="w-3 h-3 text-comic-purple" />
                    Background Music Cue
                  </div>
                  <div className="text-xs text-white mt-1">
                    {selectedScene.backgroundMusic || "Low ambient drone"}
                  </div>
                </div>
              </div>

              {/* AI Video Prompt */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-comic-yellow uppercase flex items-center justify-between">
                  <span>Compiled AI Video Generation Prompt</span>
                  <span className="text-[10px] text-studio-400 font-mono">Auto-Compiled Anchor</span>
                </div>
                <div className="p-4 rounded-xl bg-studio-950 border border-studio-800 text-xs text-studio-300 font-mono leading-relaxed">
                  {selectedScene.aiPrompt}
                </div>
                <div className="p-3 rounded-xl bg-studio-950 border border-studio-800 text-[11px] text-studio-500 font-mono">
                  <strong className="text-red-400">Negative Prompt:</strong> {selectedScene.negativePrompt}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 rounded-2xl border border-dashed border-studio-800 flex items-center justify-center text-studio-500 text-xs">
              Select a scene to view complete storyboard specification
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

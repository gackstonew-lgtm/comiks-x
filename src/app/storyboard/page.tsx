"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Plus, Film, Clock } from "lucide-react";
import { Episode } from "@/types";

export default function StoryboardIndexPage() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/episodes")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setEpisodes(res.data);
          // If only 1 episode, jump directly to it
          if (res.data.length === 1) {
            router.replace(`/storyboard/${res.data[0].id}`);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-studio-400 text-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mb-4" />
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-[8px] bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">No Episodes Found</h2>
        <p className="text-sm text-studio-400 max-w-md mb-6 leading-relaxed">
          Create an episode in the Story Creator to generate and review multi-shot storyboards, visual anchors, and AI camera framing.
        </p>
        <Link
          href="/story-creator"
          className="flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] font-medium text-xs transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create First Episode
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="pb-4 border-b border-[#2e2e2e]">
        <h1 className="text-2xl font-black text-white">Select an Episode Storyboard</h1>
        <p className="text-xs text-studio-400 mt-1">
          Pick an episode to inspect visual frames, composition tags, and continuity packs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {episodes.map((ep) => (
          <Link
            key={ep.id}
            href={`/storyboard/${ep.id}`}
            className="p-5 rounded-[6px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-studio-400 mb-2">
                <span className="font-mono text-brand">Episode #{ep.episodeNumber || 1}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ep.targetDurationMinutes || 30}m</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-brand transition-colors">
                {ep.title}
              </h3>
              <p className="text-xs text-studio-400 mt-2 line-clamp-2">
                {ep.logline || ep.synopsis || "No logline available."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#2e2e2e] flex items-center justify-between text-[11px] text-studio-400">
              <span>{ep.scenes?.length || 0} scenes</span>
              <span className="text-brand font-bold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Open Storyboard →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

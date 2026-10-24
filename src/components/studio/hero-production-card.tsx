"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, User, X } from "lucide-react";
import { Episode } from "@/types";

export function HeroProductionCard({ activeEpisode }: { activeEpisode: Episode | null }) {
  const [showHero, setShowHero] = useState(true);

  if (!showHero) return null;

  return (
    <div className="relative rounded-[8px] bg-[#171717] border border-[#2e2e2e] p-5 md:p-6 overflow-hidden shadow-sm">
      {/* Dismiss control */}
      <button
        onClick={() => setShowHero(false)}
        className="absolute top-4 right-4 text-[#707070] hover:text-[#ededed] p-1 rounded-[4px] hover:bg-[#232323] transition-colors z-20"
        title="Dismiss banner"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Video Preview Card */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-[16/10] rounded-[6px] overflow-hidden border border-[#2e2e2e] bg-[#121212] group">
            <img
              src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop"
              alt="Featured production preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Central Play Button */}
            <Link
              href={`/storyboard/${activeEpisode?.id || "ep-01-the-pitch"}`}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Play preview scene"
            >
              <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-brand group-hover:text-[#09090b] group-hover:border-transparent transition-all">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </Link>

            {/* Media Metadata Tag */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-[#ededed] font-medium">
              <span className="truncate">Nairobi Metropolis • Act 1 Scene 02</span>
              <span className="bg-[#121212]/80 border border-[#2e2e2e] px-1.5 py-0.5 rounded text-[10px] font-mono text-[#a0a0a0]">
                1080p
              </span>
            </div>
          </div>
        </div>

        {/* Right: Pitch & Actions */}
        <div className="lg:col-span-7 space-y-3">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-brand/10 border border-brand/20 text-[10px] font-semibold text-brand uppercase tracking-wider">
              Featured Production
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#ededed] tracking-tight">
              {activeEpisode
                ? `Continue "${activeEpisode.title}"`
                : "Create your first AI comic episode today"}
            </h2>
            <p className="text-xs sm:text-sm text-[#a0a0a0] max-w-xl leading-relaxed">
              Decompose 30-minute stories into continuous scenes, generate authentic Sheng dialogue, lock 5D character DNA, and extract viral vertical 9:16 clips.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <Link
              href={
                activeEpisode
                  ? `/storyboard/${activeEpisode.id}`
                  : "/story-creator"
              }
              className="px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-medium text-xs shadow-sm transition-all inline-flex items-center gap-1.5"
            >
              <span>{activeEpisode ? "Continue Production" : "Get Started"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/characters"
              className="px-3.5 py-2 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] text-[#ededed] font-medium text-xs border border-[#2e2e2e] transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-[#a0a0a0]" />
              <span>Character Bible</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

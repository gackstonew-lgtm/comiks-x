"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, User, X } from "lucide-react";
import { Episode } from "@/types";

export function HeroProductionCard({ activeEpisode }: { activeEpisode: Episode | null }) {
  const [showHero, setShowHero] = useState(true);

  if (!showHero) return null;

  return (
    <div className="relative rounded-3xl bg-studio-850 border border-studio-border p-6 md:p-8 overflow-hidden">
      {/* Close / Dismiss control */}
      <button
        onClick={() => setShowHero(false)}
        className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 p-1 rounded-lg transition-colors z-20"
        title="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Layered Depth Card Visual Preview with Central Play Button */}
        <div className="lg:col-span-5 flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-[16/10]">
            {/* Back Layer Tilt */}
            <div className="absolute inset-0 bg-zinc-800/40 rounded-2xl transform -rotate-3 scale-95 translate-y-1"></div>
            {/* Mid Layer Tilt */}
            <div className="absolute inset-0 bg-zinc-800/60 rounded-2xl transform rotate-2 scale-98 translate-y-0.5"></div>
            {/* Front Video Preview Card */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop"
                alt="Featured production preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

              {/* Central Frosted Play Pill Button */}
              <Link
                href={`/storyboard/${activeEpisode?.id || "ep-01-the-pitch"}`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-xl hover:scale-110 hover:bg-studioOrange/80 transition-all">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </div>
              </Link>

              {/* Media Metadata Tag */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300 font-medium">
                <span className="truncate">Nairobi Metropolis • Act 1 Scene 02</span>
                <span className="bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-mono">1080p</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pitch & Primary Call to Action */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeEpisode
                ? `Continue "${activeEpisode.title}"`
                : "Create your first AI comic episode today!"}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
              Take a quick tour to familiarize yourself with the platform, enabling you to effortlessly decompose 30-minute stories into continuous scenes, generate authentic Sheng dialogue, and export vertical 9:16 clips.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href={
                activeEpisode
                  ? `/storyboard/${activeEpisode.id}`
                  : "/story-creator"
              }
              className="px-6 py-2.5 rounded-full bg-studioOrange hover:bg-studioOrange-hover active:scale-95 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>{activeEpisode ? "Continue Production" : "Get Started"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/characters"
              className="px-4 py-2.5 rounded-full bg-studio-800 hover:bg-studio-750 text-zinc-300 hover:text-white font-semibold text-xs border border-studio-border transition-colors inline-flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Character Bible</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import {
  Film,
  Sparkles,
  BookOpen,
  User,
  Video,
  Clock,
  Layers,
  CheckCircle,
  Share2,
  TrendingUp,
  ArrowRight,
  Plus,
  Play,
  Mic,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { HeroProductionCard } from "@/components/studio/hero-production-card";

export default function DashboardPage() {
  const allSeries = db.getSeries();
  const allCharacters = db.getCharacters();
  const allEpisodes = db.getEpisodes();
  const allClips = db.getSocialClips();
  const activeSeries = allSeries[0] || null;
  const activeEpisode = allEpisodes[0] || null;

  // Calculate real metrics
  const totalEpisodes = allEpisodes.length;
  const totalScenes = allEpisodes.reduce((acc, ep) => acc + (ep.scenes?.length || 0), 0);
  const completedScenes = allEpisodes.reduce(
    (acc, ep) => acc + (ep.scenes?.filter((s) => s.status === "completed" || s.status === "cached").length || 0),
    0
  );
  const totalClips = allClips.length;

  return (
    <div className="space-y-6">
      {/* 1. HORIZONTAL QUICK ACTION CARDS (Matching Reference: 4 horizontal cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: New Video / New Episode */}
        <Link
          href="/story-creator"
          className="p-3.5 rounded-2xl bg-studio-850 hover:bg-studio-800 border border-studio-border hover:border-white/10 transition-all flex items-center gap-3.5 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-studioOrange/15 border border-studioOrange/30 flex items-center justify-center text-studioOrange flex-shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white group-hover:text-studioOrange transition-colors">
              New Episode
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              Use template or blank canvas.
            </div>
          </div>
        </Link>

        {/* Card 2: AI Story Creator / Assistant */}
        <Link
          href="/story-creator"
          className="p-3.5 rounded-2xl bg-studio-850 hover:bg-studio-800 border border-studio-border hover:border-white/10 transition-all flex items-center gap-3.5 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-studioOrange/15 border border-studioOrange/30 flex items-center justify-center text-studioOrange flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-studioOrange/40" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white group-hover:text-studioOrange transition-colors">
              AI Story Creator
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              Turn ideas into 30-min episodes.
            </div>
          </div>
        </Link>

        {/* Card 3: AI Dubbing & Voice */}
        <Link
          href="/editor/ep-01-the-pitch"
          className="p-3.5 rounded-2xl bg-studio-850 hover:bg-studio-800 border border-studio-border hover:border-white/10 transition-all flex items-center gap-3.5 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-studioOrange/15 border border-studioOrange/30 flex items-center justify-center text-studioOrange flex-shrink-0 group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white group-hover:text-studioOrange transition-colors">
              AI Dubbing & Voice
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              Sheng, Swahili & English audio.
            </div>
          </div>
        </Link>

        {/* Card 4: Social Studio / Import */}
        <Link
          href="/clips/ep-01-the-pitch"
          className="p-3.5 rounded-2xl bg-studio-850 hover:bg-studio-800 border border-studio-border hover:border-white/10 transition-all flex items-center gap-3.5 group shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-studioOrange/15 border border-studioOrange/30 flex items-center justify-center text-studioOrange flex-shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white group-hover:text-studioOrange transition-colors">
              Social Studio (9:16)
            </div>
            <div className="text-[11px] text-zinc-400 truncate mt-0.5">
              Extract viral TikTok & Reels clips.
            </div>
          </div>
        </Link>
      </div>

      {/* 2. CINEMATIC HERO PRODUCTION CARD (Split Layout Matching Reference Image) */}
      <HeroProductionCard activeEpisode={activeEpisode} />

      {/* 3. "GET INSPIRED" / INSPIRATION CAROUSEL (Matching Reference Layout) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white tracking-tight">Get Inspired</h3>
          <div className="flex items-center gap-2">
            <Link
              href="/series"
              className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors mr-2"
            >
              All Templates
            </Link>
            <button
              className="w-7 h-7 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-border flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="w-7 h-7 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-border flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Large Rounded Cinematic Media Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Modern Startup Pitch */}
          <Link
            href="/storyboard/ep-01-the-pitch"
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-studio-border hover:border-studioOrange/40 transition-all shadow-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop"
              alt="Modern Startup Pitch"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-center">
              <h4 className="text-sm font-bold text-white leading-tight drop-shadow-md">
                Modern Startup Pitch
              </h4>
              <p className="text-[11px] text-zinc-300 mt-1">Buru Buru to Kilimani Deal</p>
            </div>
          </Link>

          {/* Card 2: Meet Our New Avatars */}
          <Link
            href="/characters"
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-studio-border hover:border-studioOrange/40 transition-all shadow-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop"
              alt="Meet Our Avatars"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-center">
              <h4 className="text-sm font-bold text-white leading-tight drop-shadow-md">
                Meet Our Characters
              </h4>
              <p className="text-[11px] text-zinc-300 mt-1">5D DNA & Locked Wardrobe</p>
            </div>
          </Link>

          {/* Card 3: Stylish Corporate Presentation / Metropolis */}
          <Link
            href="/series"
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-studio-border hover:border-studioOrange/40 transition-all shadow-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop"
              alt="Stylish Corporate Presentation"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-center">
              <h4 className="text-sm font-bold text-white leading-tight drop-shadow-md">
                Nairobi Metropolis
              </h4>
              <p className="text-[11px] text-zinc-300 mt-1">Architectural World Rules</p>
            </div>
          </Link>

          {/* Card 4: Futuristic Presentation / 9:16 Social */}
          <Link
            href="/clips/ep-01-the-pitch"
            className="group relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-studio-border hover:border-studioOrange/40 transition-all shadow-sm"
          >
            <img
              src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop"
              alt="Futuristic Presentation"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-4 text-center">
              <h4 className="text-sm font-bold text-white leading-tight drop-shadow-md">
                Matatu Rush Hour (9:16)
              </h4>
              <p className="text-[11px] text-zinc-300 mt-1">TikTok & Reels Derivatives</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. ACTIVE PRODUCTIONS & PRODUCTION STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left (2 cols): Production Episodes List */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">
              Episodes in Production
            </h3>
            <Link
              href="/story-creator"
              className="text-xs font-semibold text-studioOrange hover:underline"
            >
              + Create Episode
            </Link>
          </div>

          <div className="space-y-3">
            {allEpisodes.map((ep) => {
              const completedCount =
                ep.scenes?.filter((s) => s.status === "completed" || s.status === "cached")
                  .length || 0;
              const totalCount = ep.scenes?.length || 0;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={ep.id}
                  className="p-4 rounded-2xl bg-studio-850 border border-studio-border hover:border-white/10 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-studio-800 text-studioOrange border border-white/[0.06]">
                          EP {ep.episodeNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{ep.title}</h4>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{ep.logline}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] font-mono text-zinc-400 bg-studio-900 px-2 py-0.5 rounded border border-studio-border">
                        ~{ep.targetDurationMinutes} min
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-studioOrange/15 text-studioOrange border border-studioOrange/30">
                        {ep.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>{completedCount} of {totalCount} scenes generated</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-studio-900 overflow-hidden border border-studio-border">
                      <div
                        className="h-full bg-studioOrange rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Action Links */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-studio-border/60 text-xs">
                    <span className="text-[11px] text-zinc-500 truncate max-w-xs">
                      Cast: {ep.charactersInvolved?.join(", ") || "Brian Otieno"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/storyboard/${ep.id}`}
                        className="px-2.5 py-1 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors"
                      >
                        Storyboard
                      </Link>
                      <Link
                        href={`/editor/${ep.id}`}
                        className="px-2.5 py-1 rounded-lg bg-studio-800 hover:bg-studio-750 text-zinc-300 hover:text-white text-[11px] font-medium transition-colors"
                      >
                        Timeline
                      </Link>
                      <Link
                        href={`/clips/${ep.id}`}
                        className="px-2.5 py-1 rounded-lg bg-studioOrange/15 hover:bg-studioOrange/25 text-studioOrange text-[11px] font-semibold border border-studioOrange/30 transition-colors"
                      >
                        Social Clips (9:16)
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right (1 col): Universe & System Overview */}
        <div className="space-y-3.5">
          <h3 className="text-base font-bold text-white tracking-tight">
            Active Universe
          </h3>

          <div className="p-4 rounded-2xl bg-studio-850 border border-studio-border space-y-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-studioOrange">
                Series Canon
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeSeries?.title || "Life in Nairobi"}</h4>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                {activeSeries?.description}
              </p>
            </div>

            <div className="pt-3 border-t border-studio-border space-y-2">
              <div className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                <span>Character Anchors</span>
                <Link href="/characters" className="text-studioOrange text-[10px] hover:underline">
                  View All ({allCharacters.length})
                </Link>
              </div>
              <div className="space-y-1.5">
                {allCharacters.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-studio-900 border border-studio-border text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-studioOrange/20 text-studioOrange flex items-center justify-center font-bold text-[10px]">
                        {c.name[0]}
                      </div>
                      <span className="font-semibold text-zinc-200">{c.name}</span>
                    </div>
                    {c.isLocked && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-studioOrange/10 text-studioOrange border border-studioOrange/20">
                        Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-studio-border flex items-center justify-between text-xs">
              <span className="text-zinc-400 text-[11px]">AI Providers: Luma, Kling, Runway</span>
              <Link
                href="/settings"
                className="text-studioOrange hover:underline text-[11px] font-semibold"
              >
                Configure →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

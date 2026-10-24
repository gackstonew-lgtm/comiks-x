import Link from "next/link";
import { db } from "@/lib/db";
import {
  Sparkles,
  BookOpen,
  User,
  Video,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mic,
  ArrowRight,
} from "lucide-react";
import { HeroProductionCard } from "@/components/studio/hero-production-card";

export default function DashboardPage() {
  const allSeries = db.getSeries();
  const allCharacters = db.getCharacters();
  const allEpisodes = db.getEpisodes();
  const allClips = db.getSocialClips();
  const activeSeries = allSeries[0] || null;
  const activeEpisode = allEpisodes[0] || null;

  return (
    <div className="space-y-6">
      {/* 1. HORIZONTAL QUICK ACTION CARDS (Supabase Card Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: New Episode */}
        <Link
          href="/story-creator"
          className="p-3.5 rounded-[6px] bg-[#171717] hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-all flex items-center gap-3.5 group shadow-sm focus-visible:outline-brand focus-visible:outline-2"
        >
          <div className="w-9 h-9 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0 group-hover:scale-105 transition-transform">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#ededed] group-hover:text-brand transition-colors">
              New Episode
            </div>
            <div className="text-[11px] text-[#a0a0a0] truncate mt-0.5">
              Use template or blank canvas.
            </div>
          </div>
        </Link>

        {/* Card 2: AI Story Creator */}
        <Link
          href="/story-creator"
          className="p-3.5 rounded-[6px] bg-[#171717] hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-all flex items-center gap-3.5 group shadow-sm focus-visible:outline-brand focus-visible:outline-2"
        >
          <div className="w-9 h-9 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#ededed] group-hover:text-brand transition-colors">
              AI Story Creator
            </div>
            <div className="text-[11px] text-[#a0a0a0] truncate mt-0.5">
              Turn ideas into 30-min episodes.
            </div>
          </div>
        </Link>

        {/* Card 3: AI Dubbing & Voice */}
        <Link
          href="/editor"
          className="p-3.5 rounded-[6px] bg-[#171717] hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-all flex items-center gap-3.5 group shadow-sm focus-visible:outline-brand focus-visible:outline-2"
        >
          <div className="w-9 h-9 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0 group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#ededed] group-hover:text-brand transition-colors">
              AI Dubbing & Voice
            </div>
            <div className="text-[11px] text-[#a0a0a0] truncate mt-0.5">
              Multi-language audio tracks.
            </div>
          </div>
        </Link>

        {/* Card 4: Social Studio */}
        <Link
          href="/clips"
          className="p-3.5 rounded-[6px] bg-[#171717] hover:bg-[#1c1c1c] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-all flex items-center gap-3.5 group shadow-sm focus-visible:outline-brand focus-visible:outline-2"
        >
          <div className="w-9 h-9 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-[#ededed] group-hover:text-brand transition-colors">
              Social Studio (9:16)
            </div>
            <div className="text-[11px] text-[#a0a0a0] truncate mt-0.5">
              Extract viral TikTok & Reels clips.
            </div>
          </div>
        </Link>
      </div>

      {/* 2. CINEMATIC HERO PRODUCTION CARD */}
      <HeroProductionCard activeEpisode={activeEpisode} />

      {/* 3. INSPIRATION MEDIA CAROUSEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#ededed] tracking-tight">
            Production Inspiration
          </h3>
          <div className="flex items-center gap-2">
            <Link
              href="/series"
              className="text-xs font-medium text-[#a0a0a0] hover:text-[#ededed] transition-colors mr-2"
            >
              All Series Templates
            </Link>
            <button
              className="w-7 h-7 rounded-[6px] bg-[#171717] hover:bg-[#232323] border border-[#2e2e2e] flex items-center justify-center text-[#a0a0a0] hover:text-[#ededed] transition-colors"
              title="Previous"
              aria-label="Previous template"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              className="w-7 h-7 rounded-[6px] bg-[#171717] hover:bg-[#232323] border border-[#2e2e2e] flex items-center justify-center text-[#a0a0a0] hover:text-[#ededed] transition-colors"
              title="Next"
              aria-label="Next template"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Media Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            href="/storyboard"
            className="group relative aspect-[16/10] rounded-[6px] overflow-hidden bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all shadow-sm focus-visible:outline-brand focus-visible:outline-2"
          >
            <img
              src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop"
              alt="Storyboards & Visual Frames"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-3.5 text-center">
              <h4 className="text-xs font-semibold text-white leading-tight">
                Visual Storyboards
              </h4>
              <p className="text-[11px] text-[#a0a0a0] mt-0.5">Camera Framing & Continuity</p>
            </div>
          </Link>

          <Link
            href="/characters"
            className="group relative aspect-[16/10] rounded-[6px] overflow-hidden bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all shadow-sm focus-visible:outline-brand focus-visible:outline-2"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop"
              alt="Character Bible"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-3.5 text-center">
              <h4 className="text-xs font-semibold text-white leading-tight">
                Character Bible
              </h4>
              <p className="text-[11px] text-[#a0a0a0] mt-0.5">5D DNA & Locked Wardrobe</p>
            </div>
          </Link>

          <Link
            href="/series"
            className="group relative aspect-[16/10] rounded-[6px] overflow-hidden bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all shadow-sm focus-visible:outline-brand focus-visible:outline-2"
          >
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop"
              alt="Comic Series Hub"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-3.5 text-center">
              <h4 className="text-xs font-semibold text-white leading-tight">
                Comic Series Hub
              </h4>
              <p className="text-[11px] text-[#a0a0a0] mt-0.5">World Rules & Art Styles</p>
            </div>
          </Link>

          <Link
            href="/clips"
            className="group relative aspect-[16/10] rounded-[6px] overflow-hidden bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all shadow-sm focus-visible:outline-brand focus-visible:outline-2"
          >
            <img
              src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop"
              alt="Social Studio"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-3.5 text-center">
              <h4 className="text-xs font-semibold text-white leading-tight">
                Social Studio (9:16)
              </h4>
              <p className="text-[11px] text-[#a0a0a0] mt-0.5">TikTok & Reels Derivatives</p>
            </div>
          </Link>
        </div>
      </div>

      {/* 4. ACTIVE PRODUCTIONS & SYSTEM OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
        {/* Left (2 cols): Episodes List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#ededed] tracking-tight">
              Episodes in Production
            </h3>
            <Link
              href="/story-creator"
              className="text-xs font-medium text-brand hover:underline inline-flex items-center gap-1"
            >
              <span>Create Episode</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {allEpisodes.length === 0 ? (
              <div className="p-8 rounded-[6px] bg-[#171717] border border-dashed border-[#2e2e2e] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto text-brand">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-white">No Episodes in Production</div>
                <p className="text-[11px] text-[#a0a0a0] max-w-sm mx-auto">
                  Start by creating your first episode with AI-assisted story decomposition and cinematography.
                </p>
                <Link
                  href="/story-creator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] bg-brand text-[#09090b] text-xs font-medium hover:bg-brand-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  Create New Episode
                </Link>
              </div>
            ) : (
              allEpisodes.map((ep) => {
                const completedCount =
                  ep.scenes?.filter((s) => s.status === "completed" || s.status === "cached")
                    .length || 0;
                const totalCount = ep.scenes?.length || 0;
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                return (
                  <div
                    key={ep.id}
                    className="p-4 rounded-[6px] bg-[#171717] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c1c1c] text-[#ededed] border border-[#2e2e2e]">
                            EP {ep.episodeNumber}
                          </span>
                          <h4 className="text-xs font-semibold text-[#ededed] truncate">{ep.title}</h4>
                        </div>
                        <p className="text-xs text-[#a0a0a0] mt-1 line-clamp-1">{ep.logline}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-[#a0a0a0] bg-[#121212] px-2 py-0.5 rounded border border-[#2e2e2e]">
                          ~{ep.targetDurationMinutes} min
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/25">
                          {ep.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-[#a0a0a0]">
                        <span>{completedCount} of {totalCount} scenes generated</span>
                        <span className="font-medium text-[#ededed] font-mono">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#121212] overflow-hidden border border-[#2e2e2e]">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Action Links */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#2e2e2e] text-xs">
                      <span className="text-[11px] text-[#707070] truncate max-w-xs">
                        Cast: {ep.charactersInvolved?.length ? ep.charactersInvolved.join(", ") : "Cast pending"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/storyboard/${ep.id}`}
                          className="px-2.5 py-1 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-[#ededed] text-[11px] font-medium transition-colors"
                        >
                          Storyboard
                        </Link>
                        <Link
                          href={`/editor/${ep.id}`}
                          className="px-2.5 py-1 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] border border-[#2e2e2e] text-[#ededed] text-[11px] font-medium transition-colors"
                        >
                          Timeline
                        </Link>
                        <Link
                          href={`/clips/${ep.id}`}
                          className="px-2.5 py-1 rounded-[6px] bg-brand/10 hover:bg-brand/20 text-brand text-[11px] font-medium border border-brand/25 transition-colors"
                        >
                          Social Clips (9:16)
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right (1 col): Active Universe */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#ededed] tracking-tight">
            Active Universe
          </h3>

          <div className="p-4 rounded-[6px] bg-[#171717] border border-[#2e2e2e] space-y-3.5">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                Series Canon
              </div>
              <h4 className="text-xs font-semibold text-[#ededed] mt-0.5">
                {activeSeries?.title || "No Series Created Yet"}
              </h4>
              <p className="text-xs text-[#a0a0a0] mt-1 line-clamp-3 leading-relaxed">
                {activeSeries?.description || "Define your franchise universe, visual aesthetic, and narrative rules."}
              </p>
              {!activeSeries && (
                <Link
                  href="/series"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-brand hover:underline font-medium"
                >
                  <span>Create Series Project</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            <div className="pt-3 border-t border-[#2e2e2e] space-y-2">
              <div className="text-[11px] font-medium text-[#ededed] flex items-center justify-between">
                <span>Character Anchors</span>
                <Link href="/characters" className="text-brand text-[11px] hover:underline">
                  View All ({allCharacters.length})
                </Link>
              </div>
              <div className="space-y-1.5">
                {allCharacters.length === 0 ? (
                  <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-center text-xs text-[#a0a0a0]">
                    No characters yet.{" "}
                    <Link href="/characters" className="text-brand hover:underline">
                      Add Character Anchor
                    </Link>
                  </div>
                ) : (
                  allCharacters.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-[6px] bg-[#121212] border border-[#2e2e2e] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-[4px] bg-brand/15 text-brand border border-brand/25 flex items-center justify-center font-bold text-[10px]">
                          {c.name[0]}
                        </div>
                        <span className="font-medium text-[#ededed] text-xs">{c.name}</span>
                      </div>
                      {c.isLocked && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-brand/10 text-brand border border-brand/25">
                          Locked
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#2e2e2e] flex items-center justify-between text-xs">
              <span className="text-[#a0a0a0] text-[11px]">Providers: Luma, Kling, Runway</span>
              <Link
                href="/settings"
                className="text-brand hover:underline text-[11px] font-medium"
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

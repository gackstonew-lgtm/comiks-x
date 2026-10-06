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
  HardDrive,
  ShieldCheck,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const allSeries = db.getSeries();
  const allCharacters = db.getCharacters();
  const allEpisodes = db.getEpisodes();
  const allClips = db.getSocialClips();
  const activeSeries = allSeries[0] || null;

  // Calculate stats
  const totalEpisodes = allEpisodes.length;
  const totalScenes = allEpisodes.reduce((acc, ep) => acc + (ep.scenes?.length || 0), 0);
  const completedScenes = allEpisodes.reduce(
    (acc, ep) => acc + (ep.scenes?.filter((s) => s.status === "completed" || s.status === "cached").length || 0),
    0
  );
  const totalClips = allClips.length;

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-studio-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-comic-yellow text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Production Studio Active
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            AI Comic Animation Studio
          </h1>
          <p className="text-sm text-studio-400 mt-1 max-w-2xl">
            Create recurring ~30-minute animated comic episodes, break down into continuous scenes with character consistency, and automatically export viral TikTok & Instagram Reels clips.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/story-creator"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-comic-yellow to-amber-500 hover:from-amber-400 hover:to-amber-500 text-studio-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:scale-102 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-studio-950" />
            Create New Episode
          </Link>
          <Link
            href="/characters"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-studio-200 text-sm font-semibold transition-colors"
          >
            <User className="w-4 h-4 text-comic-cyan" />
            Character Bible
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-studio-850 hover:bg-studio-800 border border-studio-700 text-studio-200 text-sm font-semibold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            AI Providers
          </Link>
        </div>
      </div>

      {/* Production Pipeline Roadmap */}
      <div className="bg-studio-900 border border-studio-800 rounded-2xl p-5 bg-halftone">
        <div className="text-xs font-bold text-studio-400 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>End-to-End Production Pipeline</span>
          <span className="text-comic-yellow font-medium">100% Modular Architecture</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center text-xs">
          {[
            { step: "1. Series Hub", desc: "Lore & Style", color: "border-amber-500/40 text-amber-300" },
            { step: "2. Character Bible", desc: "Face & Voice Lock", color: "border-cyan-500/40 text-cyan-300" },
            { step: "3. Story Creator", desc: "30-min Breakdown", color: "border-purple-500/40 text-purple-300" },
            { step: "4. Storyboard", desc: "Scene Director", color: "border-emerald-500/40 text-emerald-300" },
            { step: "5. Scene Queue", desc: "AI Video Jobs", color: "border-blue-500/40 text-blue-300" },
            { step: "6. Multi-track Editor", desc: "Audio & Subtitles", color: "border-amber-500/40 text-amber-300" },
            { step: "7. Social Clips", desc: "9:16 TikTok Extractor", color: "border-pink-500/40 text-pink-300" },
            { step: "8. Export", desc: "1080p MP4 & Chapters", color: "border-green-500/40 text-green-300" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl bg-studio-950/80 border ${item.color} flex flex-col justify-center items-center shadow-sm`}
            >
              <div className="font-bold text-[11px] truncate w-full">{item.step}</div>
              <div className="text-[10px] text-studio-400 mt-0.5 truncate">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Episodes</span>
            <Film className="w-4 h-4 text-comic-yellow" />
          </div>
          <div className="text-2xl font-black text-white">{totalEpisodes}</div>
          <div className="text-[11px] text-studio-400 mt-1">Series: {activeSeries?.title || "None"}</div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Scenes Generated</span>
            <Layers className="w-4 h-4 text-comic-cyan" />
          </div>
          <div className="text-2xl font-black text-white">{completedScenes} / {totalScenes}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Independent scene rendering
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Est. Runtime</span>
            <Clock className="w-4 h-4 text-comic-purple" />
          </div>
          <div className="text-2xl font-black text-white">~30 Min</div>
          <div className="text-[11px] text-studio-400 mt-1">Split into 5–20s scenes</div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Social Clips</span>
            <Video className="w-4 h-4 text-comic-pink" />
          </div>
          <div className="text-2xl font-black text-white">{totalClips}</div>
          <div className="text-[11px] text-comic-pink mt-1">9:16 TikTok / Reels ready</div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between text-studio-400 mb-2">
            <span className="text-xs font-semibold uppercase">Cached Savings</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">$38.40</div>
          <div className="text-[11px] text-studio-400 mt-1">Zero full-episode re-renders</div>
        </div>
      </div>

      {/* Main Grid: Active Series & Recent Episodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Series Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-studio-900 border border-studio-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-comic-yellow">
                Active Comic Series
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-studio-800 text-comic-cyan border border-studio-700">
                {activeSeries?.artStyle}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white">{activeSeries?.title}</h3>
            <p className="text-xs text-studio-400 mt-2 line-clamp-3 leading-relaxed">
              {activeSeries?.description}
            </p>

            {/* Main Cast Badges */}
            <div className="mt-5 pt-4 border-t border-studio-800">
              <div className="text-xs font-semibold text-studio-300 mb-2.5 flex items-center justify-between">
                <span>Core Cast ({allCharacters.length})</span>
                <Link href="/characters" className="text-comic-yellow text-[11px] hover:underline">
                  View Bible →
                </Link>
              </div>
              <div className="space-y-2">
                {allCharacters.slice(0, 3).map((char) => (
                  <div
                    key={char.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-studio-950 border border-studio-800/80 text-xs"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-comic-purple flex items-center justify-center font-bold text-studio-950 text-[11px]">
                        {char.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{char.name}</div>
                        <div className="text-[10px] text-studio-400">{char.accent}</div>
                      </div>
                    </div>
                    {char.isLocked && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-comic-yellow border border-amber-500/30">
                        Design Locked
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Link
                href="/series"
                className="flex-1 text-center py-2 rounded-xl bg-studio-800 hover:bg-studio-700 border border-studio-700 text-xs font-bold text-white transition-colors"
              >
                Series Settings
              </Link>
              <Link
                href="/characters"
                className="flex-1 text-center py-2 rounded-xl bg-comic-yellow/10 hover:bg-comic-yellow/20 border border-comic-yellow/30 text-xs font-bold text-comic-yellow transition-colors"
              >
                Character Bible
              </Link>
            </div>
          </div>

          {/* Social Media Highlight Box */}
          <div className="bg-studio-900 border border-studio-800 rounded-2xl p-5 bg-halftone-cyan">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-comic-cyan flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                Viral TikTok Pipeline
              </span>
              <span className="text-[10px] text-studio-400 font-medium">9:16 Vertical Crop</span>
            </div>
            <p className="text-xs text-studio-300 leading-relaxed">
              Every 30-minute episode is automatically inspected by our AI clip extractor to isolate 5–10 high-retention hooks with safe-zone captions.
            </p>
            <div className="mt-4">
              <Link
                href="/clips/ep-01-the-pitch"
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-comic-cyan/10 hover:bg-comic-cyan/20 border border-comic-cyan/30 text-xs font-bold text-comic-cyan transition-colors"
              >
                Browse Extracted Social Clips ({allClips.length}) →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Episodes List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white">Episodes in Production</h2>
              <p className="text-xs text-studio-400">Structured into chapters and independent scenes</p>
            </div>
            <Link
              href="/story-creator"
              className="flex items-center gap-1.5 text-xs font-bold text-comic-yellow hover:text-amber-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Episode
            </Link>
          </div>

          <div className="space-y-4">
            {allEpisodes.map((ep) => {
              const completedCount = ep.scenes?.filter((s) => s.status === "completed" || s.status === "cached").length || 0;
              const totalCount = ep.scenes?.length || 0;
              const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={ep.id}
                  className="bg-studio-900 border border-studio-800 hover:border-studio-700 rounded-2xl p-5 transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-studio-800 text-comic-yellow border border-studio-700">
                          Episode 0{ep.episodeNumber}
                        </span>
                        <h3 className="text-base font-black text-white">{ep.title}</h3>
                      </div>
                      <p className="text-xs text-studio-400 mt-1 line-clamp-2">{ep.logline}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-xs font-bold text-studio-300 bg-studio-950 px-2.5 py-1 rounded-lg border border-studio-800">
                        ~{ep.targetDurationMinutes} min
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        {ep.status}
                      </span>
                    </div>
                  </div>

                  {/* Scene Generation Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-studio-400">
                      <span>Scene Progress: {completedCount} / {totalCount} scenes ready</span>
                      <span className="font-bold text-white">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-studio-950 overflow-hidden border border-studio-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-comic-yellow to-comic-cyan rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons for Episode */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-studio-800/80">
                    <div className="flex items-center space-x-2 text-xs text-studio-400">
                      <span>Cast: {ep.charactersInvolved?.join(", ") || "None"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/storyboard/${ep.id}`}
                        className="px-3 py-1.5 rounded-lg bg-studio-850 hover:bg-studio-800 border border-studio-700 text-xs font-semibold text-studio-200 transition-colors"
                      >
                        Storyboard
                      </Link>
                      <Link
                        href={`/editor/${ep.id}`}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-comic-yellow transition-colors"
                      >
                        Timeline Editor
                      </Link>
                      <Link
                        href={`/clips/${ep.id}`}
                        className="px-3 py-1.5 rounded-lg bg-comic-pink/10 hover:bg-comic-pink/20 border border-comic-pink/30 text-xs font-bold text-comic-pink transition-colors"
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
      </div>
    </div>
  );
}

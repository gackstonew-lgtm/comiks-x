"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ComicSeries,
  Episode,
  Character,
  GenerationJob,
  BillingAccount,
  MediaAsset,
} from "@/types";
import {
  Plus,
  Video,
  ImageIcon,
  Layers,
  Sliders,
  UserCheck,
  Mic,
  CreditCard,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  RotateCw,
  FolderKanban,
  CheckCircle2,
  Play,
  Film,
} from "lucide-react";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  // Live database data loaded via client API
  const [seriesList, setSeriesList] = useState<ComicSeries[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [billing, setBilling] = useState<BillingAccount | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (data.success) {
        setSeriesList(data.seriesList || []);
        setEpisodes(data.episodes || []);
        setCharacters(data.characters || []);
        setJobs(data.jobs || []);
        setBilling(data.billing || null);
        setAssets(data.assets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Metrics derived from actual data
  const totalProjects = seriesList.length;
  const totalEpisodes = episodes.length;
  const activeJobs = jobs.filter((j) => j.status === "queued" || j.status === "processing");
  const failedJobs = jobs.filter((j) => j.status === "failed");
  const completedJobs = jobs.filter((j) => j.status === "completed");

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return seriesList.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artStyle.toLowerCase().includes(searchQuery.toLowerCase());
      if (statusFilter === "all") return matchesSearch;
      if (statusFilter === "locked") return matchesSearch && s.isStyleLocked;
      return matchesSearch;
    });
  }, [seriesList, searchQuery, statusFilter]);

  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry_job", jobId }),
      });
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRetryingJobId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* 1. Header & Studio Production Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2e2e2e]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Production Overview
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand/10 border border-brand/25 text-brand font-medium">
              Studio Pro
            </span>
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-0.5">
            Manage long-form series, animated shorts, AI generation pipelines, and export assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/storyboard"
            className="px-3.5 py-2 rounded-md bg-brand hover:bg-brand-hover text-[#09090b] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Create Project
          </Link>
          <Link
            href="/video-generator"
            className="px-3.5 py-2 rounded-md bg-[#232323] hover:bg-[#2a2a2a] border border-[#3e3e3e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Video className="w-3.5 h-3.5 text-brand" />
            Generate Video
          </Link>
        </div>
      </div>

      {/* 2. Actual Derived Statistics KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Available Credits */}
        <Link
          href="/billing"
          className="p-4 rounded-lg bg-[#171717] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[#a0a0a0] mb-1">
            <span className="font-semibold uppercase text-[10px]">Credit Balance</span>
            <CreditCard className="w-3.5 h-3.5 text-brand" />
          </div>
          <div className="text-2xl font-black text-white group-hover:text-brand transition-colors">
            {billing?.currentBalance ?? 250} <span className="text-xs font-normal text-[#707070]">CR</span>
          </div>
          <div className="text-[11px] text-[#707070] mt-1 truncate">
            {(billing?.plan || "creator").toUpperCase()} • {billing?.usedThisCycle ?? 0} used this cycle
          </div>
        </Link>

        {/* KPI 2: Active Projects */}
        <Link
          href="/projects"
          className="p-4 rounded-lg bg-[#171717] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[#a0a0a0] mb-1">
            <span className="font-semibold uppercase text-[10px]">Active Series</span>
            <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white group-hover:text-cyan-400 transition-colors">
            {totalProjects} <span className="text-xs font-normal text-[#707070]">Series</span>
          </div>
          <div className="text-[11px] text-[#707070] mt-1 truncate">
            {totalEpisodes} total episodes structured
          </div>
        </Link>

        {/* KPI 3: Characters in Universe */}
        <Link
          href="/characters"
          className="p-4 rounded-lg bg-[#171717] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[#a0a0a0] mb-1">
            <span className="font-semibold uppercase text-[10px]">Character Bible</span>
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
            {characters.length} <span className="text-xs font-normal text-[#707070]">DNA Cast</span>
          </div>
          <div className="text-[11px] text-[#707070] mt-1 truncate">
            Visual palettes & turnarounds locked
          </div>
        </Link>

        {/* KPI 4: Active Generation Queue */}
        <Link
          href="/queue"
          className="p-4 rounded-lg bg-[#171717] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-colors group"
        >
          <div className="flex items-center justify-between text-xs text-[#a0a0a0] mb-1">
            <span className="font-semibold uppercase text-[10px]">Render Queue</span>
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white group-hover:text-purple-400 transition-colors">
            {activeJobs.length} <span className="text-xs font-normal text-[#707070]">Active</span>
          </div>
          <div className="text-[11px] text-[#707070] mt-1 truncate">
            {completedJobs.length} completed • {failedJobs.length} failed
          </div>
        </Link>
      </div>

      {/* 3. Quick Action Hub (6 Core Workspaces) */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#707070] mb-2.5">
          Production Workspaces
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/video-generator"
            className="p-3 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] hover:border-brand/40 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-md bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-2 group-hover:scale-105 transition-transform">
              <Video className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-brand transition-colors">
              AI Video
            </span>
            <span className="text-[10px] text-[#707070] mt-0.5">I2V & T2V</span>
          </Link>

          <Link
            href="/image-generator"
            className="p-3 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] hover:border-cyan-500/40 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
              AI Image
            </span>
            <span className="text-[10px] text-[#707070] mt-0.5">Plates & Panels</span>
          </Link>

          <Link
            href="/storyboard"
            className="p-3 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] hover:border-amber-500/40 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors">
              Storyboard
            </span>
            <span className="text-[10px] text-[#707070] mt-0.5">Scripts & Shots</span>
          </Link>

          <Link
            href="/editor"
            className="p-3 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] hover:border-emerald-500/40 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Timeline Editor
            </span>
            <span className="text-[10px] text-[#707070] mt-0.5">FlipaClip 2D Player</span>
          </Link>

          <Link
            href="/avatars"
            className="p-3 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] hover:border-purple-500/40 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors">
              AI Avatars
            </span>
            <span className="text-[10px] text-[#707070] mt-0.5">Talking Heads</span>
          </Link>

          <Link
            href="/voice-music"
            className="p-3 rounded-lg bg-[#171717] hover:bg-[#202020] border border-[#2e2e2e] hover:border-pink-500/40 transition-all flex flex-col items-center text-center group"
          >
            <div className="w-8 h-8 rounded-md bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-2 group-hover:scale-105 transition-transform">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-white group-hover:text-pink-400 transition-colors">
              Voice & Audio
            </span>
            <span className="text-[10px] text-[#707070] mt-0.5">TTS & -14 LUFS</span>
          </Link>
        </div>
      </div>

      {/* 4. Failed Generation Alerts (if any) */}
      {failedJobs.length > 0 && (
        <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>
              {failedJobs.length} generation job(s) encountered provider errors.
            </span>
          </div>
          <button
            onClick={() => handleRetryJob(failedJobs[0].id)}
            disabled={retryingJobId === failedJobs[0].id}
            className="px-3 py-1 rounded bg-[#232323] hover:bg-[#2b2b2b] text-white border border-[#3e3e3e] font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${retryingJobId ? "animate-spin" : ""}`} />
            Retry Latest
          </button>
        </div>
      )}

      {/* 5. Main Split: Recent Projects & Active Render Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Recent Productions
              <span className="text-xs text-[#707070] font-normal">
                ({filteredProjects.length})
              </span>
            </h2>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#707070]" />
                <input
                  type="text"
                  placeholder="Search series or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 sm:w-56 h-8 pl-8 pr-2.5 rounded-md bg-[#171717] border border-[#2e2e2e] focus:border-brand text-xs text-white placeholder-[#707070] focus:outline-none transition-colors"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 rounded-md bg-[#171717] border border-[#2e2e2e] text-xs text-[#a0a0a0] focus:outline-none"
              >
                <option value="all">All Styles</option>
                <option value="locked">Style Locked</option>
              </select>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            /* Empty State */
            <div className="p-8 rounded-lg bg-[#171717] border border-[#2e2e2e] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No productions found</h3>
              <p className="text-xs text-[#a0a0a0] max-w-sm mx-auto">
                {searchQuery
                  ? "No projects match your search query. Try clearing the filter."
                  : "Start by creating your first comic universe, episode, or viral short."}
              </p>
              <Link
                href="/templates"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-brand hover:bg-brand-hover text-[#09090b] font-bold text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Browse Production Templates
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredProjects.map((series) => (
                <div
                  key={series.id}
                  className="p-4 rounded-lg bg-[#171717] border border-[#2e2e2e] hover:border-[#3e3e3e] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className="w-14 h-14 rounded-md bg-cover bg-center shrink-0 border border-[#2e2e2e]"
                      style={{
                        backgroundImage: `url(${
                          series.visualReferences[0] ||
                          "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=200"
                        })`,
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-brand transition-colors truncate">
                          {series.title}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
                          {series.artStyle}
                        </span>
                      </div>
                      <p className="text-xs text-[#a0a0a0] line-clamp-1 mt-0.5">
                        {series.description}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-[#707070] mt-1.5">
                        <span>{series.episodeCount || 1} Episodes</span>
                        <span>•</span>
                        <span>{series.mainCharacterIds?.length || 0} Characters</span>
                        <span>•</span>
                        <span className="text-emerald-400">
                          {series.isStyleLocked ? "Consistent" : "Flexible"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <Link
                      href="/storyboard"
                      className="px-3 py-1.5 rounded-md bg-[#232323] hover:bg-[#2b2b2b] text-white border border-[#3e3e3e] text-xs font-semibold transition-colors"
                    >
                      Storyboard
                    </Link>
                    <Link
                      href="/editor"
                      className="px-3 py-1.5 rounded-md bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      Edit Timeline
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Active Queue & Recent Generations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a0a0a0]">
              Active Render Queue
            </h3>
            <Link href="/queue" className="text-xs text-brand hover:underline">
              View All ({jobs.length})
            </Link>
          </div>

          <div className="p-3.5 rounded-lg bg-[#171717] border border-[#2e2e2e] space-y-3">
            {jobs.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#707070]">
                No jobs currently rendering. Start a video generation.
              </div>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="space-y-1.5 pb-2.5 border-b border-[#232323] last:border-none last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[160px]">
                      {job.prompt.substring(0, 28)}...
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        job.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : job.status === "processing" || job.status === "queued"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-[#242424] overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-300"
                      style={{ width: `${job.progressPercent || 15}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#707070]">
                    <span>Provider: {job.provider.toUpperCase()}</span>
                    <span>{job.progressPercent || 15}%</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="p-3.5 rounded-lg bg-[#171717] border border-[#2e2e2e] space-y-2.5">
            <h4 className="text-xs font-bold text-white">Production Kits</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/templates"
                className="p-2 rounded bg-[#202020] hover:bg-[#252525] text-[#ededed] border border-[#2a2a2a] truncate"
              >
                Templates
              </Link>
              <Link
                href="/brand-kit"
                className="p-2 rounded bg-[#202020] hover:bg-[#252525] text-[#ededed] border border-[#2a2a2a] truncate"
              >
                Brand Kit
              </Link>
              <Link
                href="/team"
                className="p-2 rounded bg-[#202020] hover:bg-[#252525] text-[#ededed] border border-[#2a2a2a] truncate"
              >
                Team Lab
              </Link>
              <Link
                href="/billing"
                className="p-2 rounded bg-[#202020] hover:bg-[#252525] text-[#ededed] border border-[#2a2a2a] truncate"
              >
                Credits & Billing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Film,
  Layers,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Music,
  CheckCircle2,
  Copy,
  Download,
} from "lucide-react";
import Link from "next/link";
import { ComicSeries, MediaAsset } from "@/types";

export default function ProjectsAssetsPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "assets">("projects");
  const [projects, setProjects] = useState<ComicSeries[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLogline, setNewLogline] = useState("");
  const [newRatio, setNewRatio] = useState("9:16");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [assetFilter]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/projects?type=${assetFilter}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.series || []);
        setAssets(data.assets || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTitle,
          description: newLogline,
          defaultAspectRatio: newRatio,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setProjects((prev) => [...prev, data.project]);
        setShowNewProjectModal(false);
        setNewTitle("");
        setNewLogline("");
        setStatusMessage(`Project "${data.project.title}" created.`);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects?seriesId=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Delete this media asset?")) return;
    try {
      const res = await fetch(`/api/projects?assetId=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (!searchQuery) return true;
    const assetName = asset.name || asset.title || "";
    return (
      assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
            <FolderKanban className="w-3.5 h-3.5" />
            Projects & Asset Vault
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
            Production Management
          </h1>
          <p className="text-xs text-[#a0a0a0] mt-1">
            Manage your comic series, episodes, and centralized cloud media asset repository.
          </p>
        </div>

        <button
          onClick={() => setShowNewProjectModal(true)}
          className="px-3.5 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover text-[#09090b] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm self-start md:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2e2e2e] pb-2 text-xs font-medium">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded-[6px] transition-colors flex items-center gap-2 ${
            activeTab === "projects"
              ? "bg-[#1f2822] text-brand border border-brand/40 font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          Series & Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`px-4 py-2 rounded-[6px] transition-colors flex items-center gap-2 ${
            activeTab === "assets"
              ? "bg-[#1f2822] text-brand border border-brand/40 font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          Media Asset Vault ({assets.length})
        </button>
      </div>

      {/* Tab 1: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="p-8 rounded-[8px] bg-[#141414] border border-[#2e2e2e] text-center text-[#666] text-xs">
              No projects created yet. Click "New Project" to start your first comic animation series.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-[8px] bg-[#141414] border border-[#2e2e2e] hover:border-[#383838] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20 font-medium">
                        {proj.genre || "Animation"}
                      </span>
                      <span className="text-[10px] text-[#888]">
                        {proj.defaultAspectRatio || "9:16"}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#ededed] mb-1">{proj.title}</h3>
                    <p className="text-xs text-[#a0a0a0] line-clamp-2 leading-relaxed">
                      {proj.logline || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-[#222] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/storyboard`}
                        className="px-2.5 py-1 rounded-[4px] bg-[#1f1f1f] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1 border border-[#2e2e2e]"
                      >
                        <Layers className="w-3 h-3 text-brand" />
                        Storyboard
                      </Link>
                      <Link
                        href={`/editor`}
                        className="px-2.5 py-1 rounded-[4px] bg-[#1f1f1f] hover:bg-[#282828] text-[#ededed] text-xs inline-flex items-center gap-1 border border-[#2e2e2e]"
                      >
                        <Film className="w-3 h-3 text-brand" />
                        Editor
                      </Link>
                    </div>

                    <button
                      onClick={() => handleDeleteProject(proj.id)}
                      className="p-1 text-[#666] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assets */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {["all", "video", "image", "audio", "turnaround"].map((type) => (
                <button
                  key={type}
                  onClick={() => setAssetFilter(type)}
                  className={`px-3 py-1 rounded-[4px] capitalize transition-colors ${
                    assetFilter === type
                      ? "bg-brand/10 text-brand border border-brand/30 font-semibold"
                      : "bg-[#181818] border border-[#2e2e2e] text-[#a0a0a0] hover:text-[#ededed]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand w-48 sm:w-60"
              />
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-8 rounded-[8px] bg-[#141414] border border-[#2e2e2e] text-center text-[#666] text-xs">
              No assets found for the selected filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="rounded-[6px] overflow-hidden border border-[#2e2e2e] bg-[#141414] p-2 flex flex-col justify-between hover:border-[#444] transition-all"
                >
                  <div className="aspect-square bg-black rounded-[4px] overflow-hidden relative flex items-center justify-center">
                    {asset.type === "video" ? (
                      <video src={asset.url} className="w-full h-full object-cover" />
                    ) : asset.type === "audio" ? (
                      <Music className="w-8 h-8 text-brand opacity-60" />
                    ) : (
                      <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="mt-2">
                    <p className="text-[11px] font-medium text-[#ededed] truncate">
                      {asset.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#888] mt-0.5">
                      <span className="capitalize">{asset.type}</span>
                      <span>{asset.size}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[#222] flex items-center justify-between">
                    <a
                      href={asset.url}
                      download
                      className="p-1 text-[#888] hover:text-[#ededed] transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        alert("Asset URL copied to clipboard!");
                      }}
                      className="p-1 text-[#888] hover:text-[#ededed] transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="p-1 text-[#888] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#2e2e2e] rounded-[10px] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e2e2e]">
              <h2 className="text-sm font-bold text-[#ededed] flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-brand" />
                Create New Comic Project
              </h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-[#666] hover:text-[#ededed] text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Nairobi Chronicles, Kip Adventures"
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Logline / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={newLogline}
                  onChange={(e) => setNewLogline(e.target.value)}
                  placeholder="Brief synopsis of the animation series..."
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] p-3 text-xs leading-relaxed focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs text-[#a0a0a0] font-medium block mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={newRatio}
                  onChange={(e) => setNewRatio(e.target.value)}
                  className="w-full bg-[#181818] border border-[#2e2e2e] text-[#ededed] rounded-[6px] px-3 py-2 text-xs focus:outline-none focus:border-brand"
                >
                  <option value="9:16">9:16 Vertical (Shorts, TikTok, Reels)</option>
                  <option value="16:9">16:9 Landscape (YouTube, Broadcast)</option>
                  <option value="1:1">1:1 Square</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#222] text-[#ededed] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-1.5 rounded-[6px] bg-brand text-[#09090b] font-semibold text-xs disabled:opacity-50"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

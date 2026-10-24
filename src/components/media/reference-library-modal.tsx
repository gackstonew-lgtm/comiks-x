"use client";

import { useState, useEffect } from "react";
import {
  X,
  Search,
  Filter,
  Check,
  ImagePlus,
  Video,
  Music,
  FileText,
  Upload,
  Plus,
  FolderOpen,
} from "lucide-react";
import { MediaAsset } from "@/types";
import { MediaUploader } from "./media-uploader";

interface ReferenceLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAssets: (assets: MediaAsset[]) => void;
  selectedAssetIds?: string[];
  filterType?: "image" | "video" | "audio" | "document" | "all";
  allowMultiple?: boolean;
  title?: string;
  projectId?: string;
}

export function ReferenceLibraryModal({
  isOpen,
  onClose,
  onSelectAssets,
  selectedAssetIds = [],
  filterType = "all",
  allowMultiple = true,
  title = "Attach Reference Media",
  projectId,
}: ReferenceLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedAssetIds);
  const [typeFilter, setTypeFilter] = useState<string>(filterType);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedAssetIds);
      fetchAssets();
    }
  }, [isOpen, typeFilter]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/media?type=${typeFilter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleSelect = (asset: MediaAsset) => {
    if (allowMultiple) {
      setSelectedIds((prev) =>
        prev.includes(asset.id)
          ? prev.filter((id) => id !== asset.id)
          : [...prev, asset.id]
      );
    } else {
      setSelectedIds([asset.id]);
    }
  };

  const handleConfirm = () => {
    const selected = assets.filter((a) => selectedIds.includes(a.id));
    onSelectAssets(selected);
    onClose();
  };

  const filteredAssets = assets.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-4xl max-h-[85vh] bg-[#171717] border border-[#2e2e2e] rounded-[10px] shadow-[0_24px_48px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#2e2e2e] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[4px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
              <FolderOpen className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-[11px] text-[#707070]">
                Private Reference Library (Supabase Storage with RLS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-[#707070] hover:text-white hover:bg-[#232323] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-3 pb-2 border-b border-[#2e2e2e] flex items-center justify-between gap-4 bg-[#171717]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors ${
                activeTab === "library"
                  ? "bg-[#232323] text-brand border border-brand/30"
                  : "text-[#a0a0a0] hover:text-white"
              }`}
            >
              Browse Library ({filteredAssets.length})
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-[6px] font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-[#232323] text-brand border border-brand/30"
                  : "text-[#a0a0a0] hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Reference
            </button>
          </div>

          {activeTab === "library" && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative flex-1">
                <Search className="w-3 h-3 text-[#707070] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2e2e2e] focus:border-brand rounded-[4px] pl-7 pr-3 py-1 text-xs text-[#ededed] placeholder-[#707070] outline-hidden"
                />
              </div>

              {filterType === "all" && (
                <div className="flex items-center gap-1">
                  {["all", "image", "video", "audio", "document"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        typeFilter === t
                          ? "bg-brand text-[#09090b] font-bold"
                          : "text-[#707070] hover:text-white bg-[#121212] border border-[#2e2e2e]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "upload" ? (
            <div className="max-w-xl mx-auto py-2">
              <MediaUploader
                projectId={projectId}
                accept={filterType}
                onUploadComplete={(newAssets) => {
                  setAssets((prev) => [...newAssets, ...prev]);
                  setSelectedIds((prev) => [...prev, ...newAssets.map((a) => a.id)]);
                  setActiveTab("library");
                }}
              />
            </div>
          ) : (
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-16 text-[#707070] font-mono">
                  Loading Reference Assets...
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#1f1f1f] flex items-center justify-center text-[#707070] mx-auto">
                    <ImagePlus className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#ededed]">No reference media found</p>
                    <p className="text-xs text-[#707070] mt-0.5">
                      Upload reference character stills, mood boards, products, audio, or scripts.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="px-4 py-1.5 rounded-[6px] bg-brand text-[#09090b] font-semibold text-xs inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Your First Reference
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedIds.includes(asset.id);

                    return (
                      <div
                        key={asset.id}
                        onClick={() => toggleSelect(asset)}
                        className={`group relative rounded-[8px] bg-[#121212] border p-2 flex flex-col gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-brand ring-2 ring-brand/30 shadow-[0_0_16px_rgba(62,207,142,0.2)]"
                            : "border-[#2e2e2e] hover:border-brand/40"
                        }`}
                      >
                        {/* Media Preview Box */}
                        <div className="aspect-[4/3] rounded-[4px] bg-[#1a1a1a] overflow-hidden flex items-center justify-center relative">
                          {asset.type === "image" && asset.url ? (
                            <img
                              src={asset.thumbnailUrl || asset.url}
                              alt={asset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : asset.type === "video" ? (
                            <Video className="w-8 h-8 text-comic-pink stroke-[2]" />
                          ) : asset.type === "audio" ? (
                            <Music className="w-8 h-8 text-comic-yellow stroke-[2]" />
                          ) : (
                            <FileText className="w-8 h-8 text-comic-cyan stroke-[2]" />
                          )}

                          {/* Selection Checkmark */}
                          <div
                            className={`absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-brand text-[#09090b] shadow-sm"
                                : "bg-black/60 border border-white/20 text-transparent"
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>

                          {/* Type Pill */}
                          <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono uppercase text-brand">
                            {asset.type}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-1">
                          <p className="font-semibold text-white truncate text-[11px] leading-tight">
                            {asset.name}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-[#707070]">
                            <span>{asset.size || "1.2 MB"}</span>
                            {asset.tags && asset.tags.length > 0 && (
                              <span className="truncate max-w-[80px] text-[#a0a0a0]">
                                #{asset.tags[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#2e2e2e] bg-[#141414] flex items-center justify-between">
          <div className="text-[11px] text-[#707070]">
            {selectedIds.length} reference{selectedIds.length === 1 ? "" : "s"} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-[6px] border border-[#2e2e2e] hover:bg-[#202020] text-[#a0a0a0] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              className="px-4 py-1.5 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Attach {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, DragEvent, ClipboardEvent } from "react";
import {
  Upload,
  ImagePlus,
  Video,
  Music,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Tag,
  Edit2,
  Check,
} from "lucide-react";
import { MediaAsset } from "@/types";

interface MediaUploaderProps {
  projectId?: string;
  accept?: "image" | "video" | "audio" | "document" | "all";
  compact?: boolean;
  onUploadComplete?: (assets: MediaAsset[]) => void;
  className?: string;
  autoUpload?: boolean;
}

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  type: "image" | "video" | "audio" | "document";
  size: number;
  previewUrl?: string;
  tags: string[];
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
  isEditingName?: boolean;
}

const SIZE_LIMITS: Record<string, { maxBytes: number; label: string }> = {
  image: { maxBytes: 20 * 1024 * 1024, label: "20MB" },
  audio: { maxBytes: 50 * 1024 * 1024, label: "50MB" },
  video: { maxBytes: 200 * 1024 * 1024, label: "200MB" },
  document: { maxBytes: 10 * 1024 * 1024, label: "10MB" },
};

export function MediaUploader({
  projectId,
  accept = "all",
  compact = false,
  onUploadComplete,
  className = "",
  autoUpload = true,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState<{ [fileId: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accept filter for file input
  const getAcceptString = () => {
    switch (accept) {
      case "image":
        return "image/*";
      case "video":
        return "video/mp4,video/webm,video/quicktime";
      case "audio":
        return "audio/*";
      case "document":
        return "application/pdf,text/plain,text/markdown";
      default:
        return "image/*,video/mp4,video/webm,video/quicktime,audio/*,application/pdf,text/plain,text/markdown";
    }
  };

  const detectType = (file: File): "image" | "video" | "audio" | "document" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    return "document";
  };

  const validateAndQueueFiles = (files: File[]) => {
    setGlobalError(null);
    const newItems: QueuedFile[] = [];

    for (const file of files) {
      const type = detectType(file);

      // Filter check
      if (accept !== "all" && type !== accept) {
        setGlobalError(`Only ${accept} files are accepted here.`);
        continue;
      }

      // Size check
      const limit = SIZE_LIMITS[type];
      if (limit && file.size > limit.maxBytes) {
        setGlobalError(
          `"${file.name}" exceeds the ${limit.label} limit for ${type}s.`
        );
        continue;
      }

      // Thumbnail preview for images
      let previewUrl: string | undefined = undefined;
      if (type === "image") {
        previewUrl = URL.createObjectURL(file);
      }

      const item: QueuedFile = {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        type,
        size: file.size,
        previewUrl,
        tags: [type],
        progress: 0,
        status: "idle",
      };

      newItems.push(item);
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      if (autoUpload) {
        newItems.forEach((item) => uploadFile(item));
      }
    }
  };

  // Upload a single file to /api/media
  const uploadFile = async (item: QueuedFile) => {
    setQueue((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 15 } : f))
    );

    try {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("name", item.name);
      formData.append("type", item.type);
      formData.append("tags", item.tags.join(","));
      if (projectId) formData.append("projectId", projectId);

      // Simulated progress ticker
      const progressTimer = setInterval(() => {
        setQueue((prev) =>
          prev.map((f) => {
            if (f.id === item.id && f.status === "uploading" && f.progress < 85) {
              return { ...f, progress: f.progress + 15 };
            }
            return f;
          })
        );
      }, 200);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setQueue((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "success", progress: 100 } : f))
      );

      if (onUploadComplete && data.asset) {
        onUploadComplete([data.asset]);
      }
    } catch (err: any) {
      setQueue((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: "error", errorMessage: err.message || "Failed to upload" }
            : f
        )
      );
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndQueueFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: globalThis.ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        validateAndQueueFiles(Array.from(e.clipboardData.files));
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [accept]);

  // Remove queued file
  const removeQueueItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Add tag to item
  const handleAddTag = (fileId: string) => {
    const rawTag = (tagInput[fileId] || "").trim();
    if (!rawTag) return;
    setQueue((prev) =>
      prev.map((f) => {
        if (f.id === fileId && !f.tags.includes(rawTag)) {
          return { ...f, tags: [...f.tags, rawTag] };
        }
        return f;
      })
    );
    setTagInput((prev) => ({ ...prev, [fileId]: "" }));
  };

  // Remove tag from item
  const handleRemoveTag = (fileId: string, tagToRemove: string) => {
    setQueue((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return { ...f, tags: f.tags.filter((t) => t !== tagToRemove) };
        }
        return f;
      })
    );
  };

  // Rename item
  const handleRename = (fileId: string, newName: string) => {
    if (!newName.trim()) return;
    setQueue((prev) =>
      prev.map((f) =>
        f.id === fileId ? { ...f, name: newName.trim(), isEditingName: false } : f
      )
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[8px] p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-brand bg-brand/5 shadow-[0_0_24px_rgba(62,207,142,0.15)]"
            : "border-[#2e2e2e] bg-[#171717] hover:border-brand/40 hover:bg-[#1a1a1a]"
        } ${compact ? "p-4" : "p-6"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptString()}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              validateAndQueueFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-2 select-none">
          <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/25 flex items-center justify-center text-brand">
            <ImagePlus className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#ededed]">
              Drag and drop reference files, or{" "}
              <span className="text-brand hover:underline font-bold">browse</span>
            </p>
            <p className="text-[11px] text-[#707070] mt-0.5">
              Paste from clipboard supported • Images (20MB), Audio (50MB), Video (200MB), PDF/Text (10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Friendly Error Banner */}
      {globalError && (
        <div className="flex items-center gap-2 p-3 rounded-[6px] bg-red-500/10 border border-red-500/25 text-red-400 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{globalError}</span>
          <button
            onClick={() => setGlobalError(null)}
            className="ml-auto text-red-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Items / Queue List */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-[#a0a0a0] flex items-center justify-between">
            <span>Uploaded Reference Files ({queue.length})</span>
            <button
              onClick={() => setQueue([])}
              className="text-[10px] text-[#707070] hover:text-red-400 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-[6px] bg-[#1a1a1a] border border-[#2e2e2e] flex flex-col gap-2.5 transition-all text-xs"
              >
                <div className="flex items-center gap-3">
                  {/* Thumbnail / Icon */}
                  <div className="w-12 h-12 rounded-[4px] bg-[#121212] border border-[#2e2e2e] overflow-hidden shrink-0 flex items-center justify-center relative">
                    {item.type === "image" && item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : item.type === "video" ? (
                      <Video className="w-5 h-5 text-comic-pink stroke-[2]" />
                    ) : item.type === "audio" ? (
                      <Music className="w-5 h-5 text-comic-yellow stroke-[2]" />
                    ) : (
                      <FileText className="w-5 h-5 text-comic-cyan stroke-[2]" />
                    )}
                  </div>

                  {/* Name & Size */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.isEditingName ? (
                        <input
                          type="text"
                          defaultValue={item.name}
                          onBlur={(e) => handleRename(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(item.id, (e.target as any).value);
                          }}
                          autoFocus
                          className="bg-[#121212] border border-brand px-2 py-0.5 rounded text-xs text-white outline-hidden w-full max-w-xs"
                        />
                      ) : (
                        <span className="font-medium text-[#ededed] truncate max-w-[240px]">
                          {item.name}
                        </span>
                      )}

                      <button
                        onClick={() =>
                          setQueue((prev) =>
                            prev.map((f) =>
                              f.id === item.id ? { ...f, isEditingName: !f.isEditingName } : f
                            )
                          )
                        }
                        className="text-[#707070] hover:text-[#ededed] p-0.5"
                        title="Rename file"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#707070] mt-0.5">
                      <span className="uppercase font-mono font-bold text-brand">{item.type}</span>
                      <span>•</span>
                      <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 flex items-center gap-2">
                    {item.status === "uploading" && (
                      <div className="flex items-center gap-1.5 text-brand text-[11px]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{item.progress}%</span>
                      </div>
                    )}
                    {item.status === "success" && (
                      <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Uploaded</span>
                      </div>
                    )}
                    {item.status === "error" && (
                      <div className="flex items-center gap-1 text-red-400 text-[11px] font-medium" title={item.errorMessage}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Error</span>
                      </div>
                    )}

                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="p-1 rounded text-[#707070] hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {item.status === "uploading" && (
                  <div className="w-full bg-[#121212] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {/* Tags Management */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#252525]">
                  <Tag className="w-3 h-3 text-[#707070]" />
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#121212] border border-[#2e2e2e] text-[10px] text-[#ededed]"
                    >
                      <span>{t}</span>
                      <button
                        onClick={() => handleRemoveTag(item.id, t)}
                        className="text-[#707070] hover:text-red-400"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}

                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={tagInput[item.id] || ""}
                      onChange={(e) =>
                        setTagInput((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag(item.id);
                        }
                      }}
                      className="bg-[#121212] border border-[#2e2e2e] rounded px-1.5 py-0.5 text-[10px] text-[#ededed] placeholder-[#707070] w-20 outline-hidden focus:border-brand"
                    />
                    <button
                      onClick={() => handleAddTag(item.id)}
                      className="text-[10px] text-brand hover:underline px-1"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

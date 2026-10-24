"use client";

import { useState, useEffect } from "react";
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  Clock,
  Film,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductionTemplate } from "@/types";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProductionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingTemplateId, setUsingTemplateId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setUsingTemplateId(templateId);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage(data.message);
        setTimeout(() => {
          router.push("/projects");
        }, 800);
      } else {
        alert(data.error || "Failed to instantiate template");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUsingTemplateId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#2e2e2e]">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-1">
          <LayoutTemplate className="w-3.5 h-3.5" />
          Production Templates
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-[#ededed] tracking-tight">
          Starter Presets & Blueprints
        </h1>
        <p className="text-xs text-[#a0a0a0] mt-1">
          Launch viral animated shorts, episodic lore, or presenter videos with battle-tested pacing, captions, and camera setups.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-[6px] bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#888] text-xs">
          <Loader2 className="w-6 h-6 animate-spin text-brand mr-2" />
          Loading templates...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-[8px] bg-[#141414] border border-[#2e2e2e] hover:border-[#383838] transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="aspect-video bg-black relative overflow-hidden">
                <img
                  src={tpl.thumbnailUrl}
                  alt={tpl.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-brand border border-white/10">
                  {tpl.aspectRatio}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-[#888] mb-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tpl.duration || (tpl.durationSeconds ? `${tpl.durationSeconds}s` : "30s")}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{tpl.category}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#ededed] mb-1">{tpl.title}</h3>
                  <p className="text-xs text-[#a0a0a0] leading-relaxed mb-3">
                    {tpl.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-[#1f1f1f] text-[#888]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleUseTemplate(tpl.id)}
                  disabled={usingTemplateId === tpl.id}
                  className="w-full py-2 px-3 rounded-[6px] bg-[#1f2822] hover:bg-brand hover:text-[#09090b] text-brand border border-brand/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {usingTemplateId === tpl.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Instantiating...
                    </>
                  ) : (
                    <>
                      Use Template
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BrainCircuit,
  FileText,
  User,
  ThumbsUp,
  ThumbsDown,
  Upload,
  Layers,
  Plus,
  CheckCircle,
  HelpCircle,
  Zap,
} from "lucide-react";

export default function StudioMemoryPage() {
  const [activeTab, setActiveTab] = useState<"guidelines" | "profiles" | "rules" | "knowledge">("guidelines");

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#2e2e2e]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand/10 border border-brand/25 text-brand text-[11px] font-semibold">
            <BrainCircuit className="w-3.5 h-3.5 stroke-[2]" />
            Studio Memory & Persistent DNA
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">AI Training & Studio Memory</h1>
          <p className="text-xs text-[#a0a0a0]">
            Teaches the app&apos;s AI through stored guidelines, character DNA, and feedback distilled from every generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#171717] border border-[#2e2e2e] text-xs text-[#ededed]">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono text-[11px]">Memory Active</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2e2e2e] pb-2 text-xs">
        <button
          onClick={() => setActiveTab("guidelines")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
            activeTab === "guidelines"
              ? "bg-[#232323] text-brand font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <FileText className="w-3.5 h-3.5 stroke-[2]" />
          Studio Guidelines
        </button>
        <button
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
            activeTab === "profiles"
              ? "bg-[#232323] text-brand font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <User className="w-3.5 h-3.5 stroke-[2]" />
          Characters & Styles
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
            activeTab === "rules"
              ? "bg-[#232323] text-brand font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <Zap className="w-3.5 h-3.5 stroke-[2]" />
          Learned Rules
        </button>
        <button
          onClick={() => setActiveTab("knowledge")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
            activeTab === "knowledge"
              ? "bg-[#232323] text-brand font-semibold"
              : "text-[#a0a0a0] hover:text-[#ededed]"
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 stroke-[2]" />
          What AI Knows
        </button>
      </div>

      {/* Placeholder content while Phase (e) builds the full engine */}
      <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Studio Memory Engine</h3>
          <span className="text-[10px] text-brand font-mono bg-brand/10 border border-brand/20 px-2 py-0.5 rounded">
            Module 3 Foundation
          </span>
        </div>
        <p className="text-xs text-[#a0a0a0] leading-relaxed">
          Studio Guidelines and Character Profiles will inject style anchors, prompt guardrails, and reference images into every video generation prompt.
        </p>
      </div>
    </div>
  );
}

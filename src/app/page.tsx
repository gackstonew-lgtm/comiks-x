"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clapperboard,
  BookOpen,
  User,
  Video,
  Layers,
  PlaySquare,
  Activity,
  Sliders,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Film,
  Menu,
  X,
  Clock,
  Mic,
  Camera,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#121212] text-[#ededed] selection:bg-brand selection:text-black">
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <nav
        aria-label="Main Navigation"
        className="sticky top-0 z-50 bg-[#121212]/85 backdrop-blur-md border-b border-[#2e2e2e] transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[6px] bg-brand flex items-center justify-center text-[#09090b] font-black text-sm shadow-[0_0_12px_rgba(62,207,142,0.3)] group-hover:scale-105 transition-transform">
              CX
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Comiks <span className="text-brand">X</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-[#a0a0a0]">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#workflow" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pipeline" className="hover:text-white transition-colors">
              AI Video Pipeline
            </a>
            <a href="#benefits" className="hover:text-white transition-colors">
              Creator Benefits
            </a>
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href="/projects"
                className="px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-[6px] text-xs font-medium text-[#ededed] hover:text-white hover:bg-[#1c1c1c] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-[6px] text-[#a0a0a0] hover:text-white hover:bg-[#1c1c1c] border border-[#2e2e2e]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#2e2e2e] bg-[#171717] px-4 py-5 space-y-4 animate-fade-in">
            <div className="flex flex-col space-y-3 text-sm font-medium text-[#ededed]">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand transition-colors"
              >
                Features
              </a>
              <a
                href="#workflow"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pipeline"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand transition-colors"
              >
                AI Video Pipeline
              </a>
              <a
                href="#benefits"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-brand transition-colors"
              >
                Creator Benefits
              </a>
            </div>

            <div className="pt-3 border-t border-[#2e2e2e] flex flex-col gap-2">
              {user ? (
                <Link
                  href="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-[6px] bg-brand text-[#09090b] text-center font-semibold text-xs"
                >
                  Open Studio Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 rounded-[6px] bg-[#1c1c1c] text-[#ededed] text-center font-medium text-xs border border-[#2e2e2e]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-[6px] bg-brand text-[#09090b] text-center font-semibold text-xs"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-[#2e2e2e]">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/25 text-brand text-xs font-semibold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            End-to-End AI Comic Animation Studio
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Produce 30-Minute Comic Episodes &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-emerald-400 to-[#06b6d4]">
              Viral Social Clips
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#a0a0a0] max-w-2xl mx-auto leading-relaxed">
            Transform scripts and ideas into structured 30-minute narrative arcs. Enforce persistent
            character DNA across all scenes, dub multilingual dialogue, and auto-extract vertical
            9:16 shorts for TikTok and Reels.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link
                href="/projects"
                className="w-full sm:w-auto px-6 py-3 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-sm shadow-[0_4px_16px_rgba(62,207,142,0.25)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Enter Studio Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto px-6 py-3 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-sm shadow-[0_4px_16px_rgba(62,207,142,0.25)] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Start Creating Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-5 py-3 rounded-[6px] bg-[#1c1c1c] hover:bg-[#232323] text-[#ededed] font-medium text-sm border border-[#2e2e2e] transition-colors"
                >
                  Sign In to Existing Studio
                </Link>
              </>
            )}
          </div>

          {/* Studio Preview Mockup */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-[8px] bg-[#171717] border border-[#2e2e2e] p-2 sm:p-3 shadow-[0_24px_48px_0_rgba(0,0,0,0.7)]">
              <div className="rounded-[6px] overflow-hidden border border-[#2e2e2e] bg-[#121212] aspect-[16/9] relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200&auto=format&fit=crop"
                  alt="Comiks X Studio Interface"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-left">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand/10 border border-brand/25 text-brand">
                      Continuous Scene Sequencing
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">Multi-Track Cinematic Studio Engine</h3>
                    <p className="text-xs text-[#a0a0a0]">3 Acts • 9 Micro-Scenes • 5-in-1 Social Derivative Packs</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <span className="text-xs font-mono text-brand">Luma & Kling Pipeline Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. REAL FEATURE INVENTORY SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand">
            Engineered For Creators
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Complete Production Suite From Script to Screen
          </h2>
          <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">
            Every feature is natively built into the studio to eliminate manual prompting, visual drifting,
            and fragmented workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">30-Minute Story Decomposition</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Splits idea prompts, outlines, or scripts into 3-act narrative structures partitioned into
              continuous 5–25s micro-scenes for safe AI video synthesis.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Persistent Character Bible & 5D DNA</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Enforces facial features, turnaround model sheets (front, 3/4, side, back), wardrobe anchors,
              voice profiles, and episodic memories across entire seasons.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Franchise Universe & Canon Hub</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Define world rules, architectural style anchors, cultural glossaries, brand color palettes, and
              stylized comic aesthetics (African Comic, Manga, Graphic Novel, Webtoon).
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Cinematographic Storyboard Director</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Scene-by-scene camera framing (extreme wide, dutch tilt, over-the-shoulder), motion presets, and
              automated continuity scans before rendering.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <PlaySquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Track Timeline & Dubbing Studio</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Full multi-track timeline playback, multilingual dialogue dubbing (English, Swahili, Sheng), version
              take rollbacks, and comic-style subtitles.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Viral 9:16 Social Clip Studio</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Automatically extracts 15s–90s vertical video clips for TikTok, Instagram Reels, and YouTube Shorts
              with UI safe-zone compliance overlays.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Generation Queue & Budget Engine</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Non-blocking background rendering pipeline with live scene progress, retry controls, and granular
              per-scene video cost estimation.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Provider AI Video Abstraction</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              Modular integration with Luma Dream Machine, Kling AI, Runway Gen-3, Fal AI, OpenAI Sora, and
              ElevenLabs speech generation.
            </p>
          </div>

          {/* Feature 9 */}
          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] hover:border-brand/40 transition-all space-y-3 group shadow-sm">
            <div className="w-10 h-10 rounded-[6px] bg-brand/10 border border-brand/25 flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">AI Director & Continuity Copilot</h3>
            <p className="text-xs text-[#a0a0a0] leading-relaxed">
              In-studio copilot providing real-time script breakdown analysis, continuity diagnostics, and
              cinematographic framing suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WORKFLOW / HOW IT WORKS SECTION */}
      <section id="workflow" className="py-20 bg-[#171717]/50 border-y border-[#2e2e2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Production Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              From Concept to Distribution in 4 Steps
            </h2>
            <p className="text-xs sm:text-sm text-[#a0a0a0]">
              How Comiks X streamlines the full animated production cycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3 relative">
              <div className="text-2xl font-black text-brand font-mono">01</div>
              <h4 className="text-sm font-bold text-white">Universe & Character DNA</h4>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Establish franchise world rules, art styles, and lock 5D character consistency anchors before writing.
              </p>
            </div>

            <div className="p-5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3 relative">
              <div className="text-2xl font-black text-brand font-mono">02</div>
              <h4 className="text-sm font-bold text-white">Story & Scene Breakdown</h4>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Decompose episode scripts into 3 acts, 5 chapters, and continuous 5–25s AI generation scenes.
              </p>
            </div>

            <div className="p-5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3 relative">
              <div className="text-2xl font-black text-brand font-mono">03</div>
              <h4 className="text-sm font-bold text-white">Cinematography & Render</h4>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Assign camera angles, motion presets, verify continuity, and dispatch to the background generation queue.
              </p>
            </div>

            <div className="p-5 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-3 relative">
              <div className="text-2xl font-black text-brand font-mono">04</div>
              <h4 className="text-sm font-bold text-white">Assembly & 9:16 Shorts</h4>
              <p className="text-xs text-[#a0a0a0] leading-relaxed">
                Sequence timeline clips, dub multilingual dialogue, and extract viral TikTok/Reels vertical derivatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CREATOR BENEFITS */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand">
              Why Creators Choose Comiks X
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Consistency, Efficiency & Multilingual Reach
            </h2>
            <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">
              Traditional AI video generation suffers from character drifting and disconnected clips.
              Comiks X solves this with strict architectural locks and multi-track assembly.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-[4px] bg-brand/10 text-brand border border-brand/25 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Zero Character Drifting</h4>
                  <p className="text-[11px] text-[#a0a0a0] mt-0.5">
                    Locked turnaround models, wardrobe anchors, and facial specs guarantee your cast looks consistent across 30 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-[4px] bg-brand/10 text-brand border border-brand/25 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Predictable Generation Budgets</h4>
                  <p className="text-[11px] text-[#a0a0a0] mt-0.5">
                    Granular scene cost estimation with duplicate prevention and cryptographic SHA-256 caching.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-[4px] bg-brand/10 text-brand border border-brand/25 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dual Format Distribution</h4>
                  <p className="text-[11px] text-[#a0a0a0] mt-0.5">
                    Output full horizontal episodes for YouTube/streaming and automated 9:16 vertical hooks for TikTok and Reels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[8px] bg-[#171717] border border-[#2e2e2e] space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3">
              <span className="text-xs font-bold text-white">Studio Performance Matrix</span>
              <span className="text-[10px] font-mono text-brand">Supabase & Edge Ready</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex items-center justify-between">
                <span className="text-[#a0a0a0]">Episode Structure</span>
                <span className="font-semibold text-white">3 Acts • 5 Chapters • ~24 Scenes</span>
              </div>
              <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex items-center justify-between">
                <span className="text-[#a0a0a0]">Audio Dubbing Tracks</span>
                <span className="font-semibold text-white">English, Standard Swahili, Sheng</span>
              </div>
              <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex items-center justify-between">
                <span className="text-[#a0a0a0]">Vertical Derivatives</span>
                <span className="font-semibold text-white">15s, 30s, 45s, 60s, 90s (9:16)</span>
              </div>
              <div className="p-3 rounded-[6px] bg-[#121212] border border-[#2e2e2e] flex items-center justify-between">
                <span className="text-[#a0a0a0]">Active AI Models</span>
                <span className="font-semibold text-white">Luma, Kling, Runway, ElevenLabs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BAND */}
      <section className="py-16 bg-gradient-to-b from-[#171717] to-[#121212] border-t border-[#2e2e2e] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Bring Your Animated Universe to Life?
          </h2>
          <p className="text-xs sm:text-sm text-[#a0a0a0] leading-relaxed">
            Create characters, structure episodes, and start generating continuous animated scenes with
            professional AI video tools today.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href={user ? "/projects" : "/signup"}
              className="px-6 py-3 rounded-[6px] bg-brand hover:bg-brand-hover active:bg-brand-active text-[#09090b] font-semibold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>{user ? "Go to Studio Dashboard" : "Get Started Now"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-[#2e2e2e] py-10 bg-[#121212] text-xs text-[#707070]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-brand flex items-center justify-center text-[#09090b] font-black text-xs">
              CX
            </div>
            <span className="font-bold text-[#ededed]">Comiks X Studio</span>
            <span>• Powered by Supabase & Next.js</span>
          </div>

          <div className="flex items-center gap-5 text-[#a0a0a0]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>

          <div>
            © {new Date().getFullYear()} Comiks X. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

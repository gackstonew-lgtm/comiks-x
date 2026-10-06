# Comiks X — Professional AI Comic Animation Studio

> Production-grade digital animation studio engineered for recurring ~30-minute animated comic episodes, continuous character consistency, multi-scene decomposition, and automated viral 9:16 social clip extraction (TikTok & Instagram Reels).

---

## 🌟 Architecture Highlights

1. **30-Minute Episode Multi-Scene Architecture**:
   - 30-minute episodes are decomposed into **5 distinct chapters** and **independent 5–30s scenes**.
   - Video models generate **one scene at a time**; never attempting a single 30-minute monolithic render.

2. **Persistent Character Bible & Consistency Engine**:
   - 16 stored attributes per character: Name, Age, Personality, Appearance, Clothing, Hairstyle, Skin Tone, Body Type, Voice Profile, Accent, Speech Style, Turnaround Prompts, Negative Prompts, and Design Lock.
   - Compiles strict anchor tokens into every scene prompt so character faces, hairstyles, and outfits do not drift.

3. **Pluggable Modular Video Provider Abstraction (`IVideoProvider`)**:
   - Standard internal interface: `generateScene()`, `getGenerationStatus()`, `cancelGeneration()`, `getOutput()`, `generateFromImage()`, `extendVideo()`.
   - Providers: **Luma Dream Machine (Ray)**, **Runway Gen-3 Alpha**, **Kling AI (v1.5/v2)**, **Fal.ai Unified Video (Minimax/Wan 2.1)**, **OpenAI Sora**.
   - Change video engines without modifying application or UI code.

4. **Multi-Track Timeline Editor (6 Synchronized Tracks)**:
   - Tracks: `VIDEO`, `DIALOGUE`, `NARRATION`, `MUSIC`, `SOUND EFFECTS`, `SUBTITLES`.
   - Full transport controls: Play, Pause, Seek, Split, Trim (-1s / +1s), Duplicate, Move Left/Right, Delete, and Scene-specific AI Regeneration.

5. **Automated Social Media Clip Extractor (TikTok & Instagram Reels)**:
   - Automatically scans the 30-minute episode to identify high-retention peaks.
   - Extracts 5–10 short clips (15s, 30s, 45s, 60s, 90s).
   - Generates opening hooks (0–3s), safe-zone bounded kinetic captions, hashtags, and titles.

6. **Authentic African & Kenyan Storytelling Engine**:
   - Native support for Sheng slang, Swahili, and Kenyan English natural mixing.
   - Built-in Nairobi environments: Kencom CBD, pimped-out Matatu Nganyas (violet/cyan neon), Eastlands (Buruburu maisonettes), Kilimani modern tech incubators.

7. **Queue & Cost Management**:
   - Background non-blocking job runner with progress tracking (`Episode generation 24 / 87 scenes`).
   - Cached scene savings: only generates pending or regenerated scenes; never charges for existing successful scenes.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and configure your API keys:
```bash
cp .env.example .env.local
```

### 3. Run Automated Studio Test Suite
```bash
npm test
```

### 4. Start Development Studio
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 📂 Project Directory Structure

```
Comiks X/
├── data/
│   └── comiks_db.json              # Persistent database with authentic Kenyan seed data
├── scripts/
│   └── test-studio.ts              # 36-point automated verification test suite
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── series/             # Series listing & universe rules
│   │   │   ├── characters/         # Character Bible CRUD, lock, duplicate, turnaround
│   │   │   ├── episodes/           # Episode status & scenes
│   │   │   ├── story/generate/     # Idea -> 30-min structured episode engine
│   │   │   ├── scenes/generate/    # Single scene AI regeneration
│   │   │   ├── scenes/voice/       # Character speech synthesis
│   │   │   ├── queue/              # Background generation queue
│   │   │   ├── clips/              # Viral 9:16 clip extractor
│   │   │   ├── thumbnails/         # High-contrast thumbnail generator
│   │   │   ├── export/             # SRT/VTT subtitles & 1080p assembly manifest
│   │   │   └── settings/           # Modular provider key vault
│   │   ├── characters/             # Character Bible workstation UI
│   │   ├── clips/[episodeId]/      # 9:16 TikTok phone mockup & posting kit
│   │   ├── editor/[episodeId]/     # Multi-track timeline & video player
│   │   ├── queue/                  # Live queue monitor & cost guardrail
│   │   ├── series/                 # Series hub & art style locker
│   │   ├── settings/               # Provider switcher & API keys
│   │   ├── story-creator/          # Story idea / script / outline prompt studio
│   │   ├── storyboard/[episodeId]/ # Scene-by-scene director view
│   │   ├── layout.tsx              # Studio navigation shell
│   │   └── page.tsx                # Creator dashboard & production roadmap
│   ├── lib/
│   │   ├── clips/                  # Social clip extraction logic
│   │   ├── cost/                   # Episode cost calculation & cache savings
│   │   ├── db/                     # ComiksDb schema & persistence
│   │   ├── export/                 # SRT/VTT subtitles & EDL assembly builder
│   │   ├── prompt-engine/          # Consistency anchor prompt compiler
│   │   ├── providers/              # Modular AI providers (Luma, Runway, Kling, Fal, Sora)
│   │   └── queue/                  # Non-blocking sequential scene runner
│   └── types/                      # TypeScript domain definitions
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

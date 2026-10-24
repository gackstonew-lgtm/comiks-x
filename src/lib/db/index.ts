import fs from "fs";
import path from "path";
import {
  ComicSeries,
  Character,
  LocationItem,
  Episode,
  Scene,
  SocialClip,
  ThumbnailConcept,
  GenerationJob,
  UsageRecord,
  VideoProviderConfig,
  AvatarProfile,
  ProductionTemplate,
  BrandKitConfig,
  BillingAccount,
  CreditTransaction,
  TeamWorkspace,
  TeamMember,
  ProjectComment,
  MediaAsset,
} from "@/types";

export interface DatabaseSchema {
  series: ComicSeries[];
  characters: Character[];
  locations: LocationItem[];
  episodes: Episode[];
  scenes: Scene[];
  socialClips: SocialClip[];
  thumbnails: ThumbnailConcept[];
  generationJobs: GenerationJob[];
  usageRecords: UsageRecord[];
  settings: VideoProviderConfig;
  avatars?: AvatarProfile[];
  templates?: ProductionTemplate[];
  brandKit?: BrandKitConfig;
  billing?: BillingAccount;
  creditTransactions?: CreditTransaction[];
  team?: TeamWorkspace;
  assets?: MediaAsset[];
  comments?: ProjectComment[];
  schemaVersion?: number;
}

// Support Vercel serverless environment with /tmp fallback
const DB_DIR = process.env.VERCEL
  ? path.join("/tmp", "comiks_data")
  : path.join(process.cwd(), "data");

const DB_FILE = path.join(DB_DIR, "comiks_db.json");

const SEED_SOURCE_FILE = path.join(process.cwd(), "data", "comiks_db.json");

const DEFAULT_SETTINGS: VideoProviderConfig = {
  activeProvider: "luma",
  lumaApiKey: process.env.LUMA_API_KEY || "",
  runwayApiKey: process.env.RUNWAY_API_KEY || "",
  klingApiKey: process.env.KLING_API_KEY || "",
  falApiKey: process.env.FAL_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  enableImageToVideo: true,
  defaultSceneDuration: 12,
  maxRetries: 3,
  dailyBudgetLimitUsd: 50.0,
};

const DEFAULT_TEMPLATES: ProductionTemplate[] = [
  {
    id: "tmpl-nairobi-comedy",
    title: "Viral Comedy Short (FlipaClip Style)",
    category: "comedy_short",
    description: "Fast-paced comedy short with still painted matte plate, character animation on-twos, sound bursts, and top caption bar.",
    aspectRatio: "9:16",
    durationSeconds: 15,
    thumbnailUrl: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?w=600&auto=format&fit=crop",
    tags: ["comedy", "flipaclip", "shorts", "viral"],
    defaultSceneCount: 3,
    sampleBeats: [
      { name: "Hook", description: "Sudden extreme comedic problem shocks protagonist awake", suggestedDurationSeconds: 4, cameraMovement: "Punch Zoom + Shake" },
      { name: "Escalation", description: "The chaos doubles outside the window with loud crowd/sound waves", suggestedDurationSeconds: 6, cameraMovement: "Pan Right" },
      { name: "Punchline", description: "Snappy punchline delivered straight to camera with Pillow facepalm", suggestedDurationSeconds: 5, cameraMovement: "Close-up" },
    ],
    recommendedStyle: "African Comic",
    isPopular: true,
  },
  {
    id: "tmpl-motion-comic-hero",
    title: "Motion Comic Chapter Splash",
    category: "motion_comic",
    description: "Dynamic multi-panel comic layout with halftone transitions, speed lines, and 2.5D camera push-ins.",
    aspectRatio: "16:9",
    durationSeconds: 30,
    thumbnailUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop",
    tags: ["motion_comic", "graphic_novel", "superhero"],
    defaultSceneCount: 4,
    sampleBeats: [
      { name: "Gutter Transition", description: "Camera slides across 3 diagonal comic panels", suggestedDurationSeconds: 8, cameraMovement: "Tracking Pan" },
      { name: "Action Beat", description: "Impact frames flash with comic 'POW!' and radial action lines", suggestedDurationSeconds: 12, cameraMovement: "Dynamic Push" },
      { name: "Cliffhanger", description: "Hero stands victorious on high-contrast black halftone skyline", suggestedDurationSeconds: 10, cameraMovement: "Slow Zoom Out" },
    ],
    recommendedStyle: "2D Comic",
    isPopular: true,
  },
  {
    id: "tmpl-social-explainer",
    title: "TikTok / Reels Studio Explainer",
    category: "social_explainer",
    description: "Vertical storytelling video optimized for mobile retention with top third captions and safe zone bounds.",
    aspectRatio: "9:16",
    durationSeconds: 20,
    thumbnailUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&auto=format&fit=crop",
    tags: ["explainer", "retention", "tiktok", "reels"],
    defaultSceneCount: 3,
    sampleBeats: [
      { name: "Visual Hook", description: "Question on top caption banner with Twemoji", suggestedDurationSeconds: 5, cameraMovement: "Static" },
      { name: "Point Breakdown", description: "Animated avatar explains concept with responsive gestures", suggestedDurationSeconds: 10, cameraMovement: "Slow Push-in" },
      { name: "Call to Action", description: "Follow button animation and outro hook", suggestedDurationSeconds: 5, cameraMovement: "Snap Zoom" },
    ],
    recommendedStyle: "Cartoon",
  },
  {
    id: "tmpl-anime-shonen",
    title: "Anime Shonen Action Sequence",
    category: "manga_sequence",
    description: "High-octane anime sequence with cel-shaded character holds, dramatic Dutch tilts, and smear frames.",
    aspectRatio: "16:9",
    durationSeconds: 25,
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
    tags: ["anime", "action", "shonen", "manga"],
    defaultSceneCount: 4,
    sampleBeats: [
      { name: "Standoff", description: "Extreme close-up on eyes with dramatic wind lines", suggestedDurationSeconds: 6, cameraMovement: "Slow Tilt" },
      { name: "Power Charge", description: "Energy aura glow and impact shockwave burst", suggestedDurationSeconds: 8, cameraMovement: "Dutch Tilt" },
      { name: "Strike", description: "Rapid smear frames and screen vibration", suggestedDurationSeconds: 11, cameraMovement: "Shake + Snap Zoom" },
    ],
    recommendedStyle: "Anime-inspired",
  },
];

const DEFAULT_AVATARS: AvatarProfile[] = [
  {
    id: "avatar-zawadi-01",
    name: "Zawadi",
    category: "presenter",
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop",
    gender: "female",
    defaultVoiceId: "ke-female-zawadi",
    voiceProvider: "elevenlabs",
    presentationStyle: "energetic",
    aspectRatio: "9:16",
    isCustom: false,
    consentVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "avatar-kevo-02",
    name: "Kevo",
    category: "comic_character",
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop",
    gender: "male",
    defaultVoiceId: "ke-male-kevo",
    voiceProvider: "elevenlabs",
    presentationStyle: "humorous",
    aspectRatio: "9:16",
    isCustom: false,
    consentVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "avatar-amina-03",
    name: "Amina",
    category: "anime_host",
    thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop",
    gender: "female",
    defaultVoiceId: "ke-female-amina",
    voiceProvider: "openai",
    presentationStyle: "storyteller",
    aspectRatio: "16:9",
    isCustom: false,
    consentVerified: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_BRAND_KIT: BrandKitConfig = {
  id: "bk-default",
  workspaceId: "workspace-main",
  brandName: "Comiks X Studio",
  primaryColor: "#10b981",
  secondaryColor: "#06b6d4",
  accentColor: "#f59e0b",
  fontFamily: "Cabinet Grotesk, Inter, sans-serif",
  watermarkText: "COMIKS X",
  watermarkPosition: "bottom-right",
  watermarkOpacity: 0.7,
  captionPreset: {
    preset: "comic_yellow",
    fontFamily: "FlipaClip Sans",
    fontSize: 42,
    textColor: "#FFE600",
    backgroundPill: true,
  },
  defaultAspectRatio: "9:16",
  updatedAt: new Date().toISOString(),
};

const DEFAULT_BILLING: BillingAccount = {
  userId: "user-creator",
  currentBalance: 250,
  creditsRemaining: 250,
  plan: "creator",
  planTier: "creator",
  subscriptionStatus: "active",
  billingCycle: "monthly",
  monthlyCreditLimit: 500,
  usedThisCycle: 85,
  creditsUsedThisMonth: 85,
  nextRenewalDate: new Date(Date.now() + 24 * 86400000).toISOString(),
  isStripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
};

const DEFAULT_TEAM: TeamWorkspace = {
  id: "team-default-workspace",
  name: "Comiks X Creative Lab",
  slug: "comiks-x-lab",
  ownerId: "user-creator",
  members: [
    {
      id: "mem-owner",
      userId: "user-creator",
      name: "Lead Creator",
      email: "creator@studio.com",
      role: "owner",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      joinedAt: new Date().toISOString(),
      status: "active",
    },
    {
      id: "mem-animator",
      userId: "user-animator",
      name: "Sam Animator",
      email: "animator@studio.com",
      role: "animator",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      joinedAt: new Date().toISOString(),
      status: "active",
    },
  ],
  sharedProjectIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const EMPTY_DATABASE: DatabaseSchema = {
  series: [],
  characters: [],
  locations: [],
  episodes: [],
  scenes: [],
  socialClips: [],
  thumbnails: [],
  generationJobs: [],
  usageRecords: [],
  settings: DEFAULT_SETTINGS,
  avatars: DEFAULT_AVATARS,
  templates: DEFAULT_TEMPLATES,
  brandKit: DEFAULT_BRAND_KIT,
  billing: DEFAULT_BILLING,
  creditTransactions: [],
  team: DEFAULT_TEAM,
  assets: [],
  comments: [],
  schemaVersion: 3,
};

class ComiksDb {
  private static instance: ComiksDb;
  private data: DatabaseSchema;

  private constructor() {
    this.ensureDbExists();
    this.data = this.load();
  }

  public static getInstance(): ComiksDb {
    if (!ComiksDb.instance) {
      ComiksDb.instance = new ComiksDb();
    }
    return ComiksDb.instance;
  }

  private ensureDbExists(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (!fs.existsSync(DB_FILE)) {
        // If running in Vercel /tmp and repo has a seed file, copy it or use empty
        if (process.env.VERCEL && fs.existsSync(SEED_SOURCE_FILE)) {
          try {
            const seedContent = fs.readFileSync(SEED_SOURCE_FILE, "utf-8");
            fs.writeFileSync(DB_FILE, seedContent, "utf-8");
            return;
          } catch (e) {
            console.warn("Could not copy base seed file, initializing empty:", e);
          }
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(EMPTY_DATABASE, null, 2), "utf-8");
      }
    } catch (err) {
      console.warn("Notice: Using memory fallback for DB storage:", err);
    }
  }

  private load(): DatabaseSchema {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw) as DatabaseSchema;
      return {
        series: Array.isArray(parsed.series) ? parsed.series : [],
        characters: Array.isArray(parsed.characters) ? parsed.characters : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations : [],
        episodes: Array.isArray(parsed.episodes) ? parsed.episodes : [],
        scenes: Array.isArray(parsed.scenes) ? parsed.scenes : [],
        socialClips: Array.isArray(parsed.socialClips) ? parsed.socialClips : [],
        thumbnails: Array.isArray(parsed.thumbnails) ? parsed.thumbnails : [],
        generationJobs: Array.isArray(parsed.generationJobs) ? parsed.generationJobs : [],
        usageRecords: Array.isArray(parsed.usageRecords) ? parsed.usageRecords : [],
        settings: parsed.settings || DEFAULT_SETTINGS,
        avatars: Array.isArray(parsed.avatars) && parsed.avatars.length > 0 ? parsed.avatars : DEFAULT_AVATARS,
        templates: Array.isArray(parsed.templates) && parsed.templates.length > 0 ? parsed.templates : DEFAULT_TEMPLATES,
        brandKit: parsed.brandKit || DEFAULT_BRAND_KIT,
        billing: parsed.billing || DEFAULT_BILLING,
        creditTransactions: Array.isArray(parsed.creditTransactions) ? parsed.creditTransactions : [],
        team: parsed.team || DEFAULT_TEAM,
        assets: Array.isArray(parsed.assets) ? parsed.assets : [],
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        schemaVersion: parsed.schemaVersion || 3,
      };
    } catch {
      return { ...EMPTY_DATABASE };
    }
  }

  private save(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database to file:", err);
    }
  }

  public resetToEmpty(): void {
    this.data = {
      ...EMPTY_DATABASE,
      settings: this.data.settings || DEFAULT_SETTINGS,
    };
    this.save();
  }

  // --- Series (Projects) CRUD ---
  public getSeries(): ComicSeries[] {
    return this.data.series;
  }

  public getSeriesById(id: string): ComicSeries | undefined {
    return this.data.series.find((s) => s.id === id);
  }

  public createSeries(item: Partial<ComicSeries> & { title: string }): ComicSeries {
    const newSeries: ComicSeries = {
      id: item.id || `series-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: item.title,
      description: item.description || item.logline || "",
      logline: item.logline || item.description || "",
      genre: item.genre || "comedy",
      defaultAspectRatio: item.defaultAspectRatio || "9:16",
      artStyle: item.artStyle || "African Comic",
      isStyleLocked: item.isStyleLocked ?? true,
      mainCharacterIds: item.mainCharacterIds || [],
      supportingCharacterIds: item.supportingCharacterIds || [],
      locationIds: item.locationIds || [],
      worldRules: item.worldRules || [],
      visualReferences: item.visualReferences || [],
      brandIdentity: item.brandIdentity || {
        tagline: "",
        outroHook: "",
        primaryColor: "#10b981",
        secondaryColor: "#06b6d4",
        fontStyle: "Bangers",
      },
      episodeCount: item.episodeCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.series.push(newSeries);
    this.save();
    return newSeries;
  }

  public updateSeries(id: string, updates: Partial<ComicSeries>): ComicSeries | undefined {
    const index = this.data.series.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.data.series[index] = {
      ...this.data.series[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.series[index];
  }

  public deleteSeries(id: string): boolean {
    const initialLen = this.data.series.length;
    this.data.series = this.data.series.filter((s) => s.id !== id);
    if (this.data.series.length === initialLen) return false;

    // Cascading deletion of child episodes, characters, locations
    const episodeIdsToDelete = this.data.episodes
      .filter((e) => e.seriesId === id)
      .map((e) => e.id);

    this.data.episodes = this.data.episodes.filter((e) => e.seriesId !== id);
    this.data.characters = this.data.characters.filter((c) => c.seriesId !== id);
    this.data.locations = this.data.locations.filter((l) => l.seriesId !== id);

    // Cascading deletion of scenes, clips, thumbnails, jobs tied to deleted episodes
    this.data.scenes = this.data.scenes.filter((sc) => !episodeIdsToDelete.includes(sc.episodeId));
    this.data.socialClips = this.data.socialClips.filter((c) => !episodeIdsToDelete.includes(c.episodeId));
    this.data.thumbnails = this.data.thumbnails.filter((t) => !episodeIdsToDelete.includes(t.episodeId));
    this.data.generationJobs = this.data.generationJobs.filter((j) => !episodeIdsToDelete.includes(j.episodeId));

    this.save();
    return true;
  }

  // --- Characters CRUD ---
  public getCharacters(seriesId?: string): Character[] {
    if (seriesId) {
      return this.data.characters.filter((c) => c.seriesId === seriesId);
    }
    return this.data.characters;
  }

  public getCharacterById(id: string): Character | undefined {
    return this.data.characters.find((c) => c.id === id);
  }

  public createCharacter(item: Omit<Character, "id" | "createdAt" | "updatedAt"> & { id?: string }): Character {
    const newChar: Character = {
      ...item,
      id: item.id || `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.characters.push(newChar);
    this.save();
    return newChar;
  }

  public updateCharacter(id: string, updates: Partial<Character>): Character | undefined {
    const index = this.data.characters.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.data.characters[index] = {
      ...this.data.characters[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.characters[index];
  }

  public duplicateCharacter(id: string): Character | undefined {
    const char = this.getCharacterById(id);
    if (!char) return undefined;
    const duplicated: Character = {
      ...char,
      id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${char.name} (Copy)`,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.characters.push(duplicated);
    this.save();
    return duplicated;
  }

  public deleteCharacter(id: string): boolean {
    const beforeLen = this.data.characters.length;
    this.data.characters = this.data.characters.filter((c) => c.id !== id);
    if (this.data.characters.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Locations CRUD ---
  public getLocations(seriesId?: string): LocationItem[] {
    if (seriesId) {
      return this.data.locations.filter((l) => l.seriesId === seriesId);
    }
    return this.data.locations;
  }

  public createLocation(item: Omit<LocationItem, "id" | "createdAt"> & { id?: string }): LocationItem {
    const newLoc: LocationItem = {
      ...item,
      id: item.id || `loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.locations.push(newLoc);
    this.save();
    return newLoc;
  }

  public deleteLocation(id: string): boolean {
    const beforeLen = this.data.locations.length;
    this.data.locations = this.data.locations.filter((l) => l.id !== id);
    if (this.data.locations.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Episodes CRUD ---
  public getEpisodes(seriesId?: string): Episode[] {
    if (seriesId) {
      return this.data.episodes.filter((e) => e.seriesId === seriesId);
    }
    return this.data.episodes;
  }

  public getEpisodeById(id: string): Episode | undefined {
    return this.data.episodes.find((e) => e.id === id);
  }

  public createEpisode(item: Omit<Episode, "id" | "createdAt" | "updatedAt"> & { id?: string }): Episode {
    const newEp: Episode = {
      ...item,
      id: item.id || `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.episodes.push(newEp);

    // Also update series episodeCount
    const series = this.data.series.find((s) => s.id === item.seriesId);
    if (series) {
      series.episodeCount = (series.episodeCount || 0) + 1;
    }

    this.save();
    return newEp;
  }

  public updateEpisode(id: string, updates: Partial<Episode>): Episode | undefined {
    const index = this.data.episodes.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    this.data.episodes[index] = {
      ...this.data.episodes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.episodes[index];
  }

  public deleteEpisode(id: string): boolean {
    const epToDelete = this.getEpisodeById(id);
    if (!epToDelete) return false;

    this.data.episodes = this.data.episodes.filter((e) => e.id !== id);

    // Update parent series count
    const series = this.data.series.find((s) => s.id === epToDelete.seriesId);
    if (series && series.episodeCount > 0) {
      series.episodeCount = Math.max(0, series.episodeCount - 1);
    }

    // Cascade delete scenes, clips, thumbnails, jobs
    this.data.scenes = this.data.scenes.filter((s) => s.episodeId !== id);
    this.data.socialClips = this.data.socialClips.filter((c) => c.episodeId !== id);
    this.data.thumbnails = this.data.thumbnails.filter((t) => t.episodeId !== id);
    this.data.generationJobs = this.data.generationJobs.filter((j) => j.episodeId !== id);

    this.save();
    return true;
  }

  // --- Scenes ---
  public getScenes(episodeId: string): Scene[] {
    const ep = this.getEpisodeById(episodeId);
    return ep ? ep.scenes : [];
  }

  public getSceneById(episodeId: string, sceneId: string): Scene | undefined {
    const ep = this.getEpisodeById(episodeId);
    return ep ? ep.scenes.find((s) => s.id === sceneId) : undefined;
  }

  public updateScene(episodeId: string, sceneId: string, updates: Partial<Scene>): Scene | undefined {
    const ep = this.getEpisodeById(episodeId);
    if (!ep) return undefined;
    const sceneIdx = ep.scenes.findIndex((s) => s.id === sceneId);
    if (sceneIdx === -1) return undefined;
    ep.scenes[sceneIdx] = {
      ...ep.scenes[sceneIdx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.updateEpisode(episodeId, { scenes: ep.scenes });
    return ep.scenes[sceneIdx];
  }

  public deleteScene(episodeId: string, sceneId: string): boolean {
    const ep = this.getEpisodeById(episodeId);
    if (!ep) return false;
    const beforeLen = ep.scenes.length;
    ep.scenes = ep.scenes.filter((s) => s.id !== sceneId);
    if (ep.scenes.length !== beforeLen) {
      this.updateEpisode(episodeId, { scenes: ep.scenes });
      return true;
    }
    return false;
  }

  // --- Social Clips ---
  public getSocialClips(episodeId?: string): SocialClip[] {
    if (episodeId) {
      return this.data.socialClips.filter((c) => c.episodeId === episodeId);
    }
    return this.data.socialClips;
  }

  public createSocialClip(clip: Omit<SocialClip, "id" | "createdAt">): SocialClip {
    const newClip: SocialClip = {
      ...clip,
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.socialClips.push(newClip);
    this.save();
    return newClip;
  }

  public deleteSocialClip(id: string): boolean {
    const beforeLen = this.data.socialClips.length;
    this.data.socialClips = this.data.socialClips.filter((c) => c.id !== id);
    if (this.data.socialClips.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Thumbnails ---
  public getThumbnails(episodeId?: string): ThumbnailConcept[] {
    if (episodeId) {
      return this.data.thumbnails.filter((t) => t.episodeId === episodeId);
    }
    return this.data.thumbnails;
  }

  public createThumbnail(item: Omit<ThumbnailConcept, "id" | "createdAt">): ThumbnailConcept {
    const newThumb: ThumbnailConcept = {
      ...item,
      id: `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.thumbnails.push(newThumb);
    this.save();
    return newThumb;
  }

  public selectThumbnail(episodeId: string, thumbnailId: string): void {
    this.data.thumbnails.forEach((t) => {
      if (t.episodeId === episodeId) {
        t.isSelected = t.id === thumbnailId;
      }
    });
    const selected = this.data.thumbnails.find((t) => t.id === thumbnailId);
    if (selected?.imageUrl) {
      this.updateEpisode(episodeId, { thumbnailUrl: selected.imageUrl });
    }
    this.save();
  }

  // --- Generation Queue & Jobs ---
  public getJobs(episodeId?: string): GenerationJob[] {
    if (episodeId) {
      return this.data.generationJobs.filter((j) => j.episodeId === episodeId);
    }
    return this.data.generationJobs;
  }

  public createJob(job: Omit<GenerationJob, "id" | "createdAt" | "updatedAt">): GenerationJob {
    const newJob: GenerationJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.generationJobs.push(newJob);
    this.save();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<GenerationJob>): GenerationJob | undefined {
    const idx = this.data.generationJobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    this.data.generationJobs[idx] = {
      ...this.data.generationJobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.generationJobs[idx];
  }

  public getGenerationJobs(): GenerationJob[] {
    return this.getJobs();
  }

  public getRenderJobs(): GenerationJob[] {
    return this.getJobs();
  }

  public createRenderJob(job: any): GenerationJob {
    return this.createJob({
      episodeId: job.episodeId || "global",
      sceneId: job.sceneId || "global",
      type: job.type || "clip_generation",
      provider: job.parameters?.provider || "luma",
      model: "ray",
      prompt: job.parameters?.prompt || "",
      negativePrompt: job.parameters?.negativePrompt || "",
      durationSeconds: job.parameters?.duration || 5,
      progressPercent: 0,
      costCredits: job.parameters?.cost || 5,
      status: "queued",
      progress: 0,
      parameters: job.parameters || {},
    });
  }

  public updateRenderJob(id: string, updates: any): GenerationJob | undefined {
    return this.updateJob(id, updates);
  }

  public updateJobStatus(id: string, status: GenerationJob["status"], progress?: number, error?: string): GenerationJob | undefined {
    return this.updateJob(id, { status, ...(progress !== undefined ? { progress } : {}), ...(error ? { error } : {}) });
  }

  // --- Usage Records ---
  public getUsageRecords(): UsageRecord[] {
    return this.data.usageRecords;
  }

  public recordUsage(record: Omit<UsageRecord, "id" | "timestamp">): UsageRecord {
    const newRecord: UsageRecord = {
      ...record,
      id: `use-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.usageRecords.push(newRecord);
    this.save();
    return newRecord;
  }

  // --- Settings ---
  public getSettings(): VideoProviderConfig {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(updates: Partial<VideoProviderConfig>): VideoProviderConfig {
    this.data.settings = {
      ...this.getSettings(),
      ...updates,
    };
    this.save();
    return this.data.settings;
  }

  // --- Avatars ---
  public getAvatars(): AvatarProfile[] {
    return this.data.avatars || DEFAULT_AVATARS;
  }

  public getAvatarById(id: string): AvatarProfile | undefined {
    return this.getAvatars().find((a) => a.id === id);
  }

  public createAvatar(avatar: Omit<AvatarProfile, "id" | "createdAt"> & { id?: string }): AvatarProfile {
    const newAvatar: AvatarProfile = {
      ...avatar,
      thumbnailUrl: avatar.thumbnailUrl || avatar.previewUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      category: avatar.category || "presenter",
      id: avatar.id || `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.avatars) this.data.avatars = [...DEFAULT_AVATARS];
    this.data.avatars.push(newAvatar);
    this.save();
    return newAvatar;
  }

  public deleteAvatar(id: string): boolean {
    if (!this.data.avatars) return false;
    const initialLen = this.data.avatars.length;
    this.data.avatars = this.data.avatars.filter((a) => a.id !== id);
    if (this.data.avatars.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Templates ---
  public getTemplates(): ProductionTemplate[] {
    return this.data.templates || DEFAULT_TEMPLATES;
  }

  public getTemplateById(id: string): ProductionTemplate | undefined {
    return this.getTemplates().find((t) => t.id === id);
  }

  // --- Brand Kit ---
  public getBrandKit(): BrandKitConfig {
    return this.data.brandKit || DEFAULT_BRAND_KIT;
  }

  public updateBrandKit(updates: Partial<BrandKitConfig>): BrandKitConfig {
    this.data.brandKit = {
      ...this.getBrandKit(),
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.brandKit;
  }

  // --- Billing & Credits ---
  public getBilling(): BillingAccount {
    return this.getBillingAccount();
  }

  public getBillingAccount(): BillingAccount {
    const b = this.data.billing || DEFAULT_BILLING;
    return {
      ...b,
      creditsRemaining: b.currentBalance,
      creditsUsedThisMonth: b.usedThisCycle,
      planTier: b.plan,
    };
  }

  public getCreditTransactions(): CreditTransaction[] {
    return this.data.creditTransactions || [];
  }

  public addCredits(amount: number, description: string): BillingAccount {
    const billing = this.getBillingAccount();
    const newBalance = billing.currentBalance + amount;
    this.data.billing = {
      ...billing,
      currentBalance: newBalance,
      creditsRemaining: newBalance,
    };

    if (!this.data.creditTransactions) this.data.creditTransactions = [];
    this.data.creditTransactions.unshift({
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: billing.userId,
      amount,
      balanceAfter: newBalance,
      type: "purchase",
      description,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return this.getBillingAccount();
  }

  public deductCredits(amount: number, description: string, modelUsed?: string): { success: boolean; balance: number; error?: string } {
    const billing = this.getBillingAccount();
    if (billing.currentBalance < amount) {
      return { success: false, balance: billing.currentBalance, error: `Insufficient credits. Required: ${amount}, Available: ${billing.currentBalance}` };
    }

    const newBalance = billing.currentBalance - amount;
    this.data.billing = {
      ...billing,
      currentBalance: newBalance,
      creditsRemaining: newBalance,
      usedThisCycle: (billing.usedThisCycle || 0) + amount,
      creditsUsedThisMonth: (billing.usedThisCycle || 0) + amount,
    };

    if (!this.data.creditTransactions) this.data.creditTransactions = [];
    this.data.creditTransactions.unshift({
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: billing.userId,
      amount: -amount,
      balanceAfter: newBalance,
      type: "deduction",
      description,
      modelUsed,
      timestamp: new Date().toISOString(),
    });

    this.save();
    return { success: true, balance: newBalance };
  }

  // --- Team Workspace ---
  public getTeamWorkspace(): TeamWorkspace {
    return this.data.team || DEFAULT_TEAM;
  }

  public addTeamMember(member: Omit<TeamMember, "id" | "joinedAt">): TeamMember {
    const team = this.getTeamWorkspace();
    const newMember: TeamMember = {
      ...member,
      status: member.status || "active",
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      joinedAt: new Date().toISOString(),
    };
    team.members.push(newMember);
    this.data.team = team;
    this.save();
    return newMember;
  }

  public updateTeamMemberRole(memberId: string, role: TeamMember["role"]): boolean {
    const team = this.getTeamWorkspace();
    const target = team.members.find((m) => m.id === memberId);
    if (!target) return false;
    target.role = role;
    this.data.team = team;
    this.save();
    return true;
  }

  public removeTeamMember(memberId: string): boolean {
    const team = this.getTeamWorkspace();
    const initialLen = team.members.length;
    team.members = team.members.filter((m) => m.id !== memberId);
    if (team.members.length !== initialLen) {
      this.data.team = team;
      this.save();
      return true;
    }
    return false;
  }

  // --- Assets Library ---
  public getAssets(typeFilter?: string): MediaAsset[] {
    const list = this.data.assets || [];
    if (typeFilter && typeFilter !== "all") {
      return list.filter((a) => a.type === typeFilter);
    }
    return list;
  }

  public createAsset(asset: Omit<MediaAsset, "id" | "createdAt"> & { id?: string }): MediaAsset {
    const newAsset: MediaAsset = {
      ...asset,
      title: asset.title || asset.name || "Untitled Asset",
      name: asset.name || asset.title || "Untitled Asset",
      id: asset.id || `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    if (!this.data.assets) this.data.assets = [];
    this.data.assets.unshift(newAsset);
    this.save();
    return newAsset;
  }

  public deleteAsset(id: string): boolean {
    if (!this.data.assets) return false;
    const initialLen = this.data.assets.length;
    this.data.assets = this.data.assets.filter((a) => a.id !== id);
    if (this.data.assets.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public updateAsset(id: string, updates: Partial<MediaAsset>): MediaAsset | null {
    if (!this.data.assets) return null;
    const target = this.data.assets.find((a) => a.id === id);
    if (!target) return null;
    Object.assign(target, updates);
    this.save();
    return target;
  }
}

export const db = ComiksDb.getInstance();

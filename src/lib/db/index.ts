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
  schemaVersion: 2,
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
        schemaVersion: parsed.schemaVersion || 2,
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

  public createSeries(item: Omit<ComicSeries, "id" | "createdAt" | "updatedAt"> & { id?: string }): ComicSeries {
    const newSeries: ComicSeries = {
      ...item,
      id: item.id || `series-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
}

export const db = ComiksDb.getInstance();

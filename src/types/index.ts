export type ComicArtStyle =
  | "African Comic"
  | "2D Comic"
  | "Western Comic"
  | "Anime-inspired"
  | "Cartoon"
  | "Cinematic Cartoon"
  | "Motion Comic"
  | "Graphic Novel"
  | "Satirical Cartoon"
  | "Minimalist Comic";

export type LanguageCode = "en" | "sw" | "sheng";

export type CameraAngle =
  | "Establishing Shot"
  | "Wide Shot"
  | "Medium Shot"
  | "Medium Close-up"
  | "Close-up"
  | "Extreme Close-up"
  | "Low Angle"
  | "High Angle"
  | "Dutch Tilt"
  | "Over-the-shoulder";

export type CameraMovement =
  | "Static"
  | "Slow Push-in"
  | "Slow Pull-back"
  | "Pan Left"
  | "Pan Right"
  | "Tilt Up"
  | "Tilt Down"
  | "Tracking Shot"
  | "Dynamic Zoom"
  | "Handheld Shake";

export type SceneTransition =
  | "Cut"
  | "Comic Page Flip"
  | "Crossfade"
  | "Comic Halftone Wipe"
  | "Flash Cut"
  | "Zoom Transition"
  | "Dip to Black";

export interface BrandIdentity {
  tagline: string;
  outroHook: string;
  primaryColor: string;
  secondaryColor: string;
  watermarkText?: string;
  fontStyle: string;
}

export interface CharacterVoiceProfile {
  voiceId: string;
  provider: "elevenlabs" | "openai" | "browser" | "custom";
  accent: string;
  gender: "male" | "female" | "non-binary";
  ageBracket: "child" | "teen" | "young-adult" | "adult" | "elderly";
  tone: string;
  speed: number;
  pitch: number;
}

export interface Character {
  id: string;
  seriesId: string;
  name: string;
  age: number | string;
  personality: string;
  appearance: string;
  clothing: string;
  hairstyle: string;
  skinTone: string;
  bodyType: string;
  voice: CharacterVoiceProfile;
  accent: string;
  speechStyle: string;
  characterDescription: string;
  referenceImages: string[];
  characterPrompt: string;
  negativePrompt: string;
  isLocked: boolean;
  characterSheetUrl?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationItem {
  id: string;
  seriesId: string;
  name: string;
  category: "cbd" | "estate" | "matatu" | "office" | "market" | "rural" | "interior" | "custom";
  description: string;
  visualPrompt: string;
  referenceImages: string[];
  timeOfDayDefaults?: string;
  tags: string[];
  createdAt: string;
}

export interface ComicSeries {
  id: string;
  title: string;
  description: string;
  genre: string;
  artStyle: ComicArtStyle;
  isStyleLocked: boolean;
  mainCharacterIds: string[];
  supportingCharacterIds: string[];
  locationIds: string[];
  worldRules: string[];
  voiceProfilesSummary?: string;
  visualReferences: string[];
  brandIdentity: BrandIdentity;
  episodeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DialogueLine {
  id: string;
  characterId: string;
  characterName: string;
  line: string;
  language: LanguageCode;
  emotion: string;
  audioUrl?: string;
  durationSeconds?: number;
}

export interface EpisodeChapter {
  id: string;
  episodeId: string;
  chapterNumber: number;
  title: string;
  timecode: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  summary: string;
}

export interface Scene {
  id: string;
  episodeId: string;
  sceneNumber: number;
  actNumber: 1 | 2 | 3;
  chapterId?: string;
  duration: number; // in seconds (5-30s typical)
  location: string;
  locationDetails?: string;
  characters: string[];
  dialogue: DialogueLine[];
  narration?: string;
  visualDescription: string;
  cameraAngle: CameraAngle;
  cameraMovement: CameraMovement;
  action: string;
  facialExpressions: string;
  soundEffects: string[];
  backgroundMusic: string;
  transition: SceneTransition;
  aiPrompt: string;
  negativePrompt: string;
  status: "pending" | "queued" | "generating" | "completed" | "failed" | "cached";
  generationJobId?: string;
  videoUrl?: string;
  keyframeImageUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  errorDetails?: string;
  retryCount: number;
  costEstimate: number; // in USD cents or credits
  cachedFromSceneId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThreeActStructure {
  beginning: string;
  conflict: string;
  escalation: string;
  climax: string;
  resolution: string;
  endingHook: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  episodeNumber: number;
  title: string;
  logline: string;
  synopsis: string;
  targetDurationMinutes: number; // e.g. 30
  actualDurationSeconds: number;
  status: "draft" | "storyboarded" | "generating" | "completed" | "rendered";
  charactersInvolved: string[];
  threeActStructure: ThreeActStructure;
  chapters: EpisodeChapter[];
  scenes: Scene[];
  videoUrl?: string;
  thumbnailUrl?: string;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface SocialClip {
  id: string;
  episodeId: string;
  title: string;
  hook: string;
  mainMoment: string;
  endingCta: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
  durationSeconds: number;
  aspectRatio: "9:16" | "1:1" | "16:9";
  platform: "tiktok" | "reels" | "youtube_shorts" | "all";
  captions: {
    start: number;
    end: number;
    text: string;
    emphasisWords?: string[];
  }[];
  description: string;
  hashtags: string[];
  thumbnailUrl?: string;
  videoUrl?: string;
  safeZoneCompliance: boolean;
  createdAt: string;
}

export interface ThumbnailConcept {
  id: string;
  episodeId: string;
  title: string;
  conceptPrompt: string;
  focalCharacterName: string;
  facialExpression: string;
  composition: string;
  contrastStyle: string;
  imageUrl?: string;
  isSelected: boolean;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  episodeId: string;
  sceneId: string;
  provider: string; // "luma" | "runway" | "kling" | "fal" | "sora" | "minimax"
  model: string;
  prompt: string;
  negativePrompt: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  durationSeconds: number;
  outputUrl?: string;
  error?: string;
  progressPercent: number;
  costCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface UsageRecord {
  id: string;
  userId: string;
  episodeId?: string;
  sceneId?: string;
  type: "video" | "voice" | "image" | "story";
  provider: string;
  model: string;
  units: number;
  estimatedCostUsd: number;
  timestamp: string;
}

export interface VideoProviderConfig {
  activeProvider: "luma" | "runway" | "kling" | "fal" | "sora" | "minimax";
  lumaApiKey?: string;
  runwayApiKey?: string;
  klingApiKey?: string;
  falApiKey?: string;
  openaiApiKey?: string;
  elevenlabsApiKey?: string;
  geminiApiKey?: string;
  enableImageToVideo: boolean;
  defaultSceneDuration: number;
  maxRetries: number;
  dailyBudgetLimitUsd: number;
}

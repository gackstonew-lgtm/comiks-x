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
  dna?: {
    identity?: CharacterIdentityDNA;
    visual?: CharacterVisualDNA;
    personality?: CharacterPersonalityDNA;
    performance?: CharacterPerformanceDNA;
    voice?: CharacterVoiceDNA;
  };
  referencesPack?: CharacterReferenceItem[];
  memories?: CharacterMemoryItem[];
  lockOverrides?: LockOverride[];
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
  logline?: string;
  defaultAspectRatio?: string;
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
  brandKit?: CreatorBrandKit;
  worldUniverseId?: string;
  featureFlags?: FeatureFlagConfig;
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
  shots?: Shot[];
  qualityScore?: number;
  approvalStatus?: ApprovalStatus;
  version?: number;
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
  type?: string;
  provider: string; // "luma" | "runway" | "kling" | "fal" | "sora" | "minimax"
  model: string;
  prompt: string;
  negativePrompt: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  durationSeconds: number;
  outputUrl?: string;
  error?: string;
  progressPercent: number;
  progress?: number;
  parameters?: Record<string, any>;
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
  activeProvider: "luma" | "runway" | "kling" | "fal" | "sora" | "minimax" | "replicate";
  replicateApiKey?: string;
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

// ==========================================
// ADVANCED PRODUCTION DOMAIN INTERFACES
// ==========================================

export type ApprovalStatus =
  | "draft"
  | "generating"
  | "generated"
  | "quality_review"
  | "creator_review"
  | "approved"
  | "master";

export type LockLevel = "series" | "world" | "character" | "episode" | "scene" | "shot";

export type ReferenceType = "identity" | "pose" | "clothing" | "expression" | "action" | "style";

export interface CharacterIdentityDNA {
  role: string;
  species?: string;
  nationality: string;
  culturalContext: string;
  biography: string;
}

export interface CharacterVisualDNA {
  faceDetails: string;
  skinTone: string;
  bodyType: string;
  hairstyle: string;
  clothing: string;
  accessories?: string;
  proportions: string;
  distinctiveFeatures: string;
  colorLanguage: string;
  visualStyle: string;
}

export interface CharacterPersonalityDNA {
  values: string[];
  fears: string[];
  motivations: string[];
  strengths: string[];
  weaknesses: string[];
  habits: string[];
  humorStyle: string;
  emotionalTriggers: string[];
}

export interface CharacterPerformanceDNA {
  posture: string;
  movementStyle: string;
  gestures: string[];
  facialExpressionTendencies: string[];
  reactionPatterns: string[];
  aggressionLevel: number; // 1-10
  energyLevel: number; // 1-10
  emotionalRange: string;
}

export interface CharacterVoiceDNA {
  voiceId: string;
  accent: string;
  language: string;
  speechSpeed: number;
  pitch: number;
  speechStyle: string;
  vocabulary: string[];
  slang: string[];
  emotionalDelivery: string;
}

export interface CharacterMemoryItem {
  id: string;
  characterId: string;
  episodeId?: string;
  type: "relationship" | "event" | "injury" | "possession" | "secret" | "conflict" | "growth";
  description: string;
  significance: "minor" | "moderate" | "pivotal";
  acquiredAt: string;
}

export interface CharacterReferenceItem {
  id: string;
  characterId: string;
  type: ReferenceType;
  label: string;
  imageUrl: string;
  cameraAngle?: string;
  isPrimary: boolean;
}

export interface LockOverride {
  id: string;
  targetId: string;
  level: LockLevel;
  field: string;
  originalValue: string;
  overrideValue: string;
  reason: string;
  approvedForSceneId?: string;
  isApproved: boolean;
  attribute?: string;
  justification?: string;
  approvedBy?: string;
}

export interface WorldUniverse {
  id: string;
  seriesId: string;
  name: string;
  description: string;
  geography: string;
  cities: string[];
  neighborhoods: string[];
  architectureStyle: string;
  culturalContext: string;
  timePeriod: string;
  techLevel: string;
  vehicles: string[];
  clothingConventions: string[];
  recurringLocations: string[];
  lightingRules: string;
  environmentalRules: string[];
  colorLanguage: string;
  weatherDefaults: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shot {
  id: string;
  sceneId: string;
  episodeId: string;
  shotNumber: number;
  duration: number; // 4-30s
  shotType: "wide" | "medium" | "close_up" | "extreme_close_up" | "over_shoulder" | "pov";
  cameraAngle: CameraAngle;
  cameraMovement: CameraMovement;
  framing: string;
  lens: string;
  characters: string[];
  action: string;
  expression: string;
  dialogue?: string;
  narration?: string;
  environment: string;
  lighting: string;
  weather?: string;
  motionPresetId?: string;
  references: string[];
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  provider?: string;
  model?: string;
  videoUrl?: string;
  generationStatus: "pending" | "generating" | "completed" | "failed";
  qualityScore?: number;
  approvalStatus: ApprovalStatus;
  version?: number;
}

export interface MotionPreset {
  id: string;
  name: string;
  type: "character" | "camera";
  category: string;
  description: string;
  promptTokens: string;
}

export interface ContinuityWarning {
  id: string;
  type: "character" | "world" | "narrative";
  severity: "warning" | "critical";
  sceneNumber: number;
  characterName?: string;
  issue: string;
  previousContext: string;
  currentContext: string;
  suggestedFix: string;
}

export interface ContinuityReport {
  episodeId: string;
  timestamp: string;
  passed: boolean;
  warnings: ContinuityWarning[];
}

export interface ProviderCapability {
  providerId: string;
  name: string;
  supportedTypes: Array<"text_to_video" | "image_to_video" | "video_extension" | "character_reference">;
  maxDuration: number;
  minDuration: number;
  supportedRatios: Array<"16:9" | "9:16" | "1:1">;
  audioSupport: boolean;
  costPerSecondUsd: number;
  latencyProfile: "fast" | "standard" | "slow";
  qualityRating: number;
}

export interface GenerationCacheRecord {
  contentHash: string;
  outputUrl: string;
  prompt: string;
  provider: string;
  model: string;
  duration: number;
  createdAt: string;
  hitCount: number;
}

export interface AssetProvenance {
  id: string;
  assetType: "shot" | "scene" | "episode" | "audio" | "clip";
  assetId: string;
  episodeId: string;
  sceneId?: string;
  shotId?: string;
  characterIds: string[];
  prompt: string;
  provider: string;
  model: string;
  parentVersion?: number;
  approvedBy?: string;
  timestamp: string;
}

export interface QualityScoreBreakdown {
  overall: number;
  visualScore: number;
  narrativeScore: number;
  technicalScore: number;
  audioScore: number;
  notes: string[];
}

export interface AssetVersion {
  versionNumber: number;
  assetId: string;
  outputUrl: string;
  prompt: string;
  provider: string;
  model: string;
  createdAt: string;
  approvalStatus: ApprovalStatus;
}

export interface DubbingTrack {
  language: "en" | "sw" | "sheng" | "fr" | "yo" | "ig";
  audioUrl: string;
  subtitleUrl?: string;
  isLipSynced: boolean;
  status: "ready" | "processing";
}

export interface RetentionScores {
  hookScore: number;
  retentionScore: number;
  emotionalImpact: number;
  storyClarity: number;
  visualImpact: number;
  characterAppeal: number;
  loopPotential: number;
}

export interface HookVariant {
  id: string;
  type: "curiosity" | "conflict" | "emotional" | "shock";
  hookText: string;
  suggestedDurationSeconds: number;
}

export interface DerivativesBundle {
  episodeId: string;
  fullEpisodeUrl?: string;
  shortVideos: SocialClip[];
  characterClips: Array<{ characterName: string; title: string; videoUrl: string }>;
  quoteCards: Array<{ quote: string; speaker: string; imageUrl: string }>;
  comicPanels: Array<{ panelNumber: number; sceneNumber: number; panelUrl: string }>;
  storyPosts: Array<{ title: string; caption: string; coverUrl: string }>;
  thumbnails: ThumbnailConcept[];
  trailerUrl?: string;
  recapUrl?: string;
}

export interface CreatorBrandKit {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  typography: string;
  watermarkText?: string;
  captionStyle: "comic_yellow" | "anime_cyan" | "boxed_dark";
  introVideoUrl?: string;
  outroHook: string;
}

export interface ContentPlanItem {
  id: string;
  episodeId: string;
  assetType: "episode" | "clip" | "quote" | "comic";
  title: string;
  platform: "tiktok" | "reels" | "shorts" | "youtube" | "all";
  scheduledDate: string;
  status: "planned" | "ready" | "published";
}

export interface CreatorAnalytics {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  avgRetentionPercent: number;
  bestPerformingCharacter?: string;
  bestPerformingHook?: string;
  hasPlatformConnection: boolean;
}

export interface FeatureFlagConfig {
  enableAIDirector: boolean;
  enableCharacterMemory: boolean;
  enableWorldBuilder: boolean;
  enableQualityGate: boolean;
  enableSocialDirector: boolean;
  enableDubbing: boolean;
  enableCreatorIntelligence: boolean;
  enableAIAssistant: boolean;
}

export type { SceneGenerationRequest, GenerationResponse } from "@/lib/providers/video-provider.interface";

// ==========================================
// EXPANDED STUDIO ENTERPRISE TYPES
// ==========================================

export interface AvatarProfile {
  id: string;
  name: string;
  category?: "presenter" | "comic_character" | "anime_host" | "photorealistic" | string;
  role?: string;
  avatarType?: string;
  stylePreset?: string;
  voiceId?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  gender?: "female" | "male" | "non-binary";
  defaultVoiceId?: string;
  voiceProvider?: "elevenlabs" | "openai" | "custom";
  presentationStyle?: "energetic" | "formal" | "humorous" | "storyteller";
  aspectRatio?: "16:9" | "9:16";
  isCustom?: boolean;
  consentVerified?: boolean;
  createdAt: string;
}

export interface ProductionTemplate {
  id: string;
  title: string;
  category: "comedy_short" | "motion_comic" | "manga_sequence" | "product_ad" | "social_explainer" | "episodic_story" | string;
  description: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  durationSeconds: number;
  duration?: string;
  thumbnailUrl: string;
  tags: string[];
  defaultSceneCount: number;
  sampleBeats: Array<{
    name: string;
    description: string;
    suggestedDurationSeconds: number;
    cameraMovement: string;
  }>;
  recommendedStyle: ComicArtStyle;
  isPopular?: boolean;
}

export interface BrandKitConfig {
  id: string;
  workspaceId: string;
  brandName: string;
  logoUrl?: string;
  watermarkUrl?: string;
  secondaryLogoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  watermarkText?: string;
  watermarkPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  watermarkOpacity: number;
  introVideoUrl?: string;
  outroVideoUrl?: string;
  captionPreset: any;
  defaultAspectRatio: "9:16" | "16:9" | "1:1";
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number; // positive = credit added, negative = deducted
  balanceAfter: number;
  type: "deduction" | "purchase" | "subscription_grant" | "refund";
  description: string;
  modelUsed?: string;
  jobId?: string;
  timestamp: string;
  createdAt?: string;
}

export interface BillingAccount {
  userId: string;
  currentBalance: number;
  creditsRemaining: number;
  plan: "free" | "creator" | "studio_pro";
  planTier: string;
  subscriptionStatus: "active" | "canceled" | "past_due" | "trialing";
  billingCycle: "monthly" | "yearly";
  monthlyCreditLimit: number;
  usedThisCycle: number;
  creditsUsedThisMonth: number;
  nextRenewalDate: string;
  isStripeConfigured: boolean;
}

export interface TeamMember {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: "owner" | "director" | "animator" | "reviewer" | "admin" | "editor" | "viewer" | string;
  avatarUrl?: string;
  joinedAt: string;
  status?: "active" | "invited";
}

export interface TeamWorkspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: TeamMember[];
  sharedProjectIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectComment {
  id: string;
  projectId: string;
  sceneId?: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  timecode?: number;
  status: "open" | "resolved";
  createdAt: string;
}

export interface MediaAsset {
  userId?: string;
  projectId?: string | null;
  id: string;
  name: string;
  title?: string;
  type: "video" | "image" | "audio" | "document" | "character_sheet" | "comic_panel" | "turnaround" | string;
  url: string;
  thumbnailUrl?: string;
  fileSizeMb?: number;
  size?: string;
  format?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1" | "4:5" | string;
  durationSeconds?: number;
  duration?: string;
  sourceJobId?: string;
  sourcePrompt?: string;
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
}




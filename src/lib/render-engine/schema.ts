/**
 * Comiks X — Render Specification Schemas & Type System
 * Provides deterministic, strictly validated schemas for all production modes,
 * scene timelines, character poses, visemes, camera movements, and audio mastering.
 */

export type VisemeShape = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";

export const VISEME_SHAPES: VisemeShape[] = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];

export type ProductionMode = 
  | "limited_animation"   // Hand-drawn FlipaClip on-twos/threes (default)
  | "rigged_puppet"       // 2D skeletal/cutout puppet with spring dynamics
  | "ai_motion_hybrid"    // I2V/V2V decimated to 12fps with cel-edge shader
  | "motion_comic";       // Multi-panel 2.5D parallax with comic gutters

export type ComicVFXType = 
  | "speed_lines" 
  | "impact_frame" 
  | "halftone_dots" 
  | "smear" 
  | "sound_burst";

export interface WordTimestamp {
  word: string;
  startMs: number;
  endMs: number;
  emphasis?: boolean;
}

export interface VisemeFrame {
  timeMs: number;
  shape: VisemeShape;
}

export interface DialogueLineSpec {
  id: string;
  characterId: string;
  text: string;
  language: "en" | "sw" | "sheng";
  audioUrl?: string;
  durationMs: number;
  wordTimestamps: WordTimestamp[];
  visemes: VisemeFrame[];
}

export interface CameraKeyframe {
  frame: number;
  x: number;               // Horizontal pan offset in pixels or percentage (-100 to 100)
  y: number;               // Vertical pan offset
  zoom: number;            // 1.0 = normal, 1.25 = punch-in, etc.
  rotationDeg: number;     // Dutch tilt rotation in degrees
  shakeIntensity: number;  // 0 = none, 1-10 for comic punch screen shake
}

export interface CartoonVFXSpec {
  id: string;
  type: ComicVFXType;
  startFrame: number;
  durationFrames: number;
  text?: string;           // E.g. "BAM!", "AMEN!", "GONG!"
  color?: string;
  intensity?: number;      // 0 to 1
  xPercent?: number;       // Position in 9:16 or 16:9 canvas
  yPercent?: number;
}

export interface CharacterPoseSpec {
  poseId: string;
  name: string;
  spriteUrl: string;
  mouthAnchor: { xPercent: number; yPercent: number; scale: number };
  eyeAnchor: { xPercent: number; yPercent: number; scale: number };
  handAnchor?: { xPercent: number; yPercent: number };
  headAnchor?: { xPercent: number; yPercent: number };
}

export interface SceneCharacterSpec {
  characterId: string;
  name: string;
  xPercent: number;        // Canvas X placement (0 = left, 50 = center, 100 = right)
  yPercent: number;        // Canvas Y placement (0 = top, 50 = center, 100 = bottom)
  scale: number;
  flipHorizontal?: boolean;
  activeDialogueId?: string;
  poseTimeline: Array<{ frame: number; poseId: string }>;
  customMouthSprites?: Partial<Record<VisemeShape, string>>;
}

export interface BackgroundSpec {
  plateUrl: string;
  foregroundLayerUrl?: string; // Optional foreground element for 2.5D parallax sandwich
  parallaxDepth?: number;      // Parallax multiplier (0 to 1)
  tintHex?: string;
  saturation?: number;
}

export interface SceneSpec {
  sceneId: string;
  sceneIndex: number;
  title?: string;
  durationFrames: number;      // Timeline duration at 30fps
  productionMode: ProductionMode;
  fpsRetiming: number;         // 12 (on-twos) or 8 (on-threes) for character layer
  background: BackgroundSpec;
  characters: SceneCharacterSpec[];
  dialogues: DialogueLineSpec[];
  vfx: CartoonVFXSpec[];
  camera: CameraKeyframe[];
  notes?: string;
}

export interface TopCaptionBarSpec {
  enabled: boolean;
  headlineText: string;        // E.g. "That one church close to your house ⛪😂"
  positionYPercent: number;    // Usually 8% - 15% from top
  backgroundColor: string;     // E.g. "rgba(255, 255, 255, 0.96)"
  textColor: string;           // E.g. "#111827"
  highlightColor: string;      // E.g. "#10B981" (Supabase brand green)
  fontFamily: string;
  fontWeight: string;
  karaokeMode: boolean;
}

export interface AudioMasteringSpec {
  targetLUFS: number;          // Standard -14 LUFS for TikTok/Shorts
  musicBedUrl?: string;
  musicBedVolume: number;      // 0 to 1, default 0.12
  duckingDb: number;           // -18 dB attenuation during active dialogue
  stemOutputs: boolean;        // Whether to export separate dialogue, SFX, music stems
}

export interface EpisodeRenderSpec {
  specVersion: "1.0.0";
  episodeId: string;
  title: string;
  aspectRatio: "9:16" | "16:9";
  width: number;               // 1080 (9:16) or 1920 (16:9)
  height: number;              // 1920 (9:16) or 1080 (16:9)
  fps: number;                 // Default 30
  seed: number;                // Deterministic PRNG seed
  captionBar: TopCaptionBarSpec;
  scenes: SceneSpec[];
  audioMastering: AudioMasteringSpec;
  metadata?: {
    author?: string;
    seriesTitle?: string;
    tags?: string[];
  };
}

/**
 * Validation Result wrapper
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validates a complete EpisodeRenderSpec ensuring strict compliance and determinism.
 */
export function validateRenderSpec(spec: unknown): ValidationResult<EpisodeRenderSpec> {
  const errors: string[] = [];

  if (!spec || typeof spec !== "object") {
    return { success: false, errors: ["RenderSpec must be a non-null object."] };
  }

  const s = spec as Record<string, any>;

  if (s.specVersion !== "1.0.0") {
    errors.push(`Invalid specVersion '${s.specVersion}'. Expected '1.0.0'.`);
  }
  if (!s.episodeId || typeof s.episodeId !== "string") {
    errors.push("Missing or invalid 'episodeId'.");
  }
  if (!s.title || typeof s.title !== "string") {
    errors.push("Missing or invalid 'title'.");
  }
  if (s.aspectRatio !== "9:16" && s.aspectRatio !== "16:9") {
    errors.push(`Invalid aspectRatio '${s.aspectRatio}'. Must be '9:16' or '16:9'.`);
  }
  if (typeof s.width !== "number" || s.width <= 0) {
    errors.push("width must be a positive number.");
  }
  if (typeof s.height !== "number" || s.height <= 0) {
    errors.push("height must be a positive number.");
  }
  if (typeof s.fps !== "number" || (s.fps !== 24 && s.fps !== 30 && s.fps !== 60)) {
    errors.push("fps must be 24, 30, or 60.");
  }
  if (typeof s.seed !== "number") {
    errors.push("seed must be a deterministic number.");
  }

  // Validate captionBar
  if (!s.captionBar || typeof s.captionBar !== "object") {
    errors.push("Missing 'captionBar' specification.");
  } else {
    if (typeof s.captionBar.headlineText !== "string") {
      errors.push("captionBar.headlineText must be a string.");
    }
  }

  // Validate scenes
  if (!Array.isArray(s.scenes) || s.scenes.length === 0) {
    errors.push("RenderSpec must contain at least one scene.");
  } else {
    s.scenes.forEach((scene: any, idx: number) => {
      if (!scene.sceneId) errors.push(`Scene ${idx} missing 'sceneId'.`);
      if (typeof scene.durationFrames !== "number" || scene.durationFrames <= 0) {
        errors.push(`Scene ${idx} durationFrames must be > 0.`);
      }
      const validModes: ProductionMode[] = ["limited_animation", "rigged_puppet", "ai_motion_hybrid", "motion_comic"];
      if (!validModes.includes(scene.productionMode)) {
        errors.push(`Scene ${idx} invalid productionMode '${scene.productionMode}'.`);
      }
      if (!scene.background?.plateUrl) {
        errors.push(`Scene ${idx} missing background plateUrl.`);
      }
    });
  }

  // Validate audioMastering
  if (!s.audioMastering || typeof s.audioMastering !== "object") {
    errors.push("Missing 'audioMastering' specification.");
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return { success: true, data: spec as EpisodeRenderSpec };
}

/**
 * Default safe factory for creating an EpisodeRenderSpec with FlipaClip defaults.
 */
export function createDefaultRenderSpec(params: {
  episodeId: string;
  title: string;
  aspectRatio?: "9:16" | "16:9";
  seed?: number;
}): EpisodeRenderSpec {
  const isVertical = (params.aspectRatio || "9:16") === "9:16";

  return {
    specVersion: "1.0.0",
    episodeId: params.episodeId,
    title: params.title,
    aspectRatio: isVertical ? "9:16" : "16:9",
    width: isVertical ? 1080 : 1920,
    height: isVertical ? 1920 : 1080,
    fps: 30,
    seed: params.seed ?? Math.floor(Math.random() * 1000000),
    captionBar: {
      enabled: true,
      headlineText: params.title,
      positionYPercent: isVertical ? 9 : 6,
      backgroundColor: "rgba(255, 255, 255, 0.96)",
      textColor: "#111827",
      highlightColor: "#10B981",
      fontFamily: "Inter, Cabinet Grotesk, sans-serif",
      fontWeight: "900",
      karaokeMode: true,
    },
    scenes: [],
    audioMastering: {
      targetLUFS: -14,
      musicBedVolume: 0.12,
      duckingDb: -18,
      stemOutputs: true,
    },
    metadata: {
      seriesTitle: "Comiks X Productions",
      tags: ["comedy", "animation", "2d", "shorts"],
    },
  };
}

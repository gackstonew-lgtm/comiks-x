import { Scene, Shot, MotionPreset, ComicSeries, Character, CameraAngle, CameraMovement } from "@/types";
import { ComicPromptEngine } from "@/lib/prompt-engine";
import { characterOS } from "@/lib/character-os";

export const BUILTIN_MOTION_PRESETS: MotionPreset[] = [
  // Character Motions
  {
    id: "motion-char-walking",
    name: "Confident Stride Walk",
    type: "character",
    category: "Locomotion",
    description: "Purposeful forward walking with natural arm swing and rhythmic comic weight",
    promptTokens: "walking forward with confident purposeful stride, rhythmic stylized animation, grounded foot contact",
  },
  {
    id: "motion-char-running",
    name: "Frantic Comedic Sprint",
    type: "character",
    category: "Locomotion",
    description: "High-octane panic sprint with exaggerated leg motion and sweat particles",
    promptTokens: "running frantically at high speed, animated sweat droplets flying, exaggerated comic stride, dodging obstacles",
  },
  {
    id: "motion-char-talking",
    name: "Expressive Animated Dialogue",
    type: "character",
    category: "Acting",
    description: "Lively speech cadence with dynamic hand gestures and head bobs",
    promptTokens: "speaking animatedly, expressive hand gestures emphasizing words, natural head nods, vibrant facial phonemes",
  },
  {
    id: "motion-char-laughing",
    name: "Hearty Comedic Laugh",
    type: "character",
    category: "Acting",
    description: "Uncontrollable hearty laughter with thrown-back head and shaking shoulders",
    promptTokens: "bursting into laughter, shoulders shaking with humor, head tipped back slightly, broad radiant smile",
  },
  {
    id: "motion-char-reacting",
    name: "Shock Freeze Take",
    type: "character",
    category: "Acting",
    description: "Classic comic double-take with wide pupils and startled reaction pose",
    promptTokens: "sudden shocked double-take, eyes widening in comedic disbelief, dramatic freeze-frame reaction",
  },

  // Camera Motions
  {
    id: "motion-cam-pushin",
    name: "Cinematic Slow Push-in",
    type: "camera",
    category: "Camera Movement",
    description: "Smooth continuous forward camera tracking towards subject",
    promptTokens: "smooth continuous camera push-in towards subject, volumetric cinematic depth, steady focal lock",
  },
  {
    id: "motion-cam-handheld",
    name: "Dynamic Handheld Drift",
    type: "camera",
    category: "Camera Movement",
    description: "Intimate organic handheld camera shake capturing urgency",
    promptTokens: "subtle organic handheld camera shake, responsive docu-style framing, dynamic tension",
  },
  {
    id: "motion-cam-pan",
    name: "Lateral Tracking Pan",
    type: "camera",
    category: "Camera Movement",
    description: "Smooth horizontal pan matching subject velocity",
    promptTokens: "smooth lateral camera pan tracking character motion, rich background parallax blur",
  },
  {
    id: "motion-cam-orbit",
    name: "Heroic 45-degree Orbit",
    type: "camera",
    category: "Camera Movement",
    description: "Arcing orbital camera movement revealing surrounding environment",
    promptTokens: "heroic arcing 45-degree camera orbit around subject, dynamic angular perspective shift",
  },
];

export class MotionLibrary {
  private static instance: MotionLibrary;

  private constructor() {}

  public static getInstance(): MotionLibrary {
    if (!MotionLibrary.instance) {
      MotionLibrary.instance = new MotionLibrary();
    }
    return MotionLibrary.instance;
  }

  public getPresets(): MotionPreset[] {
    return BUILTIN_MOTION_PRESETS;
  }

  public getPresetById(id: string): MotionPreset | undefined {
    return BUILTIN_MOTION_PRESETS.find((p) => p.id === id);
  }
}

export class AIDirector {
  private static instance: AIDirector;

  private constructor() {}

  public static getInstance(): AIDirector {
    if (!AIDirector.instance) {
      AIDirector.instance = new AIDirector();
    }
    return AIDirector.instance;
  }

  /**
   * Decomposes an individual Scene into 2 to 4 fine-grained 4–20s Shot generation units
   */
  public planSceneShots(scene: Scene, series: ComicSeries, characters: Character[]): Shot[] {
    const totalDuration = scene.duration;
    const shotCount = totalDuration > 16 ? 3 : totalDuration > 9 ? 2 : 1;
    const durationPerShot = Math.max(4, Math.round((totalDuration / shotCount) * 10) / 10);

    const shots: Shot[] = [];

    const shotConfigs: Array<{
      type: "wide" | "medium" | "close_up";
      angle: CameraAngle;
      movement: CameraMovement;
      framing: string;
      lens: string;
      motionPresetId: string;
      actionDesc: string;
    }> = [
      {
        type: "wide",
        angle: scene.cameraAngle || "Establishing Shot",
        movement: scene.cameraMovement || "Pan Left",
        framing: "Wide establishing comic panel, showing full setting architecture and character placement",
        lens: "24mm Ultra-Wide Comic Prime",
        motionPresetId: "motion-cam-pan",
        actionDesc: `Establishing shot: ${scene.action}`,
      },
      {
        type: "medium",
        angle: "Medium Shot",
        movement: "Slow Push-in",
        framing: "Medium coverage, waist-up framing capturing character body language and wardrobe",
        lens: "50mm Cinematic Standard Lens",
        motionPresetId: "motion-char-talking",
        actionDesc: `Main interaction: ${scene.action}`,
      },
      {
        type: "close_up",
        angle: "Close-up",
        movement: "Dynamic Zoom",
        framing: "High-contrast close-up focusing intensely on facial expressions and emotional stakes",
        lens: "85mm Portrait Telephoto",
        motionPresetId: "motion-char-reacting",
        actionDesc: `Reaction shot: ${scene.facialExpressions}`,
      },
    ];

    for (let i = 0; i < shotCount; i++) {
      const config = shotConfigs[i % shotConfigs.length];
      const shotNumber = i + 1;
      const motionPreset = MotionLibrary.getInstance().getPresetById(config.motionPresetId);

      // Compile shot prompt integrating character anchors & motion
      const primaryCharName = scene.characters[0] || "Brian Otieno";
      const primaryChar = characters.find((c) => c.name.toLowerCase().includes(primaryCharName.toLowerCase()));

      let charPrompt = `${primaryCharName}: ${primaryChar?.clothing || "urban signature attire"}`;
      if (primaryChar) {
        characterOS.ensureCharacterDNA(primaryChar);
        charPrompt = `[CHARACTER ${primaryChar.name}]: ${primaryChar.appearance}, wearing ${primaryChar.clothing}, exact face geometry`;
      }

      const videoPrompt = `${series.artStyle} comic animation. Location: ${scene.location}. ${charPrompt}. Framing: ${config.framing}, ${config.lens}. Action: ${config.actionDesc}. Motion: ${motionPreset?.promptTokens || "smooth stylized motion"}. High contrast cel-shading, 4K animation shot.`;
      const negativePrompt = "photorealistic, 3d clay render, blurry, distorted anatomy, western superhero distortion, low resolution, multiple heads, deformed hands";

      shots.push({
        id: `shot-${scene.id}-${shotNumber}`,
        sceneId: scene.id,
        episodeId: scene.episodeId,
        shotNumber,
        duration: durationPerShot,
        shotType: config.type,
        cameraAngle: config.angle,
        cameraMovement: config.movement,
        framing: config.framing,
        lens: config.lens,
        characters: scene.characters,
        action: config.actionDesc,
        expression: scene.facialExpressions,
        dialogue: i === 1 && scene.dialogue?.[0] ? scene.dialogue[0].line : undefined,
        environment: scene.location,
        lighting: "Cinematic studio lighting with saturated comic highlights",
        motionPresetId: config.motionPresetId,
        references: primaryChar?.avatarUrl ? [primaryChar.avatarUrl] : [],
        imagePrompt: videoPrompt,
        videoPrompt,
        negativePrompt,
        generationStatus: "pending",
        approvalStatus: "draft",
        version: 1,
      });
    }

    return shots;
  }
}

export const motionLibrary = MotionLibrary.getInstance();
export const aiDirector = AIDirector.getInstance();

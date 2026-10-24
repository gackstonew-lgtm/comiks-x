import { 
  EpisodeRenderSpec, 
  SceneSpec, 
  ProductionMode, 
  validateRenderSpec, 
  createDefaultRenderSpec,
  ValidationResult 
} from "./schema";
import { limitedAnimationDriver, LimitedAnimationDriver } from "./modes/limited-animation";
import { riggedPuppetDriver, RiggedPuppetDriver } from "./modes/rigged-puppet";
import { aiMotionHybridDriver, AIMotionHybridDriver } from "./modes/ai-motion-hybrid";
import { motionComicDriver, MotionComicDriver } from "./modes/motion-comic";

export class ComiksProductionEngine {
  private static instance: ComiksProductionEngine;

  public readonly limitedAnimation: LimitedAnimationDriver = limitedAnimationDriver;
  public readonly riggedPuppet: RiggedPuppetDriver = riggedPuppetDriver;
  public readonly aiHybrid: AIMotionHybridDriver = aiMotionHybridDriver;
  public readonly motionComic: MotionComicDriver = motionComicDriver;

  public static getInstance(): ComiksProductionEngine {
    if (!ComiksProductionEngine.instance) {
      ComiksProductionEngine.instance = new ComiksProductionEngine();
    }
    return ComiksProductionEngine.instance;
  }

  /**
   * Compiles an EpisodeRenderSpec, calculating exact frame offsets and validating integrity.
   */
  public compileEpisodeTimeline(spec: EpisodeRenderSpec): {
    totalFrames: number;
    totalDurationSeconds: number;
    sceneOffsets: Array<{ sceneId: string; startFrame: number; endFrame: number; mode: ProductionMode }>;
  } {
    let currentFrame = 0;
    const sceneOffsets: Array<{ sceneId: string; startFrame: number; endFrame: number; mode: ProductionMode }> = [];

    for (const scene of spec.scenes) {
      const startFrame = currentFrame;
      const endFrame = startFrame + scene.durationFrames;
      sceneOffsets.push({
        sceneId: scene.sceneId,
        startFrame,
        endFrame,
        mode: scene.productionMode,
      });
      currentFrame = endFrame;
    }

    return {
      totalFrames: currentFrame,
      totalDurationSeconds: Math.round((currentFrame / spec.fps) * 100) / 100,
      sceneOffsets,
    };
  }

  /**
   * Validates and normalizes an incoming production spec.
   */
  public validate(spec: unknown): ValidationResult<EpisodeRenderSpec> {
    return validateRenderSpec(spec);
  }

  public createDefaultSpec(params: { episodeId: string; title: string; aspectRatio?: "9:16" | "16:9" }): EpisodeRenderSpec {
    return createDefaultRenderSpec(params);
  }
}

export const productionEngine = ComiksProductionEngine.getInstance();
export * from "./schema";

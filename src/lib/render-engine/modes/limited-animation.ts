import { SceneSpec, SceneCharacterSpec, VisemeShape, DialogueLineSpec } from "../schema";

export interface LimitedAnimationEvaluator {
  /**
   * Quantizes continuous render timeline frames (e.g. 30 fps) into authentic 
   * stepped 2D hand-drawn animation frames (e.g. 12 fps on-twos or 8 fps on-threes).
   */
  getSteppedFrame(currentFrame: number, targetDrawnFps: number, timelineFps: number): number;

  /**
   * Evaluates character pose for current frame, factoring in stepped timing and hold frames.
   */
  evaluatePose(character: SceneCharacterSpec, steppedFrame: number): string;

  /**
   * Calculates eye state: "open" | "blink_anticipate" | "closed" | "blink_recover"
   */
  evaluateEyeState(frame: number, seed: number): "open" | "anticipate" | "closed" | "recover";

  /**
   * Evaluates active mouth viseme shape (A-X) for dialogue audio synchrony.
   */
  evaluateMouthViseme(dialogue: DialogueLineSpec | undefined, currentMs: number): VisemeShape;
}

export class LimitedAnimationDriver implements LimitedAnimationEvaluator {
  /**
   * Quantizes frame to on-twos (step=2 at 24/30fps) or on-threes (step=3).
   */
  public getSteppedFrame(currentFrame: number, targetDrawnFps: number = 12, timelineFps: number = 30): number {
    const stepSize = Math.max(1, Math.round(timelineFps / targetDrawnFps));
    return Math.floor(currentFrame / stepSize) * stepSize;
  }

  public evaluatePose(character: SceneCharacterSpec, steppedFrame: number): string {
    if (!character.poseTimeline || character.poseTimeline.length === 0) {
      return "default";
    }

    // Sort poses by frame ascending
    const sorted = [...character.poseTimeline].sort((a, b) => a.frame - b.frame);
    let activePose = sorted[0].poseId;

    for (const keyframe of sorted) {
      if (steppedFrame >= keyframe.frame) {
        activePose = keyframe.poseId;
      } else {
        break;
      }
    }

    return activePose;
  }

  public evaluateEyeState(frame: number, seed: number = 42): "open" | "anticipate" | "closed" | "recover" {
    // Blinks occur roughly every 90 to 120 frames (3-4 seconds at 30fps)
    const cycleLength = 90 + ((seed * 17) % 35);
    const cyclePhase = (frame + (seed % 50)) % cycleLength;

    // 4-frame blink sequence
    if (cyclePhase === 0) return "anticipate";
    if (cyclePhase === 1 || cyclePhase === 2) return "closed";
    if (cyclePhase === 3) return "recover";
    return "open";
  }

  public evaluateMouthViseme(dialogue: DialogueLineSpec | undefined, currentMs: number): VisemeShape {
    if (!dialogue || !dialogue.visemes || dialogue.visemes.length === 0) {
      return "X"; // Rest / Closed
    }

    if (currentMs < 0 || currentMs > dialogue.durationMs) {
      return "X";
    }

    // Find the latest viseme keyframe before or equal to currentMs
    let activeViseme: VisemeShape = "X";
    for (const v of dialogue.visemes) {
      if (currentMs >= v.timeMs) {
        activeViseme = v.shape;
      } else {
        break;
      }
    }

    return activeViseme;
  }
}

export const limitedAnimationDriver = new LimitedAnimationDriver();

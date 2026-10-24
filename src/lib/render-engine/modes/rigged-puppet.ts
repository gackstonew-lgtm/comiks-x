import { SceneCharacterSpec, VisemeShape } from "../schema";

export interface PuppetJointTransform {
  rotationDeg: number;
  translationX: number;
  translationY: number;
  scaleX: number;
  scaleY: number;
}

export interface PuppetPoseEvaluation {
  torso: PuppetJointTransform;
  head: PuppetJointTransform;
  leftArm: PuppetJointTransform;
  rightArm: PuppetJointTransform;
  mouthViseme: VisemeShape;
  secondaryBounceY: number;
}

export class RiggedPuppetDriver {
  /**
   * Evaluates joint transforms with spring physics secondary motion for comedic snap.
   */
  public evaluatePuppetTransforms(params: {
    character: SceneCharacterSpec;
    frame: number;
    fps: number;
    speakingEnergy?: number; // 0 to 1
    emotion?: "neutral" | "angry" | "surprised" | "laughing";
  }): PuppetPoseEvaluation {
    const { frame, fps, speakingEnergy = 0, emotion = "neutral" } = params;
    const timeSec = frame / fps;

    // Breathing / idle harmonic oscillation (0.8 Hz)
    const breathOffset = Math.sin(timeSec * Math.PI * 1.6) * 2;
    
    // Head tilt and bobbing driven by speech cadence
    const headNod = speakingEnergy > 0 
      ? Math.sin(timeSec * Math.PI * 8) * (4 * speakingEnergy)
      : Math.sin(timeSec * Math.PI * 0.8) * 1.5;

    // Emotion-specific posture tweaks
    let torsoLean = 0;
    let armGesture = 0;
    if (emotion === "angry") {
      torsoLean = -3;
      armGesture = Math.sin(timeSec * 12) * 8;
    } else if (emotion === "surprised") {
      torsoLean = 4;
      armGesture = -12;
    } else if (emotion === "laughing") {
      torsoLean = Math.sin(timeSec * 14) * 4;
    }

    return {
      torso: {
        rotationDeg: torsoLean,
        translationX: 0,
        translationY: breathOffset,
        scaleX: 1,
        scaleY: 1,
      },
      head: {
        rotationDeg: headNod + (torsoLean * 0.5),
        translationX: 0,
        translationY: breathOffset * 0.7,
        scaleX: 1,
        scaleY: 1,
      },
      leftArm: {
        rotationDeg: -armGesture + Math.cos(timeSec * 2) * 2,
        translationX: 0,
        translationY: 0,
        scaleX: 1,
        scaleY: 1,
      },
      rightArm: {
        rotationDeg: armGesture + Math.sin(timeSec * 2) * 2,
        translationX: 0,
        translationY: 0,
        scaleX: 1,
        scaleY: 1,
      },
      mouthViseme: speakingEnergy > 0.3 ? "C" : "X",
      secondaryBounceY: Math.sin(timeSec * 10) * (2 * speakingEnergy),
    };
  }
}

export const riggedPuppetDriver = new RiggedPuppetDriver();

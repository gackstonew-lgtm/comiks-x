export interface AIMotionHybridConfig {
  videoSourceUrl: string;
  nativeFps: number;            // Usually 24 or 30
  targetCelFps: number;         // 12 (on-twos)
  lineArtThreshold: number;     // 0 to 1, strength of edge inking pass
  colorQuantizationLevels: number; // 8 to 16 for retro cel palette
  characterAnchorHex: string;   // Reference character color lock
}

export class AIMotionHybridDriver {
  /**
   * Calculates the exact video timestamp to read to enforce stepped cel-timing.
   * Eliminates the fluid, floaty "AI slime" artifacts by holding frames for (timelineFps / celFps) ticks.
   */
  public calculateQuantizedTimestamp(
    currentTimelineFrame: number, 
    timelineFps: number = 30, 
    celFps: number = 12
  ): number {
    const step = Math.max(1, Math.round(timelineFps / celFps));
    const quantizedFrame = Math.floor(currentTimelineFrame / step) * step;
    return quantizedFrame / timelineFps;
  }

  /**
   * Returns CSS / Canvas filter string to enforce 2D comic look over generative footage.
   */
  public getCelShadingFilter(intensity: number = 0.85): string {
    // High contrast + boosted saturation + slight posterize emulation
    return `contrast(${1 + intensity * 0.4}) saturate(${1 + intensity * 0.3}) brightness(0.98)`;
  }
}

export const aiMotionHybridDriver = new AIMotionHybridDriver();

import { Scene } from "@/types";

export interface CostEstimateSummary {
  totalScenes: number;
  newScenesCount: number;
  cachedScenesCount: number;
  estimatedVideoSeconds: number;
  estimatedVideoCostUsd: number;
  estimatedAudioCostUsd: number;
  totalEstimatedCostUsd: number;
  moneySavedUsd: number;
  activeProvider: string;
}

export class CostManager {
  /**
   * Cost rates per provider per second of video generated (USD)
   */
  private static ratesPerSecond: Record<string, number> = {
    luma: 0.08, // ~$0.80 per 10s
    runway: 0.10, // ~$1.00 per 10s turbo
    kling: 0.07, // ~$0.70 per 10s
    fal: 0.06, // ~$0.60 per 10s minimax/wan
    sora: 0.15, // ~$1.50 per 10s
  };

  /**
   * Calculates cost breakdown for an episode before triggering generation
   */
  public static calculateEpisodeEstimate(scenes: Scene[], activeProvider: string = "luma"): CostEstimateSummary {
    const rate = this.ratesPerSecond[activeProvider] || 0.08;

    let newScenesCount = 0;
    let cachedScenesCount = 0;
    let newVideoSeconds = 0;
    let cachedVideoSeconds = 0;
    let dialogueWords = 0;

    scenes.forEach((scene) => {
      if (scene.status === "completed" || scene.status === "cached") {
        cachedScenesCount++;
        cachedVideoSeconds += scene.duration;
      } else {
        newScenesCount++;
        newVideoSeconds += scene.duration;
      }

      if (scene.dialogue && scene.dialogue.length > 0) {
        scene.dialogue.forEach((d) => {
          dialogueWords += d.line.split(/\s+/).length;
        });
      }
    });

    const estimatedVideoCostUsd = Math.round(newVideoSeconds * rate * 100) / 100;
    const moneySavedUsd = Math.round(cachedVideoSeconds * rate * 100) / 100;
    const estimatedAudioCostUsd = Math.round((dialogueWords * 0.0003) * 100) / 100; // ~$0.30 per 1,000 words
    const totalEstimatedCostUsd = Math.round((estimatedVideoCostUsd + estimatedAudioCostUsd) * 100) / 100;

    return {
      totalScenes: scenes.length,
      newScenesCount,
      cachedScenesCount,
      estimatedVideoSeconds: newVideoSeconds,
      estimatedVideoCostUsd,
      estimatedAudioCostUsd,
      totalEstimatedCostUsd,
      moneySavedUsd,
      activeProvider,
    };
  }
}

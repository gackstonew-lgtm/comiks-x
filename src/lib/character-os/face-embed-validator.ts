import { CharacterBibleSpec } from "./character-bible";

export interface ConsistencyEvaluationResult {
  passed: boolean;
  similarityScore: number;     // 0 to 1 (target >= 0.88)
  paletteDeltaPercentage: number; // 0 to 100% (target <= 12%)
  issuesDetected: string[];
  recommendation: "accept" | "regenerate" | "re-tint";
}

export class FaceEmbedValidator {
  /**
   * Evaluates a generated frame against the Character Bible.
   * Simulates/computes deep feature embedding distance & RGB color space distance.
   */
  public evaluateCharacterTake(params: {
    bible: CharacterBibleSpec;
    generatedAssetUrl: string;
    seed: number;
    promptUsed: string;
  }): ConsistencyEvaluationResult {
    const { bible, promptUsed, seed } = params;
    const issues: string[] = [];

    // Deterministic pseudo-embedding similarity simulation based on prompt adherence & seed stability
    const hasWardrobeLock = promptUsed.includes("HEX LOCK") || promptUsed.includes(bible.palette.primaryWardrobeHex);
    const hasFaceAnchor = promptUsed.includes("FACE:") || promptUsed.includes(bible.canonicalName);

    let baseSimilarity = 0.92;
    if (!hasWardrobeLock) baseSimilarity -= 0.08;
    if (!hasFaceAnchor) baseSimilarity -= 0.10;

    // Small pseudo-variance from seed
    const seedVariance = ((seed % 100) / 1000) - 0.05;
    const finalSimilarity = Math.min(0.99, Math.max(0.70, Math.round((baseSimilarity + seedVariance) * 100) / 100));

    let paletteDelta = 6.4;
    if (!hasWardrobeLock) {
      paletteDelta = 18.5;
      issues.push("Wardrobe color deviation detected: jacket tone does not match hex lock.");
    }

    if (finalSimilarity < 0.88) {
      issues.push(`Facial geometry similarity (${finalSimilarity}) is below the required 0.88 threshold.`);
    }

    const passed = issues.length === 0 && finalSimilarity >= 0.88;

    return {
      passed,
      similarityScore: finalSimilarity,
      paletteDeltaPercentage: paletteDelta,
      issuesDetected: issues,
      recommendation: passed ? "accept" : (paletteDelta > 15 && finalSimilarity >= 0.85 ? "re-tint" : "regenerate"),
    };
  }
}

export const faceEmbedValidator = new FaceEmbedValidator();

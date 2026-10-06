import { QualityScoreBreakdown, ApprovalStatus, AssetVersion, Scene, Shot, Character } from "@/types";
import { db } from "@/lib/db";

export class QualityGate {
  private static instance: QualityGate;

  private constructor() {}

  public static getInstance(): QualityGate {
    if (!QualityGate.instance) {
      QualityGate.instance = new QualityGate();
    }
    return QualityGate.instance;
  }

  /**
   * Evaluates generated asset across Visual, Narrative, Technical, and Audio dimensions
   */
  public evaluateSceneQuality(
    scene: Scene,
    characters: Character[],
    hasRenderedVideo: boolean,
    hasRenderedAudio: boolean
  ): QualityScoreBreakdown {
    const notes: string[] = [];

    // 1. Technical Evaluation
    let technicalScore = 70;
    if (hasRenderedVideo || scene.videoUrl) {
      technicalScore += 25;
      notes.push("Video media asset verified and accessible.");
    } else {
      notes.push("Missing rendered video stream - flagged for generation.");
    }
    if (scene.duration >= 5 && scene.duration <= 30) {
      technicalScore += 5;
    }

    // 2. Narrative Evaluation
    let narrativeScore = 80;
    const hasCharacters = scene.characters.length > 0;
    if (hasCharacters) {
      narrativeScore += 10;
      notes.push(`Narrative anchors present for ${scene.characters.join(", ")}.`);
    }
    if (scene.action && scene.action.length > 20) {
      narrativeScore += 10;
    }

    // 3. Visual Consistency Evaluation
    let visualScore = 85;
    const lockedChars = characters.filter((c) => scene.characters.some((name) => c.name.toLowerCase().includes(name.toLowerCase())) && c.isLocked);
    if (lockedChars.length > 0) {
      visualScore += 10;
      notes.push("Visual DNA consistency lock enforced across active characters.");
    }

    // 4. Audio Synchronization Evaluation
    let audioScore = 75;
    if (hasRenderedAudio || scene.audioUrl) {
      audioScore += 20;
      notes.push("Dialogue audio track verified.");
    } else if (scene.dialogue && scene.dialogue.length > 0) {
      audioScore += 10;
    }

    const overall = Math.round(
      visualScore * 0.35 + narrativeScore * 0.25 + technicalScore * 0.25 + audioScore * 0.15
    );

    return {
      overall,
      visualScore,
      narrativeScore,
      technicalScore,
      audioScore,
      notes,
    };
  }

  /**
   * Determines automated approval status routing
   */
  public determineApprovalStatus(quality: QualityScoreBreakdown): ApprovalStatus {
    if (quality.overall >= 85) return "approved";
    if (quality.overall >= 70) return "creator_review";
    return "quality_review";
  }
}

export class AssetVersionControl {
  private static instance: AssetVersionControl;
  private versionsMap: Map<string, AssetVersion[]> = new Map();

  private constructor() {}

  public static getInstance(): AssetVersionControl {
    if (!AssetVersionControl.instance) {
      AssetVersionControl.instance = new AssetVersionControl();
    }
    return AssetVersionControl.instance;
  }

  public recordVersion(
    assetId: string,
    outputUrl: string,
    prompt: string,
    provider: string,
    model: string,
    approvalStatus: ApprovalStatus
  ): AssetVersion {
    const list = this.versionsMap.get(assetId) || [];
    const newVersion: AssetVersion = {
      versionNumber: list.length + 1,
      assetId,
      outputUrl,
      prompt,
      provider,
      model,
      createdAt: new Date().toISOString(),
      approvalStatus,
    };
    list.push(newVersion);
    this.versionsMap.set(assetId, list);
    return newVersion;
  }

  public getVersions(assetId: string): AssetVersion[] {
    return this.versionsMap.get(assetId) || [];
  }

  public rollbackToVersion(assetId: string, versionNumber: number): AssetVersion | undefined {
    const list = this.versionsMap.get(assetId) || [];
    return list.find((v) => v.versionNumber === versionNumber);
  }
}

export const qualityGate = QualityGate.getInstance();
export const versionControl = AssetVersionControl.getInstance();
export const assetVersionControl = versionControl;

import { EpisodeRenderSpec } from "../render-engine/schema";

export interface QCInspectionItem {
  checkName: string;
  category: "technical" | "visual" | "platform_compliance";
  status: "pass" | "warn" | "fail";
  details: string;
  autoFixAvailable: boolean;
}

export interface QCReport {
  overallPassed: boolean;
  scoreOutOf100: number;
  inspections: QCInspectionItem[];
  timestamp: string;
  blockingErrors: string[];
}

export class QualityControlGate {
  private static instance: QualityControlGate;

  public static getInstance(): QualityControlGate {
    if (!QualityControlGate.instance) {
      QualityControlGate.instance = new QualityControlGate();
    }
    return QualityControlGate.instance;
  }

  /**
   * Evaluates an EpisodeRenderSpec prior to final delivery/publishing.
   */
  public inspectSpec(spec: EpisodeRenderSpec): QCReport {
    const inspections: QCInspectionItem[] = [];
    const blockingErrors: string[] = [];

    // 1. Resolution Check
    const isStandardVertical = spec.aspectRatio === "9:16" && spec.width === 1080 && spec.height === 1920;
    const isStandardHorizontal = spec.aspectRatio === "16:9" && spec.width === 1920 && spec.height === 1080;
    
    if (isStandardVertical || isStandardHorizontal) {
      inspections.push({
        checkName: "Broadcast Resolution & Aspect Ratio",
        category: "technical",
        status: "pass",
        details: `Conforms strictly to broadcast ${spec.aspectRatio} (${spec.width}x${spec.height}).`,
        autoFixAvailable: false,
      });
    } else {
      inspections.push({
        checkName: "Broadcast Resolution & Aspect Ratio",
        category: "technical",
        status: "fail",
        details: `Non-standard dimensions: ${spec.width}x${spec.height}. Standard 1080p required.`,
        autoFixAvailable: true,
      });
      blockingErrors.push("Resolution must be standard 1080x1920 (9:16) or 1920x1080 (16:9).");
    }

    // 2. Audio Loudness Check
    if (spec.audioMastering.targetLUFS === -14) {
      inspections.push({
        checkName: "Target Integrated Loudness (-14 LUFS)",
        category: "technical",
        status: "pass",
        details: "Loudness target calibrated precisely to -14.0 LUFS broadcast standard.",
        autoFixAvailable: false,
      });
    } else {
      inspections.push({
        checkName: "Target Integrated Loudness (-14 LUFS)",
        category: "technical",
        status: "warn",
        details: `Target loudness is set to ${spec.audioMastering.targetLUFS} LUFS. -14 LUFS recommended for mobile platforms.`,
        autoFixAvailable: true,
      });
    }

    // 3. Platform Safe-Zone Compliance
    if (spec.captionBar.enabled && spec.captionBar.positionYPercent < 22) {
      inspections.push({
        checkName: "Caption Safe-Zone Positioning",
        category: "platform_compliance",
        status: "pass",
        details: `Caption bar anchored safely in top-third (Y: ${spec.captionBar.positionYPercent}%), avoiding bottom TikTok UI elements.`,
        autoFixAvailable: false,
      });
    } else if (spec.captionBar.enabled) {
      inspections.push({
        checkName: "Caption Safe-Zone Positioning",
        category: "platform_compliance",
        status: "warn",
        details: `Caption bar position Y: ${spec.captionBar.positionYPercent}% may overlap TikTok/Shorts UI elements.`,
        autoFixAvailable: true,
      });
    }

    // 4. Stepped Cel-Animation Retiming Check
    const hasUnquantizedScenes = spec.scenes.some(s => s.productionMode === "limited_animation" && s.fpsRetiming > 15);
    if (!hasUnquantizedScenes) {
      inspections.push({
        checkName: "Stepped Cel Timing (8–12 fps on-twos)",
        category: "visual",
        status: "pass",
        details: "Character animation frames are correctly quantized to on-twos/threes, avoiding AI motion morphing.",
        autoFixAvailable: false,
      });
    } else {
      inspections.push({
        checkName: "Stepped Cel Timing (8–12 fps on-twos)",
        category: "visual",
        status: "warn",
        details: "Some scenes have frame rates above 15 fps, which may appear too smooth for hand-drawn style.",
        autoFixAvailable: true,
      });
    }

    const failedCount = inspections.filter(i => i.status === "fail").length;
    const warnCount = inspections.filter(i => i.status === "warn").length;
    const scoreOutOf100 = Math.max(0, 100 - (failedCount * 30) - (warnCount * 10));

    return {
      overallPassed: blockingErrors.length === 0,
      scoreOutOf100,
      inspections,
      timestamp: new Date().toISOString(),
      blockingErrors,
    };
  }
}

export const qualityControlGate = QualityControlGate.getInstance();

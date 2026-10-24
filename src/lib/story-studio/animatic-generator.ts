import { EpisodeRenderSpec, SceneSpec } from "../render-engine/schema";
import { StoryBeat } from "./beat-generator";

export class AnimaticGenerator {
  /**
   * Generates a fully playable EpisodeRenderSpec from high-level story beats.
   */
  public buildAnimaticSpec(params: {
    episodeId: string;
    title: string;
    beats: StoryBeat[];
    leadCharacterId: string;
    leadCharacterName: string;
    aspectRatio?: "9:16" | "16:9";
  }): EpisodeRenderSpec {
    const isVertical = (params.aspectRatio || "9:16") === "9:16";
    const fps = 30;

    const scenes: SceneSpec[] = params.beats.map((beat, idx) => {
      const durationFrames = Math.round(beat.suggestedDurationSeconds * fps);

      return {
        sceneId: `scene_${params.episodeId}_${idx + 1}`,
        sceneIndex: idx,
        title: `${beat.name}: ${beat.description.substring(0, 30)}...`,
        durationFrames,
        productionMode: "limited_animation",
        fpsRetiming: 12, // On-twos for character animation
        background: {
          plateUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1080&auto=format&fit=crop",
          parallaxDepth: 0.15,
        },
        characters: [
          {
            characterId: params.leadCharacterId,
            name: params.leadCharacterName,
            xPercent: 50,
            yPercent: 65,
            scale: 1.0,
            poseTimeline: [
              { frame: 0, poseId: idx === 0 ? "shocked_awake" : "exasperated" },
              { frame: Math.round(durationFrames * 0.5), poseId: "speaking_punchline" },
            ],
          },
        ],
        dialogues: [
          {
            id: `dlg_${idx + 1}`,
            characterId: params.leadCharacterId,
            text: idx === 0 
              ? "Buda! Hawa walianza maombi saa kumi na moja asubuhi?!" 
              : "Hata alarm yangu haijawahi kuwa loud hivi!",
            language: "sheng",
            durationMs: Math.round(beat.suggestedDurationSeconds * 1000 * 0.8),
            wordTimestamps: [
              { word: "Buda!", startMs: 0, endMs: 400, emphasis: true },
              { word: "Hawa", startMs: 400, endMs: 800 },
              { word: "walianza", startMs: 800, endMs: 1300 },
              { word: "maombi", startMs: 1300, endMs: 1800 },
              { word: "saa", startMs: 1800, endMs: 2100 },
              { word: "kumi", startMs: 2100, endMs: 2500, emphasis: true },
            ],
            visemes: [
              { timeMs: 0, shape: "B" },
              { timeMs: 200, shape: "D" },
              { timeMs: 400, shape: "C" },
              { timeMs: 800, shape: "A" },
              { timeMs: 1200, shape: "E" },
              { timeMs: 1600, shape: "X" },
            ],
          },
        ],
        vfx: idx === 0 ? [
          {
            id: `vfx_shock_${idx}`,
            type: "speed_lines",
            startFrame: 0,
            durationFrames: 15,
            intensity: 0.9,
          },
          {
            id: `vfx_amen_${idx}`,
            type: "sound_burst",
            startFrame: 5,
            durationFrames: 25,
            text: "⛪ AMEN!!",
            xPercent: 70,
            yPercent: 30,
          },
        ] : [],
        camera: [
          { frame: 0, x: 0, y: 0, zoom: 1.0, rotationDeg: 0, shakeIntensity: idx === 0 ? 6 : 0 },
          { frame: 10, x: 0, y: 0, zoom: 1.05, rotationDeg: 0, shakeIntensity: 0 },
        ],
      };
    });

    return {
      specVersion: "1.0.0",
      episodeId: params.episodeId,
      title: params.title,
      aspectRatio: isVertical ? "9:16" : "16:9",
      width: isVertical ? 1080 : 1920,
      height: isVertical ? 1920 : 1080,
      fps,
      seed: 12345,
      captionBar: {
        enabled: true,
        headlineText: params.title,
        positionYPercent: isVertical ? 9 : 6,
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        textColor: "#111827",
        highlightColor: "#10B981",
        fontFamily: "Cabinet Grotesk, Inter, sans-serif",
        fontWeight: "900",
        karaokeMode: true,
      },
      scenes,
      audioMastering: {
        targetLUFS: -14,
        musicBedVolume: 0.12,
        duckingDb: -18,
        stemOutputs: true,
      },
    };
  }
}

export const animaticGenerator = new AnimaticGenerator();

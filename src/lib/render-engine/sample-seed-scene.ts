import { EpisodeRenderSpec } from "./schema";

/**
 * 10-Second North Star Sample Reference Deliverable
 * "That one church close to your house ⛪😂"
 * Total Duration: 300 frames @ 30fps = 10.0 seconds
 */
export const SAMPLE_CHURCH_SEED_SPEC_LIMITED: EpisodeRenderSpec = {
  specVersion: "1.0.0",
  episodeId: "ep-sample-church-limited",
  title: "That one church close to your house ⛪😂",
  aspectRatio: "9:16",
  width: 1080,
  height: 1920,
  fps: 30,
  seed: 987654,
  captionBar: {
    enabled: true,
    headlineText: "That one church close to your house ⛪😂",
    positionYPercent: 9,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    textColor: "#111827",
    highlightColor: "#10B981", // Supabase brand green
    fontFamily: "Cabinet Grotesk, Inter, sans-serif",
    fontWeight: "900",
    karaokeMode: true,
  },
  scenes: [
    // Scene 1: 0.0s - 3.0s (90 frames) - The Sudden Wake-up Shock
    {
      sceneId: "scene_church_01",
      sceneIndex: 0,
      title: "Sudden Wake-up Shock",
      durationFrames: 90,
      productionMode: "limited_animation",
      fpsRetiming: 12, // 12 drawn fps on-twos
      background: {
        plateUrl: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?w=1080&auto=format&fit=crop",
        parallaxDepth: 0.1,
      },
      characters: [
        {
          characterId: "char_brayo",
          name: "Brayo",
          xPercent: 50,
          yPercent: 65,
          scale: 1.05,
          poseTimeline: [
            { frame: 0, poseId: "sleeping_peaceful" },
            { frame: 12, poseId: "eyes_wide_shock" },
            { frame: 36, poseId: "pillow_over_head" },
          ],
        },
      ],
      dialogues: [
        {
          id: "dlg_amen_burst",
          characterId: "char_preacher",
          text: "HALLELUYAH!! Bwana asifiwe kanisa!!",
          language: "sw",
          durationMs: 2500,
          wordTimestamps: [
            { word: "HALLELUYAH!!", startMs: 0, endMs: 800, emphasis: true },
            { word: "Bwana", startMs: 800, endMs: 1300 },
            { word: "asifiwe", startMs: 1300, endMs: 1900 },
            { word: "kanisa!!", startMs: 1900, endMs: 2500, emphasis: true },
          ],
          visemes: [
            { timeMs: 0, shape: "C" },
            { timeMs: 300, shape: "D" },
            { timeMs: 800, shape: "A" },
            { timeMs: 1400, shape: "E" },
            { timeMs: 2000, shape: "C" },
            { timeMs: 2500, shape: "X" },
          ],
        },
      ],
      vfx: [
        {
          id: "vfx_speed_shock",
          type: "speed_lines",
          startFrame: 10,
          durationFrames: 24,
          intensity: 0.95,
        },
        {
          id: "vfx_burst_hallelujah",
          type: "sound_burst",
          startFrame: 8,
          durationFrames: 35,
          text: "📢 HALLELUYAH!!",
          xPercent: 65,
          yPercent: 32,
        },
        {
          id: "vfx_impact_flash",
          type: "impact_frame",
          startFrame: 12,
          durationFrames: 2,
        },
      ],
      camera: [
        { frame: 0, x: 0, y: 0, zoom: 1.0, rotationDeg: 0, shakeIntensity: 0 },
        { frame: 12, x: 0, y: 0, zoom: 1.15, rotationDeg: 0, shakeIntensity: 8 },
        { frame: 35, x: 0, y: 0, zoom: 1.08, rotationDeg: 0, shakeIntensity: 2 },
      ],
    },

    // Scene 2: 3.0s - 6.5s (105 frames) - The Megaphone Tower
    {
      sceneId: "scene_church_02",
      sceneIndex: 1,
      title: "Megaphone Speaker Blasting",
      durationFrames: 105,
      productionMode: "limited_animation",
      fpsRetiming: 12,
      background: {
        plateUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1080&auto=format&fit=crop",
        parallaxDepth: 0.25,
      },
      characters: [
        {
          characterId: "char_preacher",
          name: "Pastor Mutua",
          xPercent: 50,
          yPercent: 60,
          scale: 1.1,
          poseTimeline: [
            { frame: 0, poseId: "screaming_into_mic" },
            { frame: 45, poseId: "jumping_with_bible" },
          ],
        },
      ],
      dialogues: [
        {
          id: "dlg_speaker_blast",
          characterId: "char_preacher",
          text: "TUSHANGILIE BWANA KWA VIGELEGELE!!",
          language: "sw",
          durationMs: 3000,
          wordTimestamps: [
            { word: "TUSHANGILIE", startMs: 0, endMs: 800, emphasis: true },
            { word: "BWANA", startMs: 800, endMs: 1400 },
            { word: "KWA", startMs: 1400, endMs: 1800 },
            { word: "VIGELEGELE!!", startMs: 1800, endMs: 3000, emphasis: true },
          ],
          visemes: [
            { timeMs: 0, shape: "D" },
            { timeMs: 500, shape: "C" },
            { timeMs: 1000, shape: "A" },
            { timeMs: 1800, shape: "E" },
            { timeMs: 2500, shape: "D" },
            { timeMs: 3000, shape: "X" },
          ],
        },
      ],
      vfx: [
        {
          id: "vfx_burst_vigelegele",
          type: "sound_burst",
          startFrame: 5,
          durationFrames: 40,
          text: "🔊🔊 TIII!!",
          xPercent: 50,
          yPercent: 28,
        },
        {
          id: "vfx_speed_preach",
          type: "speed_lines",
          startFrame: 20,
          durationFrames: 50,
          intensity: 0.85,
        },
      ],
      camera: [
        { frame: 0, x: -10, y: 0, zoom: 1.05, rotationDeg: 2, shakeIntensity: 5 },
        { frame: 50, x: 10, y: 0, zoom: 1.12, rotationDeg: -2, shakeIntensity: 7 },
      ],
    },

    // Scene 3: 6.5s - 10.0s (105 frames) - Brayo's Sheng Reaction Punchline
    {
      sceneId: "scene_church_03",
      sceneIndex: 2,
      title: "Brayo's Reaction Punchline",
      durationFrames: 105,
      productionMode: "limited_animation",
      fpsRetiming: 12,
      background: {
        plateUrl: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?w=1080&auto=format&fit=crop",
      },
      characters: [
        {
          characterId: "char_brayo",
          name: "Brayo",
          xPercent: 50,
          yPercent: 65,
          scale: 1.1,
          poseTimeline: [
            { frame: 0, poseId: "exasperated_facepalm" },
            { frame: 30, poseId: "talking_to_camera" },
          ],
        },
      ],
      dialogues: [
        {
          id: "dlg_brayo_sheng",
          characterId: "char_brayo",
          text: "Buda! Hawa walianza maombi saa kumi na moja asubuhi?!",
          language: "sheng",
          durationMs: 3200,
          wordTimestamps: [
            { word: "Buda!", startMs: 0, endMs: 500, emphasis: true },
            { word: "Hawa", startMs: 500, endMs: 900 },
            { word: "walianza", startMs: 900, endMs: 1500 },
            { word: "maombi", startMs: 1500, endMs: 2000 },
            { word: "saa", startMs: 2000, endMs: 2300 },
            { word: "kumi", startMs: 2300, endMs: 2700, emphasis: true },
            { word: "na", startMs: 2700, endMs: 2900 },
            { word: "moja", startMs: 2900, endMs: 3200, emphasis: true },
          ],
          visemes: [
            { timeMs: 0, shape: "A" },
            { timeMs: 250, shape: "D" },
            { timeMs: 700, shape: "B" },
            { timeMs: 1200, shape: "C" },
            { timeMs: 1800, shape: "A" },
            { timeMs: 2400, shape: "E" },
            { timeMs: 3200, shape: "X" },
          ],
        },
      ],
      vfx: [
        {
          id: "vfx_burst_buda",
          type: "sound_burst",
          startFrame: 0,
          durationFrames: 30,
          text: "🤦‍♂️ MANZE!!",
          xPercent: 75,
          yPercent: 35,
        },
      ],
      camera: [
        { frame: 0, x: 0, y: 0, zoom: 1.15, rotationDeg: 0, shakeIntensity: 1 },
        { frame: 40, x: 0, y: 0, zoom: 1.25, rotationDeg: 0, shakeIntensity: 0 },
      ],
    },
  ],
  audioMastering: {
    targetLUFS: -14,
    musicBedVolume: 0.12,
    duckingDb: -18,
    stemOutputs: true,
  },
};

/**
 * Variant in Rigged Puppet mode
 */
export const SAMPLE_CHURCH_SEED_SPEC_PUPPET: EpisodeRenderSpec = {
  ...SAMPLE_CHURCH_SEED_SPEC_LIMITED,
  episodeId: "ep-sample-church-puppet",
  scenes: SAMPLE_CHURCH_SEED_SPEC_LIMITED.scenes.map(s => ({
    ...s,
    productionMode: "rigged_puppet",
  })),
};

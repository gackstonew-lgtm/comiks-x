import {
  Episode,
  Scene,
  SocialClip,
  RetentionScores,
  HookVariant,
  DerivativesBundle,
} from "@/types";
import { SocialClipExtractor } from "@/lib/clips";

export class RetentionEngine {
  private static instance: RetentionEngine;

  private constructor() {}

  public static getInstance(): RetentionEngine {
    if (!RetentionEngine.instance) {
      RetentionEngine.instance = new RetentionEngine();
    }
    return RetentionEngine.instance;
  }

  /**
   * Calculates viral retention scores for a scene or clip
   */
  public evaluateRetention(scene: Scene, clipDurationSeconds: number): RetentionScores {
    const isActionPacked = scene.action.toLowerCase().includes("sprint") || scene.action.toLowerCase().includes("matatu");
    const hasPunchyDialogue = (scene.dialogue?.length || 0) >= 2;

    const hookScore = isActionPacked ? 94 : 86;
    const retentionScore = clipDurationSeconds <= 30 ? 91 : clipDurationSeconds <= 60 ? 84 : 76;
    const emotionalImpact = hasPunchyDialogue ? 88 : 80;
    const storyClarity = 85;
    const visualImpact = scene.location.includes("Matatu") ? 95 : 88;
    const characterAppeal = 92;
    const loopPotential = 87;

    return {
      hookScore,
      retentionScore,
      emotionalImpact,
      storyClarity,
      visualImpact,
      characterAppeal,
      loopPotential,
    };
  }

  /**
   * Generates 4 diverse hook variants for creator selection
   */
  public generateHookVariants(scene: Scene): HookVariant[] {
    const charName = scene.characters[0] || "Brian";
    return [
      {
        id: "hook-curiosity",
        type: "curiosity",
        hookText: `POV: You have 15 minutes before your tech startup dies in Nairobi... 👀`,
        suggestedDurationSeconds: 30,
      },
      {
        id: "hook-conflict",
        type: "conflict",
        hookText: `Never let your comedic best friend choose the route to a multimillion pitch! 😭💀`,
        suggestedDurationSeconds: 45,
      },
      {
        id: "hook-emotional",
        type: "emotional",
        hookText: `3 years of coding on the line, and your battery is at 4%... 🔋⚠️`,
        suggestedDurationSeconds: 15,
      },
      {
        id: "hook-shock",
        type: "shock",
        hookText: `Wait for the ending... Nairobi traffic took matters into its own hands! 🔥`,
        suggestedDurationSeconds: 60,
      },
    ];
  }
}

export class DerivativesGenerator {
  private static instance: DerivativesGenerator;

  private constructor() {}

  public static getInstance(): DerivativesGenerator {
    if (!DerivativesGenerator.instance) {
      DerivativesGenerator.instance = new DerivativesGenerator();
    }
    return DerivativesGenerator.instance;
  }

  /**
   * One Story -> Many Derivatives: transforms finished episode into full content bundle
   */
  public generateDerivativesBundle(episode: Episode): DerivativesBundle {
    const shortVideos = SocialClipExtractor.extractViralClips({
      episode,
      preferredDurations: [15, 30, 45, 60, 90],
    });

    const characterClips = (episode.charactersInvolved || ["Brian Otieno", "Kevin Mwangi", "Mary Wanjiku"]).map((name) => ({
      characterName: name,
      title: `${name} Best Moments | Episode ${episode.episodeNumber}`,
      videoUrl: episode.scenes[0]?.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-african-man-working-on-his-laptop-at-home-41857-large.mp4",
    }));

    const quoteCards = [
      {
        quote: "Nairobi traffic haina huruma mbele ya pitch ya millions!",
        speaker: "Kevin 'Kevo' Mwangi",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
      },
      {
        quote: "Just one more compile and the future is ours.",
        speaker: "Brian Otieno",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
      },
      {
        quote: "Be in Kilimani by 2 PM sharp, or we forfeit the term sheet.",
        speaker: "Mary Wanjiku",
        imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop",
      },
    ];

    const comicPanels = episode.scenes.slice(0, 3).map((s, idx) => ({
      panelNumber: idx + 1,
      sceneNumber: s.sceneNumber,
      panelUrl: s.thumbnailUrl || "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop",
    }));

    const storyPosts = [
      {
        title: "Would you trust a Nairobi Nganya before a pitch?",
        caption: "Drop your craziest matatu delay stories in the comments! 👇 #ComiksX",
        coverUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&auto=format&fit=crop",
      },
      {
        title: "Did Brian make it in time?",
        caption: "Stream Episode 1 full 30-min episode on YouTube & TikTok link in bio! 🔥",
        coverUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
      },
    ];

    return {
      episodeId: episode.id,
      fullEpisodeUrl: episode.videoUrl,
      shortVideos,
      characterClips,
      quoteCards,
      comicPanels,
      storyPosts,
      thumbnails: [],
      trailerUrl: episode.scenes[0]?.videoUrl,
      recapUrl: episode.scenes[1]?.videoUrl,
    };
  }
}

export const retentionEngine = RetentionEngine.getInstance();
export const derivativesGenerator = DerivativesGenerator.getInstance();

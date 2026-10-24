import { EpisodeRenderSpec } from "../render-engine/schema";

export interface SocialPublishingPack {
  episodeId: string;
  title: string;
  captionText: string;
  hashtags: string[];
  formats: Array<{
    platform: "TikTok" | "Instagram Reels" | "YouTube Shorts" | "YouTube Horizontal";
    aspectRatio: "9:16" | "16:9";
    recommendedBitrateMbps: number;
    targetDurationSeconds: number;
  }>;
  audioStems: {
    dialogueStemUrl: string;
    musicBedStemUrl: string;
    soundEffectsStemUrl: string;
    loudnessLufs: number;
  };
  srtUrl: string;
  vttUrl: string;
  suggestedPostingTimesEAT: string[]; // East Africa Time
}

export class PublishingPackGenerator {
  /**
   * Builds an export pack optimized for organic viral reach across vertical video platforms.
   */
  public generatePack(spec: EpisodeRenderSpec): SocialPublishingPack {
    const totalFrames = spec.scenes.reduce((acc, s) => acc + s.durationFrames, 0);
    const durationSec = Math.round((totalFrames / spec.fps) * 10) / 10;

    return {
      episodeId: spec.episodeId,
      title: spec.title,
      captionText: `${spec.captionBar.headlineText}\n\nTag someone who relates to this 😂👇`,
      hashtags: [
        "#nairobitiktok",
        "#kenyancomedy",
        "#animation",
        "#flipaclip",
        "#2danimation",
        "#sheng",
        "#comedyvideo",
        "#viralreels",
      ],
      formats: [
        {
          platform: "TikTok",
          aspectRatio: "9:16",
          recommendedBitrateMbps: 8,
          targetDurationSeconds: durationSec,
        },
        {
          platform: "Instagram Reels",
          aspectRatio: "9:16",
          recommendedBitrateMbps: 8,
          targetDurationSeconds: durationSec,
        },
        {
          platform: "YouTube Shorts",
          aspectRatio: "9:16",
          recommendedBitrateMbps: 12,
          targetDurationSeconds: durationSec,
        },
        {
          platform: "YouTube Horizontal",
          aspectRatio: "16:9",
          recommendedBitrateMbps: 16,
          targetDurationSeconds: durationSec,
        },
      ],
      audioStems: {
        dialogueStemUrl: `/exports/stems/${spec.episodeId}/dialogue.wav`,
        musicBedStemUrl: `/exports/stems/${spec.episodeId}/music.wav`,
        soundEffectsStemUrl: `/exports/stems/${spec.episodeId}/sfx.wav`,
        loudnessLufs: spec.audioMastering.targetLUFS,
      },
      srtUrl: `/exports/subtitles/${spec.episodeId}.srt`,
      vttUrl: `/exports/subtitles/${spec.episodeId}.vtt`,
      suggestedPostingTimesEAT: ["12:30 PM", "6:15 PM", "8:45 PM"],
    };
  }
}

export const publishingPackGenerator = new PublishingPackGenerator();

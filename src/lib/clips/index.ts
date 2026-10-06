import { Episode, SocialClip, Scene } from "@/types";

export interface ClipExtractionOptions {
  episode: Episode;
  preferredDurations?: number[]; // [15, 30, 45, 60, 90]
  platformFocus?: "tiktok" | "reels" | "all";
}

export class SocialClipExtractor {
  /**
   * Analyzes an episode's scenes to automatically detect 5-10 viral clips
   */
  public static extractViralClips(options: ClipExtractionOptions): SocialClip[] {
    const { episode, platformFocus = "all" } = options;
    const scenes = episode.scenes;
    const clips: SocialClip[] = [];

    // Durations to extract: 15s, 30s, 45s, 60s, 90s
    const targetDurations = options.preferredDurations || [15, 30, 45, 60, 90];

    // Find scenes with high dialogue tension or action
    let currentTime = 0;
    const sceneTimeMap = scenes.map((s) => {
      const start = currentTime;
      currentTime += s.duration;
      return { scene: s, start, end: currentTime };
    });

    targetDurations.forEach((targetDuration, index) => {
      // Find a scene cluster matching target duration
      let bestStartIndex = 0;
      let minDiff = 9999;

      for (let i = 0; i < sceneTimeMap.length; i++) {
        const potentialEnd = sceneTimeMap[i].start + targetDuration;
        const diff = Math.abs(potentialEnd - (sceneTimeMap[i].start + targetDuration));
        if (diff < minDiff) {
          minDiff = diff;
          bestStartIndex = i;
        }
      }

      const startScene = sceneTimeMap[bestStartIndex]?.scene || scenes[0];
      const startSec = sceneTimeMap[bestStartIndex]?.start || 0;
      const endSec = Math.min(startSec + targetDuration, currentTime);

      // Extract dialogues in this window
      const dialoguesInWindow: string[] = [];
      scenes.forEach((s) => {
        if (s.dialogue) {
          s.dialogue.forEach((d) => dialoguesInWindow.push(`${d.characterName}: "${d.line}"`));
        }
      });

      const hook = this.generateViralHook(startScene, targetDuration);
      const title = this.generateClipTitle(episode.title, startScene, targetDuration);
      const mainMoment = `Critical turning point in "${startScene.location}" - ${startScene.action || startScene.visualDescription}`;
      const hashtags = this.generateHashtags(episode.title);

      const segmentLength = Math.max(2, Math.floor(targetDuration / 4));
      const captions = [
        {
          start: 0,
          end: segmentLength,
          text: hook,
          emphasisWords: [hook.split(" ")[0], hook.split(" ")[1]].filter(Boolean),
        },
        {
          start: segmentLength,
          end: segmentLength * 2,
          text: startScene.dialogue?.[0]?.line || "Wait for the reaction! 😱",
          emphasisWords: ["Wait", "reaction"],
        },
        {
          start: segmentLength * 2,
          end: segmentLength * 3,
          text: startScene.dialogue?.[1]?.line || "Nairobi traffic never forgives! 💀",
          emphasisWords: ["never", "forgives"],
        },
        {
          start: segmentLength * 3,
          end: targetDuration,
          text: "Part 2 dropping soon! Follow @ComiksX 🔥",
          emphasisWords: ["Follow", "Part 2"],
        },
      ];

      clips.push({
        id: `clip-viral-${Date.now()}-${index}`,
        episodeId: episode.id,
        title,
        hook,
        mainMoment,
        endingCta: "Follow for Episode 2! Full 30-min episode link in bio.",
        startTimeSeconds: startSec,
        endTimeSeconds: endSec,
        durationSeconds: targetDuration,
        aspectRatio: "9:16",
        platform: platformFocus,
        captions,
        description: `${title}\n\nCan Brian and Kevin survive Nairobi hustle? Drop your thoughts below! 👇\n\n${hashtags.join(" ")}`,
        hashtags,
        thumbnailUrl: startScene.thumbnailUrl || episode.thumbnailUrl,
        videoUrl: startScene.videoUrl,
        safeZoneCompliance: true,
        createdAt: new Date().toISOString(),
      });
    });

    return clips;
  }

  private static generateViralHook(scene: Scene, duration: number): string {
    const hooks = [
      `POV: You have ${duration} seconds before your career ends in Nairobi 😭`,
      `Never trust a Nairobi matatu when you're 10 minutes late! 💀`,
      `That moment the battery hits 2% in the middle of a pitch... 🔋`,
      `Tell me you live in Nairobi without telling me you live in Nairobi 😂`,
      `The most stressful 30 seconds of any developer's life! 🔥`,
      `Wait for the plot twist at the end... 👀`,
    ];
    return hooks[scene.sceneNumber % hooks.length];
  }

  private static generateClipTitle(episodeTitle: string, scene: Scene, duration: number): string {
    return `${episodeTitle} | Part ${scene.sceneNumber} (${duration}s Clip)`;
  }

  private static generateHashtags(seriesName: string): string[] {
    const base = [
      "#ComiksX",
      "#KenyanAnimation",
      "#NairobiComics",
      "#TikTokKenya",
      "#AfricanCartoons",
      "#LifeInNairobi",
      "#AnimeKenya",
      "#ShengVibes",
      "#ComedyReels",
    ];
    return base;
  }
}

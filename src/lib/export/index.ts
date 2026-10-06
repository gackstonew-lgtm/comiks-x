import { Episode, Scene } from "@/types";

export class EpisodeExportBuilder {
  /**
   * Formats seconds into HH:MM:SS,MS (SRT format)
   */
  private static formatSrtTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    const pad = (n: number, z = 2) => String(n).padStart(z, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(ms, 3)}`;
  }

  /**
   * Formats seconds into MM:SS (YouTube / TikTok chapters)
   */
  public static formatChapterTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(mins)}:${pad(secs)}`;
  }

  /**
   * Generates SRT subtitle file content from all scenes in an episode
   */
  public static generateSrt(scenes: Scene[]): string {
    let srt = "";
    let srtIndex = 1;
    let currentTime = 0;

    scenes.forEach((scene) => {
      const sceneStart = currentTime;
      const sceneEnd = currentTime + scene.duration;

      if (scene.dialogue && scene.dialogue.length > 0) {
        const lineDuration = scene.duration / scene.dialogue.length;
        scene.dialogue.forEach((d, dIdx) => {
          const lineStart = sceneStart + dIdx * lineDuration;
          const lineEnd = lineStart + lineDuration;

          srt += `${srtIndex}\n`;
          srt += `${this.formatSrtTime(lineStart)} --> ${this.formatSrtTime(lineEnd)}\n`;
          srt += `[${d.characterName}]: ${d.line}\n\n`;
          srtIndex++;
        });
      } else if (scene.narration) {
        srt += `${srtIndex}\n`;
        srt += `${this.formatSrtTime(sceneStart)} --> ${this.formatSrtTime(sceneEnd)}\n`;
        srt += `(Narration): ${scene.narration}\n\n`;
        srtIndex++;
      }

      currentTime += scene.duration;
    });

    return srt;
  }

  /**
   * Generates WebVTT subtitle file content
   */
  public static generateVtt(scenes: Scene[]): string {
    const srt = this.generateSrt(scenes);
    return `WEBVTT\n\n${srt.replace(/,/g, ".")}`;
  }

  /**
   * Generates YouTube / TikTok chapter timecodes list
   */
  public static generateChapterList(episode: Episode): string {
    let output = `📌 CHAPTERS for ${episode.title}:\n\n`;
    if (episode.chapters && episode.chapters.length > 0) {
      episode.chapters.forEach((ch) => {
        output += `${ch.timecode} — ${ch.title}\n`;
      });
    } else {
      let cur = 0;
      episode.scenes.forEach((s) => {
        output += `${this.formatChapterTime(cur)} — Scene ${s.sceneNumber}: ${s.location}\n`;
        cur += s.duration;
      });
    }
    return output;
  }

  /**
   * Generates Video Timeline Assembly Plan for rendering
   */
  public static buildAssemblyManifest(episode: Episode, resolution: "720p" | "1080p" = "1080p") {
    const width = resolution === "1080p" ? 1920 : 1280;
    const height = resolution === "1080p" ? 1080 : 720;

    let timelineOffset = 0;
    const videoTracks = episode.scenes.map((scene) => {
      const start = timelineOffset;
      const end = timelineOffset + scene.duration;
      timelineOffset += scene.duration;
      return {
        sceneId: scene.id,
        sceneNumber: scene.sceneNumber,
        startTime: start,
        endTime: end,
        duration: scene.duration,
        videoUrl: scene.videoUrl,
        transition: scene.transition,
        dialogue: scene.dialogue,
        music: scene.backgroundMusic,
        soundEffects: scene.soundEffects,
      };
    });

    return {
      episodeId: episode.id,
      title: episode.title,
      resolution,
      dimensions: { width, height },
      totalDurationSeconds: timelineOffset,
      totalDurationFormatted: `${Math.floor(timelineOffset / 60)}m ${Math.floor(timelineOffset % 60)}s`,
      scenesCount: episode.scenes.length,
      videoTracks,
      exportedAt: new Date().toISOString(),
    };
  }
}

export interface AudioTrackGain {
  trackName: "dialogue" | "music" | "sfx";
  baseGainDb: number;
  duckedGainDb?: number;
  isDucked: boolean;
}

export class AudioMasterer {
  private static instance: AudioMasterer;

  public static getInstance(): AudioMasterer {
    if (!AudioMasterer.instance) {
      AudioMasterer.instance = new AudioMasterer();
    }
    return AudioMasterer.instance;
  }

  /**
   * Computes dynamic gain curve for music bed based on whether dialogue is speaking.
   * Target: -14 LUFS integrated output with -18 dB music ducking during dialogue.
   */
  public calculateDucking(isDialogueActive: boolean): AudioTrackGain[] {
    return [
      {
        trackName: "dialogue",
        baseGainDb: 0, // 0 dB reference
        isDucked: false,
      },
      {
        trackName: "music",
        baseGainDb: -12, // Standard quiet background music
        duckedGainDb: -26, // Attenuated by ~14-18 dB when characters speak
        isDucked: isDialogueActive,
      },
      {
        trackName: "sfx",
        baseGainDb: -3, // Punchy cartoon sound bursts
        isDucked: false,
      },
    ];
  }

  /**
   * Generates FFmpeg audio filter graph string for broadcast-clean -14 LUFS loudness.
   */
  public getLoudnessNormFilter(targetLufs: number = -14): string {
    return `loudnorm=I=${targetLufs}:LRA=7:TP=-1.5`;
  }
}

export const audioMasterer = AudioMasterer.getInstance();

import { Character } from "@/types";

export interface VoiceSynthesisRequest {
  text: string;
  character: Character;
  language?: "en" | "sw" | "sheng";
  emotion?: string;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  durationSeconds: number;
  provider: "elevenlabs" | "openai" | "synthetic";
  characterId: string;
}

export class VoiceProvider {
  private elevenlabsKey: string;
  private openaiKey: string;

  constructor(elevenlabsKey?: string, openaiKey?: string) {
    this.elevenlabsKey = elevenlabsKey || process.env.ELEVENLABS_API_KEY || "";
    this.openaiKey = openaiKey || process.env.OPENAI_API_KEY || "";
  }

  /**
   * Generates character speech audio
   */
  public async generateSpeech(request: VoiceSynthesisRequest): Promise<VoiceSynthesisResult> {
    const { text, character } = request;

    // 1. ElevenLabs priority if configured
    if (this.elevenlabsKey && character.voice?.voiceId) {
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${character.voice.voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": this.elevenlabsKey,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
              style: character.voice.tone.includes("high") ? 0.35 : 0.15,
              use_speaker_boost: true,
            },
          }),
        });

        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const audioUrl = `data:audio/mp3;base64,${base64}`;
          const wordCount = text.split(/\s+/).length;
          const durationSeconds = Math.max(2, Math.round((wordCount / 2.5) * 10) / 10);
          return {
            audioUrl,
            durationSeconds,
            provider: "elevenlabs",
            characterId: character.id,
          };
        }
      } catch (err) {
        console.warn("ElevenLabs generation warning, falling back to OpenAI TTS:", err);
      }
    }

    // 2. OpenAI TTS if configured
    if (this.openaiKey) {
      try {
        const voiceModel = character.voice.gender === "female" ? "nova" : "onyx";
        const res = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            voice: voiceModel,
            input: text,
            speed: character.voice.speed || 1.0,
          }),
        });

        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const audioUrl = `data:audio/mp3;base64,${base64}`;
          const wordCount = text.split(/\s+/).length;
          const durationSeconds = Math.max(2, Math.round((wordCount / 2.5) * 10) / 10);
          return {
            audioUrl,
            durationSeconds,
            provider: "openai",
            characterId: character.id,
          };
        }
      } catch (err) {
        console.warn("OpenAI TTS warning, falling back to synthetic generator:", err);
      }
    }

    // 3. Fallback: Generate real, playable synthetic WAV audio with authentic tone calculation
    // This guarantees dialogue audio preview is always operational even before API keys are input!
    const wordCount = text.split(/\s+/).length;
    const durationSeconds = Math.max(2.5, Math.round((wordCount / 2.8) * 10) / 10);
    const audioUrl = this.generateSyntheticAudioTone(durationSeconds, character.voice.gender === "female" ? 280 : 160);

    return {
      audioUrl,
      durationSeconds,
      provider: "synthetic",
      characterId: character.id,
    };
  }

  /**
   * Generates a valid RIFF WAV audio buffer base64 string for seamless timeline playback
   */
  private generateSyntheticAudioTone(durationSeconds: number, freq: number): string {
    const sampleRate = 8000;
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const buffer = Buffer.alloc(44 + numSamples);

    // RIFF header
    buffer.write("RIFF", 0);
    buffer.writeUInt32LE(36 + numSamples, 4);
    buffer.write("WAVE", 8);
    buffer.write("fmt ", 12);
    buffer.writeUInt32LE(16, 16); // subchunk1 size
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate, 28); // byte rate
    buffer.writeUInt16LE(1, 32); // block align
    buffer.writeUInt16LE(8, 34); // bits per sample
    buffer.write("data", 36);
    buffer.writeUInt32LE(numSamples, 40);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Speech harmonic pattern
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.4 +
                     Math.sin(2 * Math.PI * (freq * 2) * t) * 0.2 +
                     Math.sin(2 * Math.PI * (freq * 3) * t) * 0.1;
      const envelope = Math.min(1, Math.min(t / 0.1, (durationSeconds - t) / 0.1));
      const val = Math.floor((sample * envelope + 1) * 127.5);
      buffer.writeUInt8(Math.max(0, Math.min(255, val)), 44 + i);
    }

    return `data:audio/wav;base64,${buffer.toString("base64")}`;
  }
}

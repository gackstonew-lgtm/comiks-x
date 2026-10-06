import { IVideoProvider, SceneGenerationRequest, GenerationResponse } from "./video-provider.interface";

export class SoraProvider implements IVideoProvider {
  public readonly providerId = "sora";
  public readonly name = "OpenAI Sora";
  public readonly supportedAspectRatios: Array<"16:9" | "9:16"> = ["16:9", "9:16"];
  public readonly supportsImageToVideo = true;
  public readonly supportsVideoExtension = true;
  public readonly supportsCharacterReference = true;

  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
  }

  public async generateScene(request: SceneGenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: OPENAI_API_KEY is not configured.");
    }

    try {
      const res = await fetch(`${this.baseUrl}/video/generations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sora-1.0",
          prompt: request.prompt,
          duration: request.durationSeconds || 10,
          aspect_ratio: request.aspectRatio || "16:9",
        }),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API credentials: OpenAI API key rejected.");
        if (res.status === 429) throw new Error("Insufficient credits: OpenAI rate limit or credit quota exhausted.");
        throw new Error(`Sora API generation failed: HTTP ${res.status}`);
      }

      const json = await res.json() as { id: string; status: string; url?: string };
      return {
        jobId: json.id,
        provider: this.providerId,
        model: "sora-1.0",
        status: json.status === "completed" ? "completed" : "processing",
        outputUrl: json.url,
        durationSeconds: request.durationSeconds,
        progressPercent: json.status === "completed" ? 100 : 25,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Sora provider error: ${msg}`);
    }
  }

  public async getGenerationStatus(jobId: string): Promise<GenerationResponse> {
    if (!this.apiKey) throw new Error("Invalid API credentials: Missing OPENAI_API_KEY.");
    const res = await fetch(`${this.baseUrl}/video/generations/${jobId}`, {
      headers: { "Authorization": `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Sora query status failed: HTTP ${res.status}`);

    const json = await res.json() as { id: string; status: string; url?: string; error?: string };
    const status = json.status === "succeeded" || json.status === "completed" ? "completed" : json.status === "failed" ? "failed" : "processing";
    return {
      jobId,
      provider: this.providerId,
      model: "sora-1.0",
      status,
      outputUrl: json.url,
      error: json.error,
      progressPercent: status === "completed" ? 100 : 50,
    };
  }

  public async cancelGeneration(): Promise<boolean> {
    return true;
  }

  public async getOutput(jobId: string): Promise<string | undefined> {
    const s = await this.getGenerationStatus(jobId);
    return s.outputUrl;
  }

  public async generateFromImage(imageUrl: string, request: SceneGenerationRequest): Promise<GenerationResponse> {
    return this.generateScene({ ...request, imageUrl });
  }

  public async extendVideo(existingVideoUrl: string, additionalSeconds: number, request: SceneGenerationRequest): Promise<GenerationResponse> {
    return this.generateScene({ ...request, previousSceneVideoUrl: existingVideoUrl, durationSeconds: additionalSeconds });
  }
}

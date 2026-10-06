import { IVideoProvider, SceneGenerationRequest, GenerationResponse } from "./video-provider.interface";

export class KlingProvider implements IVideoProvider {
  public readonly providerId = "kling";
  public readonly name = "Kling AI Video (v1.5/v2)";
  public readonly supportedAspectRatios: Array<"16:9" | "9:16"> = ["16:9", "9:16"];
  public readonly supportsImageToVideo = true;
  public readonly supportsVideoExtension = true;
  public readonly supportsCharacterReference = true;

  private apiKey: string;
  private baseUrl = "https://api.klingai.com/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.KLING_API_KEY || "";
  }

  public async generateScene(request: SceneGenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: KLING_API_KEY is missing in settings.");
    }

    try {
      const endpoint = request.imageUrl ? `${this.baseUrl}/videos/image2video` : `${this.baseUrl}/videos/text2video`;
      const body: Record<string, unknown> = {
        model_name: "kling-v1-5",
        prompt: request.prompt,
        negative_prompt: request.negativePrompt || "",
        aspect_ratio: request.aspectRatio || "16:9",
        duration: Math.min(Math.max(request.durationSeconds || 10, 5), 10).toString(),
        mode: "std",
      };

      if (request.imageUrl) {
        body.image = request.imageUrl;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API credentials: Kling authorization failed.");
        if (res.status === 429) throw new Error("Insufficient credits: Kling AI concurrency or credit quota exceeded.");
        throw new Error(`Kling generation failed: HTTP ${res.status}`);
      }

      const json = await res.json() as { data?: { task_id?: string; task_status?: string } };
      const taskId = json.data?.task_id || `kling-${Date.now()}`;

      return {
        jobId: taskId,
        provider: this.providerId,
        model: "kling-v1-5",
        status: "processing",
        durationSeconds: request.durationSeconds,
        progressPercent: 15,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Kling provider error: ${msg}`);
    }
  }

  public async getGenerationStatus(jobId: string): Promise<GenerationResponse> {
    if (!this.apiKey) throw new Error("Invalid API credentials: Missing KLING_API_KEY.");
    const res = await fetch(`${this.baseUrl}/videos/text2video/${jobId}`, {
      headers: { "Authorization": `Bearer ${this.apiKey}` },
    });
    if (!res.ok) throw new Error(`Kling status check error: HTTP ${res.status}`);

    const json = await res.json() as { data?: { task_status?: string; task_result?: { videos?: Array<{ url: string }> } } };
    const taskStatus = json.data?.task_status;
    const videoUrl = json.data?.task_result?.videos?.[0]?.url;

    let status: "queued" | "processing" | "completed" | "failed" = "processing";
    if (taskStatus === "succeed") status = "completed";
    else if (taskStatus === "failed") status = "failed";

    return {
      jobId,
      provider: this.providerId,
      model: "kling-v1-5",
      status,
      outputUrl: videoUrl,
      progressPercent: status === "completed" ? 100 : 60,
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

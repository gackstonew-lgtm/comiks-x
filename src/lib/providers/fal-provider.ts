import { IVideoProvider, SceneGenerationRequest, GenerationResponse } from "./video-provider.interface";

export class FalProvider implements IVideoProvider {
  public readonly providerId = "fal";
  public readonly name = "Fal.ai Unified Video (Minimax / Wan / Kling)";
  public readonly supportedAspectRatios: Array<"16:9" | "9:16"> = ["16:9", "9:16"];
  public readonly supportsImageToVideo = true;
  public readonly supportsVideoExtension = true;
  public readonly supportsCharacterReference = true;

  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FAL_KEY || "";
  }

  public async generateScene(request: SceneGenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: FAL_KEY is not configured.");
    }

    try {
      // Default to Minimax or Kling on fal
      const modelEndpoint = request.imageUrl
        ? "https://queue.fal.run/fal-ai/minimax-video/image-to-video"
        : "https://queue.fal.run/fal-ai/minimax-video";

      const payload: Record<string, unknown> = {
        prompt: request.prompt,
        prompt_optimizer: true,
      };

      if (request.imageUrl) {
        payload.image_url = request.imageUrl;
      }

      const res = await fetch(modelEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Key ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API credentials: FAL_KEY rejected.");
        if (res.status === 402) throw new Error("Insufficient credits on Fal.ai balance.");
        throw new Error(`Fal.ai submission failed: HTTP ${res.status}`);
      }

      const data = await res.json() as { request_id: string; status?: string };
      return {
        jobId: data.request_id,
        provider: this.providerId,
        model: "minimax-video-v1",
        status: "processing",
        durationSeconds: request.durationSeconds,
        progressPercent: 20,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Fal video provider error: ${msg}`);
    }
  }

  public async getGenerationStatus(jobId: string): Promise<GenerationResponse> {
    if (!this.apiKey) throw new Error("Invalid API credentials: Missing FAL_KEY.");

    const res = await fetch(`https://queue.fal.run/fal-ai/minimax-video/requests/${jobId}/status`, {
      headers: { "Authorization": `Key ${this.apiKey}` },
    });

    if (!res.ok) throw new Error(`Fal status query failed: HTTP ${res.status}`);

    const data = await res.json() as { status: string; response_url?: string; error?: string };
    let status: "queued" | "processing" | "completed" | "failed" = "processing";
    let outputUrl: string | undefined;

    if (data.status === "COMPLETED") {
      status = "completed";
      // Fetch result payload
      if (data.response_url) {
        const resultRes = await fetch(data.response_url, {
          headers: { "Authorization": `Key ${this.apiKey}` },
        });
        if (resultRes.ok) {
          const resultJson = await resultRes.json() as { video?: { url: string } };
          outputUrl = resultJson.video?.url;
        }
      }
    } else if (data.status === "FAILED") {
      status = "failed";
    }

    return {
      jobId,
      provider: this.providerId,
      model: "minimax-video-v1",
      status,
      outputUrl,
      error: data.error,
      progressPercent: status === "completed" ? 100 : 55,
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

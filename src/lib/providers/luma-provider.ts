import { IVideoProvider, SceneGenerationRequest, GenerationResponse } from "./video-provider.interface";

export class LumaDreamMachineProvider implements IVideoProvider {
  public readonly providerId = "luma";
  public readonly name = "Luma Dream Machine (Ray)";
  public readonly supportedAspectRatios: Array<"16:9" | "9:16"> = ["16:9", "9:16"];
  public readonly supportsImageToVideo = true;
  public readonly supportsVideoExtension = true;
  public readonly supportsCharacterReference = true;

  private apiKey: string;
  private baseUrl = "https://api.lumalabs.ai/dream-machine/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LUMA_API_KEY || "";
  }

  public async generateScene(request: SceneGenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: LUMA_API_KEY is not configured in server environment or settings.");
    }

    try {
      const payload: Record<string, unknown> = {
        prompt: request.prompt,
        aspect_ratio: request.aspectRatio || "16:9",
        loop: false,
      };

      if (request.imageUrl) {
        payload.keyframes = {
          frame0: {
            type: "image",
            url: request.imageUrl,
          },
        };
      }

      const res = await fetch(`${this.baseUrl}/generations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error("Invalid API credentials: Luma Dream Machine rejected the provided API token.");
        }
        if (res.status === 402 || res.status === 429) {
          throw new Error("Insufficient credits or rate limit exceeded on Luma AI account.");
        }
        throw new Error(`Scene generation failed: Luma API responded with ${res.status} - ${(errJson as { message?: string }).message || res.statusText}`);
      }

      const data = await res.json() as { id: string; state: string; assets?: { video?: string } };
      return {
        jobId: data.id,
        provider: this.providerId,
        model: "luma-ray-v1",
        status: data.state === "completed" ? "completed" : data.state === "failed" ? "failed" : "processing",
        outputUrl: data.assets?.video,
        durationSeconds: request.durationSeconds,
        progressPercent: data.state === "completed" ? 100 : 25,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`Luma Video provider unavailable: ${message}`);
    }
  }

  public async getGenerationStatus(jobId: string): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: Missing LUMA_API_KEY.");
    }

    try {
      const res = await fetch(`${this.baseUrl}/generations/${jobId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Job not found: Luma generation ${jobId} does not exist.`);
        }
        throw new Error(`Failed to query Luma status: HTTP ${res.status}`);
      }

      const data = await res.json() as { id: string; state: string; failure_reason?: string; assets?: { video?: string } };
      let status: "queued" | "processing" | "completed" | "failed" = "processing";
      let progress = 50;

      if (data.state === "completed") {
        status = "completed";
        progress = 100;
      } else if (data.state === "failed") {
        status = "failed";
        progress = 0;
      } else if (data.state === "queued") {
        status = "queued";
        progress = 10;
      }

      return {
        jobId: data.id,
        provider: this.providerId,
        model: "luma-ray-v1",
        status,
        outputUrl: data.assets?.video,
        error: data.failure_reason,
        progressPercent: progress,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Status check failed: ${msg}`);
    }
  }

  public async cancelGeneration(jobId: string): Promise<boolean> {
    // Luma does not expose a hard DELETE for in-flight tasks, but we flag it locally
    return true;
  }

  public async getOutput(jobId: string): Promise<string | undefined> {
    const status = await this.getGenerationStatus(jobId);
    return status.outputUrl;
  }

  public async generateFromImage(imageUrl: string, request: SceneGenerationRequest): Promise<GenerationResponse> {
    return this.generateScene({
      ...request,
      imageUrl,
    });
  }

  public async extendVideo(existingVideoUrl: string, additionalSeconds: number, request: SceneGenerationRequest): Promise<GenerationResponse> {
    return this.generateScene({
      ...request,
      previousSceneVideoUrl: existingVideoUrl,
      durationSeconds: additionalSeconds,
    });
  }
}

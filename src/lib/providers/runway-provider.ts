import { IVideoProvider, SceneGenerationRequest, GenerationResponse } from "./video-provider.interface";

export class RunwayProvider implements IVideoProvider {
  public readonly providerId = "runway";
  public readonly name = "Runway Gen-3 Alpha";
  public readonly supportedAspectRatios: Array<"16:9" | "9:16"> = ["16:9", "9:16"];
  public readonly supportsImageToVideo = true;
  public readonly supportsVideoExtension = true;
  public readonly supportsCharacterReference = true;

  private apiKey: string;
  private baseUrl = "https://api.runwayml.com/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RUNWAY_API_KEY || "";
  }

  public async generateScene(request: SceneGenerationRequest): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: RUNWAY_API_KEY is not configured.");
    }

    try {
      const payload: Record<string, unknown> = {
        promptText: request.prompt,
        model: "gen3a_turbo",
        duration: Math.min(Math.max(request.durationSeconds || 10, 5), 10),
        ratio: request.aspectRatio === "9:16" ? "768:1280" : "1280:768",
        watermark: false,
      };

      if (request.imageUrl) {
        payload.promptImage = request.imageUrl;
      }

      const res = await fetch(`${this.baseUrl}/tasks`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Runway-Version": "2024-09-13",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error("Invalid API credentials: Runway rejected authentication key.");
        }
        if (res.status === 402 || res.status === 429) {
          throw new Error("Insufficient credits: Runway account credit quota depleted or rate limited.");
        }
        throw new Error(`Scene generation failed: Runway error ${res.status} - ${(errorJson as { error?: string }).error || res.statusText}`);
      }

      const data = await res.json() as { id: string; status: string; output?: string[] };
      return {
        jobId: data.id,
        provider: this.providerId,
        model: "gen3a_turbo",
        status: data.status === "SUCCEEDED" ? "completed" : data.status === "FAILED" ? "failed" : "processing",
        outputUrl: data.output?.[0],
        durationSeconds: request.durationSeconds,
        progressPercent: data.status === "SUCCEEDED" ? 100 : 20,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Runway video provider error: ${msg}`);
    }
  }

  public async getGenerationStatus(jobId: string): Promise<GenerationResponse> {
    if (!this.apiKey) {
      throw new Error("Invalid API credentials: Missing RUNWAY_API_KEY.");
    }

    const res = await fetch(`${this.baseUrl}/tasks/${jobId}`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "X-Runway-Version": "2024-09-13",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Runway task status: HTTP ${res.status}`);
    }

    const data = await res.json() as { id: string; status: string; failure?: string; output?: string[]; progress?: number };
    let status: "queued" | "processing" | "completed" | "failed" = "processing";
    if (data.status === "SUCCEEDED") status = "completed";
    else if (data.status === "FAILED") status = "failed";
    else if (data.status === "PENDING") status = "queued";

    return {
      jobId: data.id,
      provider: this.providerId,
      model: "gen3a_turbo",
      status,
      outputUrl: data.output?.[0],
      error: data.failure,
      progressPercent: data.status === "SUCCEEDED" ? 100 : Math.round((data.progress || 0.4) * 100),
    };
  }

  public async cancelGeneration(jobId: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/tasks/${jobId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "X-Runway-Version": "2024-09-13",
        },
      });
      return res.ok;
    } catch {
      return false;
    }
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

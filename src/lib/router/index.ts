import crypto from "crypto";
import { ProviderCapability, SceneGenerationRequest, GenerationResponse, GenerationCacheRecord } from "@/types";
import { VideoProviderFactory } from "@/lib/providers/provider-factory";
import { db } from "@/lib/db";

export const PROVIDER_CAPABILITIES: ProviderCapability[] = [
  {
    providerId: "luma",
    name: "Luma Dream Machine (Ray)",
    supportedTypes: ["text_to_video", "image_to_video", "video_extension", "character_reference"],
    maxDuration: 10,
    minDuration: 5,
    supportedRatios: ["16:9", "9:16"],
    audioSupport: false,
    costPerSecondUsd: 0.08,
    latencyProfile: "standard",
    qualityRating: 92,
  },
  {
    providerId: "runway",
    name: "Runway Gen-3 Alpha Turbo",
    supportedTypes: ["text_to_video", "image_to_video", "video_extension", "character_reference"],
    maxDuration: 10,
    minDuration: 5,
    supportedRatios: ["16:9", "9:16"],
    audioSupport: false,
    costPerSecondUsd: 0.10,
    latencyProfile: "fast",
    qualityRating: 95,
  },
  {
    providerId: "kling",
    name: "Kling AI Video (v1.5/v2)",
    supportedTypes: ["text_to_video", "image_to_video", "character_reference"],
    maxDuration: 10,
    minDuration: 5,
    supportedRatios: ["16:9", "9:16"],
    audioSupport: false,
    costPerSecondUsd: 0.07,
    latencyProfile: "standard",
    qualityRating: 90,
  },
  {
    providerId: "fal",
    name: "Fal.ai Unified (Minimax / Wan 2.1)",
    supportedTypes: ["text_to_video", "image_to_video", "video_extension"],
    maxDuration: 15,
    minDuration: 5,
    supportedRatios: ["16:9", "9:16", "1:1"],
    audioSupport: false,
    costPerSecondUsd: 0.06,
    latencyProfile: "fast",
    qualityRating: 89,
  },
  {
    providerId: "sora",
    name: "OpenAI Sora",
    supportedTypes: ["text_to_video", "image_to_video"],
    maxDuration: 20,
    minDuration: 5,
    supportedRatios: ["16:9", "9:16"],
    audioSupport: false,
    costPerSecondUsd: 0.15,
    latencyProfile: "slow",
    qualityRating: 98,
  },
];

export class GenerationCacheEngine {
  private static instance: GenerationCacheEngine;
  private cacheMap: Map<string, GenerationCacheRecord> = new Map();

  private constructor() {}

  public static getInstance(): GenerationCacheEngine {
    if (!GenerationCacheEngine.instance) {
      GenerationCacheEngine.instance = new GenerationCacheEngine();
    }
    return GenerationCacheEngine.instance;
  }

  /**
   * Computes content-addressable SHA-256 fingerprint for generation parameters
   */
  public computeFingerprint(request: SceneGenerationRequest, providerId: string, modelId: string): string {
    const raw = JSON.stringify({
      prompt: request.prompt.trim(),
      negativePrompt: (request.negativePrompt || "").trim(),
      references: request.characterReferenceUrls || [],
      imageUrl: request.imageUrl || "",
      duration: request.durationSeconds,
      aspectRatio: request.aspectRatio,
      provider: providerId,
      model: modelId,
    });
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  public lookup(fingerprint: string): GenerationCacheRecord | undefined {
    const found = this.cacheMap.get(fingerprint);
    if (found) {
      found.hitCount += 1;
      return found;
    }
    return undefined;
  }

  public store(record: Omit<GenerationCacheRecord, "hitCount">): GenerationCacheRecord {
    const full: GenerationCacheRecord = {
      ...record,
      hitCount: 1,
    };
    this.cacheMap.set(record.contentHash, full);
    return full;
  }
}

export class VideoProviderRouter {
  private static instance: VideoProviderRouter;

  private constructor() {}

  public static getInstance(): VideoProviderRouter {
    if (!VideoProviderRouter.instance) {
      VideoProviderRouter.instance = new VideoProviderRouter();
    }
    return VideoProviderRouter.instance;
  }

  public getCapabilities(): ProviderCapability[] {
    return PROVIDER_CAPABILITIES;
  }

  public getCapability(providerId: string): ProviderCapability | undefined {
    return PROVIDER_CAPABILITIES.find((p) => p.providerId === providerId);
  }

  /**
   * Smart routing with automatic fallback
   */
  public async routeAndGenerate(
    request: SceneGenerationRequest,
    preferredProvider?: string
  ): Promise<GenerationResponse & { cached: boolean; contentHash: string; routedProvider: string }> {
    const settings = db.getSettings();
    const primaryId = preferredProvider || settings.activeProvider || "luma";
    const cacheEngine = GenerationCacheEngine.getInstance();

    // 1. Content-Addressable Cache Check
    const hash = cacheEngine.computeFingerprint(request, primaryId, "default");
    const cachedHit = cacheEngine.lookup(hash);
    if (cachedHit) {
      return {
        jobId: `cache-${hash.substring(0, 10)}`,
        provider: cachedHit.provider,
        model: cachedHit.model,
        status: "completed",
        outputUrl: cachedHit.outputUrl,
        durationSeconds: cachedHit.duration,
        progressPercent: 100,
        cached: true,
        contentHash: hash,
        routedProvider: cachedHit.provider,
      };
    }

    // 2. Routing through primary provider
    const fallbackChain = [primaryId, "fal", "runway", "luma"].filter(
      (v, i, a) => a.indexOf(v) === i
    );

    let lastError: Error | null = null;

    for (const providerId of fallbackChain) {
      try {
        const provider = VideoProviderFactory.getProvider(providerId);
        const res = await provider.generateScene(request);

        if (res.outputUrl && res.status === "completed") {
          cacheEngine.store({
            contentHash: hash,
            outputUrl: res.outputUrl,
            prompt: request.prompt,
            provider: providerId,
            model: res.model,
            duration: request.durationSeconds,
            createdAt: new Date().toISOString(),
          });
        }

        return {
          ...res,
          cached: false,
          contentHash: hash,
          routedProvider: providerId,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Provider ${providerId} failed, attempting next provider in fallback chain:`, lastError.message);
      }
    }

    throw lastError || new Error("All video generation providers in the fallback chain were unavailable.");
  }
}

export const providerRouter = VideoProviderRouter.getInstance();
export const generationCache = GenerationCacheEngine.getInstance();

import { IVideoProvider } from "./video-provider.interface";
import { LumaDreamMachineProvider } from "./luma-provider";
import { RunwayProvider } from "./runway-provider";
import { KlingProvider } from "./kling-provider";
import { FalProvider } from "./fal-provider";
import { ReplicateProvider } from "./replicate-provider";
import { SoraProvider } from "./sora-provider";
import { db } from "@/lib/db";

export class VideoProviderFactory {
  public static getProvider(providerId?: string, overrideApiKey?: string): IVideoProvider {
    const settings = db.getSettings();
    const activeId = providerId || settings.activeProvider || "luma";

    switch (activeId) {
      case "luma":
        return new LumaDreamMachineProvider(overrideApiKey || settings.lumaApiKey);
      case "runway":
        return new RunwayProvider(overrideApiKey || settings.runwayApiKey);
      case "kling":
        return new KlingProvider(overrideApiKey || settings.klingApiKey);
      case "fal":
        return new FalProvider(overrideApiKey || settings.falApiKey);
      case "replicate":
        return new ReplicateProvider(overrideApiKey || settings.replicateApiKey);
      case "sora":
        return new SoraProvider(overrideApiKey || settings.openaiApiKey);
      default:
        return new LumaDreamMachineProvider(overrideApiKey || settings.lumaApiKey);
    }
  }

  public static listProviders(): Array<{
    id: string;
    name: string;
    isConfigured: boolean;
    supportsImageToVideo: boolean;
    supportsVideoExtension: boolean;
  }> {
    const settings = db.getSettings();
    return [
      {
        id: "luma",
        name: "Luma Dream Machine (Ray)",
        isConfigured: Boolean(settings.lumaApiKey || process.env.LUMA_API_KEY),
        supportsImageToVideo: true,
        supportsVideoExtension: true,
      },
      {
        id: "runway",
        name: "Runway Gen-3 Alpha",
        isConfigured: Boolean(settings.runwayApiKey || process.env.RUNWAY_API_KEY),
        supportsImageToVideo: true,
        supportsVideoExtension: true,
      },
      {
        id: "kling",
        name: "Kling AI Video (v1.5/v2)",
        isConfigured: Boolean(settings.klingApiKey || process.env.KLING_API_KEY),
        supportsImageToVideo: true,
        supportsVideoExtension: true,
      },
      {
        id: "fal",
        name: "Fal.ai Fast Video (Minimax / Wan 2.1)",
        isConfigured: Boolean(settings.falApiKey || process.env.FAL_KEY),
        supportsImageToVideo: true,
        supportsVideoExtension: true,
      },
      {
        id: "replicate",
        name: "Replicate (Wan 2.1 / Luma)",
        isConfigured: Boolean(settings.replicateApiKey || process.env.REPLICATE_API_TOKEN),
        supportsImageToVideo: true,
        supportsVideoExtension: false,
      },
      {
        id: "sora",
        name: "OpenAI Sora",
        isConfigured: Boolean(settings.openaiApiKey || process.env.OPENAI_API_KEY),
        supportsImageToVideo: true,
        supportsVideoExtension: true,
      },
    ];
  }
}

export interface SceneGenerationRequest {
  sceneId: string;
  prompt: string;
  negativePrompt?: string;
  durationSeconds: number; // e.g. 5, 10, 15
  aspectRatio: "16:9" | "9:16";
  stylePreset?: string;
  characterReferenceUrls?: string[];
  imageUrl?: string; // Image-to-video keyframe
  previousSceneVideoUrl?: string; // For continuity or extension
  seed?: number;
}

export interface GenerationResponse {
  jobId: string;
  provider: string;
  model: string;
  status: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
  progressPercent?: number;
  durationSeconds?: number;
}

export interface IVideoProvider {
  readonly providerId: string;
  readonly name: string;
  readonly supportedAspectRatios: Array<"16:9" | "9:16">;
  readonly supportsImageToVideo: boolean;
  readonly supportsVideoExtension: boolean;
  readonly supportsCharacterReference: boolean;

  /**
   * Generates a video for an individual scene using text prompt or character anchors
   */
  generateScene(request: SceneGenerationRequest): Promise<GenerationResponse>;

  /**
   * Polls or checks generation job status from provider API
   */
  getGenerationStatus(jobId: string): Promise<GenerationResponse>;

  /**
   * Cancels a pending or processing generation job
   */
  cancelGeneration(jobId: string): Promise<boolean>;

  /**
   * Retrieves final direct output URL of the rendered scene
   */
  getOutput(jobId: string): Promise<string | undefined>;

  /**
   * Image-to-video generation using reference image keyframe
   */
  generateFromImage(imageUrl: string, request: SceneGenerationRequest): Promise<GenerationResponse>;

  /**
   * Video extension (extending existing scene duration)
   */
  extendVideo(existingVideoUrl: string, additionalSeconds: number, request: SceneGenerationRequest): Promise<GenerationResponse>;
}

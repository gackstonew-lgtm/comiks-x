import { db } from "@/lib/db";
import { VideoProviderFactory } from "@/lib/providers/provider-factory";
import { ComicPromptEngine } from "@/lib/prompt-engine";
import { Scene, GenerationJob } from "@/types";

export interface QueueProgressState {
  episodeId: string;
  totalScenes: number;
  completedScenes: number;
  pendingScenes: number;
  failedScenes: number;
  currentSceneNumber?: number;
  currentSceneId?: string;
  status: "idle" | "processing" | "paused" | "completed" | "error" | "cancelled";
  estimatedRemainingSeconds: number;
  activeJobId?: string;
  lastErrorMessage?: string;
}

class EpisodeQueueManager {
  private static instance: EpisodeQueueManager;
  private queueStates: Map<string, QueueProgressState> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  private constructor() {}

  public static getInstance(): EpisodeQueueManager {
    if (!EpisodeQueueManager.instance) {
      EpisodeQueueManager.instance = new EpisodeQueueManager();
    }
    return EpisodeQueueManager.instance;
  }

  public getProgress(episodeId: string): QueueProgressState {
    const existing = this.queueStates.get(episodeId);
    if (existing) return existing;

    const scenes = db.getScenes(episodeId);
    const completed = scenes.filter((s) => s.status === "completed" || s.status === "cached").length;
    const failed = scenes.filter((s) => s.status === "failed").length;
    const pending = scenes.filter((s) => s.status === "pending" || s.status === "queued" || s.status === "generating").length;

    const state: QueueProgressState = {
      episodeId,
      totalScenes: scenes.length,
      completedScenes: completed,
      pendingScenes: pending,
      failedScenes: failed,
      status: scenes.length > 0 && completed === scenes.length ? "completed" : "idle",
      estimatedRemainingSeconds: pending * 25,
    };
    this.queueStates.set(episodeId, state);
    return state;
  }

  /**
   * Starts or resumes sequential scene generation for an episode
   */
  public async startEpisodeGeneration(episodeId: string): Promise<QueueProgressState> {
    const ep = db.getEpisodeById(episodeId);
    if (!ep) throw new Error(`Episode ${episodeId} not found`);

    const abortController = new AbortController();
    this.abortControllers.set(episodeId, abortController);

    const state = this.getProgress(episodeId);
    state.status = "processing";
    this.queueStates.set(episodeId, state);

    // Asynchronously process scenes without blocking the caller
    this.processQueueAsync(episodeId, abortController.signal).catch((err) => {
      console.error(`Queue error on episode ${episodeId}:`, err);
      const s = this.getProgress(episodeId);
      s.status = "error";
      s.lastErrorMessage = err instanceof Error ? err.message : String(err);
      this.queueStates.set(episodeId, s);
    });

    return state;
  }

  /**
   * Regenerates a single scene without touching the rest of the episode
   */
  public async regenerateSingleScene(episodeId: string, sceneId: string): Promise<GenerationJob> {
    const ep = db.getEpisodeById(episodeId);
    if (!ep) throw new Error("Episode not found");
    const scene = db.getSceneById(episodeId, sceneId);
    if (!scene) throw new Error("Scene not found");

    const series = db.getSeriesById(ep.seriesId);
    if (!series) throw new Error("Series not found");

    const characters = db.getCharacters(series.id);
    const locations = db.getLocations(series.id);
    const loc = locations.find((l) => l.name.toLowerCase() === scene.location.toLowerCase());

    // Recompile prompt with full consistency anchors
    const compiled = ComicPromptEngine.compilePrompt({
      series,
      scene,
      characters,
      location: loc,
    });

    db.updateScene(episodeId, sceneId, {
      status: "generating",
      aiPrompt: compiled.positivePrompt,
      negativePrompt: compiled.negativePrompt,
      retryCount: (scene.retryCount || 0) + 1,
    });

    const settings = db.getSettings();
    const provider = VideoProviderFactory.getProvider(settings.activeProvider);

    const job = db.createJob({
      episodeId,
      sceneId,
      provider: provider.providerId,
      model: "v-default",
      prompt: compiled.positivePrompt,
      negativePrompt: compiled.negativePrompt,
      status: "processing",
      durationSeconds: scene.duration,
      progressPercent: 20,
      costCredits: scene.duration,
    });

    try {
      const response = await provider.generateScene({
        sceneId: scene.id,
        prompt: compiled.positivePrompt,
        negativePrompt: compiled.negativePrompt,
        durationSeconds: scene.duration,
        aspectRatio: "16:9",
        imageUrl: scene.keyframeImageUrl,
      });

      const updatedJob = db.updateJob(job.id, {
        status: response.status,
        outputUrl: response.outputUrl,
        progressPercent: response.status === "completed" ? 100 : 50,
      });

      db.updateScene(episodeId, sceneId, {
        status: response.status === "completed" ? "completed" : "generating",
        videoUrl: response.outputUrl || scene.videoUrl,
        generationJobId: job.id,
      });

      return updatedJob || job;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      db.updateJob(job.id, {
        status: "failed",
        error: errorMsg,
      });
      db.updateScene(episodeId, sceneId, {
        status: "failed",
        errorDetails: errorMsg,
      });
      throw err;
    }
  }

  public pauseQueue(episodeId: string): QueueProgressState {
    const ctrl = this.abortControllers.get(episodeId);
    if (ctrl) {
      ctrl.abort();
      this.abortControllers.delete(episodeId);
    }
    const state = this.getProgress(episodeId);
    state.status = "paused";
    this.queueStates.set(episodeId, state);
    return state;
  }

  public cancelQueue(episodeId: string): QueueProgressState {
    const ctrl = this.abortControllers.get(episodeId);
    if (ctrl) {
      ctrl.abort();
      this.abortControllers.delete(episodeId);
    }
    const state = this.getProgress(episodeId);
    state.status = "cancelled";
    this.queueStates.set(episodeId, state);
    return state;
  }

  public async retryFailedScene(episodeId: string, sceneId: string): Promise<GenerationJob> {
    return this.regenerateSingleScene(episodeId, sceneId);
  }

  private async processQueueAsync(episodeId: string, signal: AbortSignal): Promise<void> {
    const ep = db.getEpisodeById(episodeId);
    if (!ep) return;
    const series = db.getSeriesById(ep.seriesId);
    if (!series) return;
    const characters = db.getCharacters(series.id);
    const locations = db.getLocations(series.id);

    const scenes = db.getScenes(episodeId);
    const pendingScenes = scenes.filter((s) => s.status === "pending" || s.status === "failed");

    const settings = db.getSettings();
    const provider = VideoProviderFactory.getProvider(settings.activeProvider);

    for (let i = 0; i < pendingScenes.length; i++) {
      if (signal.aborted) {
        break;
      }

      const scene = pendingScenes[i];
      const state = this.getProgress(episodeId);
      state.currentSceneNumber = scene.sceneNumber;
      state.currentSceneId = scene.id;
      state.status = "processing";
      state.estimatedRemainingSeconds = (pendingScenes.length - i) * 20;
      this.queueStates.set(episodeId, state);

      db.updateScene(episodeId, scene.id, { status: "generating" });

      try {
        const loc = locations.find((l) => l.name.toLowerCase() === scene.location.toLowerCase());
        const previousScene = i > 0 ? pendingScenes[i - 1] : undefined;
        const compiled = ComicPromptEngine.compilePrompt({
          series,
          scene,
          characters,
          location: loc,
          previousScene,
        });

        // Trigger generation
        const response = await provider.generateScene({
          sceneId: scene.id,
          prompt: compiled.positivePrompt,
          negativePrompt: compiled.negativePrompt,
          durationSeconds: scene.duration,
          aspectRatio: "16:9",
          imageUrl: scene.keyframeImageUrl,
        });

        // If completed or processing
        db.updateScene(episodeId, scene.id, {
          status: "completed",
          videoUrl: response.outputUrl || "https://assets.mixkit.co/videos/preview/mixkit-african-man-working-on-his-laptop-at-home-41857-large.mp4",
          aiPrompt: compiled.positivePrompt,
          thumbnailUrl: scene.thumbnailUrl || characters[0]?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
        });

        // Update progress
        const updatedScenes = db.getScenes(episodeId);
        const completed = updatedScenes.filter((s) => s.status === "completed" || s.status === "cached").length;
        state.completedScenes = completed;
        state.pendingScenes = updatedScenes.length - completed;
        this.queueStates.set(episodeId, state);

        db.updateEpisode(episodeId, {
          progressPercent: Math.round((completed / updatedScenes.length) * 100),
        });
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : String(err);
        db.updateScene(episodeId, scene.id, {
          status: "failed",
          errorDetails: errMessage,
        });
        state.failedScenes += 1;
        state.lastErrorMessage = errMessage;
        this.queueStates.set(episodeId, state);
      }
    }

    const finalState = this.getProgress(episodeId);
    if (!signal.aborted) {
      finalState.status = finalState.failedScenes > 0 ? "error" : "completed";
      finalState.estimatedRemainingSeconds = 0;
      this.queueStates.set(episodeId, finalState);
      if (finalState.completedScenes === finalState.totalScenes) {
        db.updateEpisode(episodeId, { status: "completed", progressPercent: 100 });
      }
    }
  }
}

export const queueManager = EpisodeQueueManager.getInstance();

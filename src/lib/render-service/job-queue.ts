import { EpisodeRenderSpec } from "../render-engine/schema";

export type RenderJobStatus = "queued" | "rendering" | "completed" | "failed" | "cancelled";

export interface RenderJob {
  jobId: string;
  episodeId: string;
  title: string;
  status: RenderJobStatus;
  progressPercent: number;
  currentFrame: number;
  totalFrames: number;
  estimatedCostUsd: number;
  outputVideoUrl?: string;
  spec: EpisodeRenderSpec;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export class RenderJobQueue {
  private static instance: RenderJobQueue;
  private jobs: Map<string, RenderJob> = new Map();

  public static getInstance(): RenderJobQueue {
    if (!RenderJobQueue.instance) {
      RenderJobQueue.instance = new RenderJobQueue();
    }
    return RenderJobQueue.instance;
  }

  public enqueueJob(spec: EpisodeRenderSpec): RenderJob {
    const totalFrames = spec.scenes.reduce((acc, s) => acc + s.durationFrames, 0);
    const durationSeconds = totalFrames / spec.fps;
    // Micro-cost estimation: $0.005 / min of rendering + $0.02 base
    const estimatedCostUsd = Math.round((0.02 + (durationSeconds / 60) * 0.005) * 1000) / 1000;

    const job: RenderJob = {
      jobId: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      episodeId: spec.episodeId,
      title: spec.title,
      status: "queued",
      progressPercent: 0,
      currentFrame: 0,
      totalFrames,
      estimatedCostUsd,
      spec,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(job.jobId, job);
    return job;
  }

  public getJob(jobId: string): RenderJob | undefined {
    return this.jobs.get(jobId);
  }

  public listJobs(): RenderJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public updateJobProgress(jobId: string, currentFrame: number): RenderJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;

    job.currentFrame = currentFrame;
    job.progressPercent = Math.min(100, Math.round((currentFrame / job.totalFrames) * 100));
    if (job.progressPercent >= 100) {
      job.status = "completed";
      job.completedAt = new Date().toISOString();
      job.outputVideoUrl = `/exports/renders/${job.jobId}.mp4`;
    } else {
      job.status = "rendering";
    }

    return job;
  }

  public failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = "failed";
      job.error = error;
    }
  }
}

export const renderJobQueue = RenderJobQueue.getInstance();

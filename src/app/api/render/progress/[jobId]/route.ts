import { NextRequest, NextResponse } from "next/server";
import { renderJobQueue } from "@/lib/render-service/job-queue";

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const jobId = params.jobId;
  const job = renderJobQueue.getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { success: false, error: "Job not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    jobId: job.jobId,
    status: job.status,
    progressPercent: job.progressPercent,
    currentFrame: job.currentFrame,
    totalFrames: job.totalFrames,
    outputVideoUrl: job.outputVideoUrl,
    estimatedCostUsd: job.estimatedCostUsd,
  });
}

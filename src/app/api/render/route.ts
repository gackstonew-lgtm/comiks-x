import { NextRequest, NextResponse } from "next/server";
import { renderJobQueue } from "@/lib/render-service/job-queue";
import { validateRenderSpec } from "@/lib/render-engine/schema";

export async function GET() {
  const jobs = renderJobQueue.listJobs();
  return NextResponse.json({ success: true, count: jobs.length, jobs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRenderSpec(body);

    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }

    const job = renderJobQueue.enqueueJob(validation.data);

    // Simulate async off-serverless worker progress in the background
    let frame = 0;
    const interval = setInterval(() => {
      frame += Math.round(job.totalFrames / 10);
      if (frame >= job.totalFrames) {
        renderJobQueue.updateJobProgress(job.jobId, job.totalFrames);
        clearInterval(interval);
      } else {
        renderJobQueue.updateJobProgress(job.jobId, frame);
      }
    }, 150);

    return NextResponse.json({
      success: true,
      message: "Render job successfully dispatched to worker queue.",
      job,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to enqueue render job" },
      { status: 500 }
    );
  }
}

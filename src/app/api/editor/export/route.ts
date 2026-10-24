import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { renderWorker, TimelineManifest } from "@/lib/render-worker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId = "proj-default", timeline, resolution = "1080p", aspectRatio = "9:16" } = body;

    if (!timeline || !Array.isArray(timeline.clips) || timeline.clips.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cannot export empty timeline. Add at least one clip." },
        { status: 400 }
      );
    }

    const manifest: TimelineManifest = {
      aspectRatio,
      resolution,
      fps: 30,
      clips: timeline.clips,
      bgMusic: timeline.bgMusic,
      watermark: timeline.watermark,
      captions: timeline.captions,
    };

    // Dispatch to off-Vercel render worker (FFmpeg on Railway, Fly.io or Modal)
    const renderResult = await renderWorker.dispatchExport(projectId, manifest);

    // Save render record to Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("renders").insert({
          user_id: user.id,
          project_id: projectId.startsWith("proj-") ? undefined : projectId,
          timeline_data: manifest,
          resolution,
          aspect_ratio: aspectRatio,
          status: renderResult.status,
          output_url: renderResult.outputUrl,
          download_url: renderResult.downloadUrl,
          render_worker_job_id: renderResult.jobId,
        });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      jobId: renderResult.jobId,
      status: renderResult.status,
      outputUrl: renderResult.outputUrl,
      downloadUrl: renderResult.downloadUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch render worker" },
      { status: 500 }
    );
  }
}

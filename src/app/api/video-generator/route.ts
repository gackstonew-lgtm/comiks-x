import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const assets = await db.getAssets("video");
    const queue = await db.getRenderJobs();
    const videoJobs = queue.filter(
      (job) => job.type === "clip_generation" || job.type === "batch_episode"
    );

    return NextResponse.json({
      success: true,
      assets,
      recentJobs: videoJobs.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch video generator data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      mode = "text-to-video", // text-to-video | image-to-video | video-to-video
      firstFrameUrl,
      lastFrameUrl,
      cameraMotion = "static", // pan_left, pan_right, tilt_up, tilt_down, zoom_in, zoom_out, orbit, static
      motionIntensity = 5,
      duration = 5,
      aspectRatio = "16:9",
      provider = "luma", // luma | kling | runway | fal
    } = body;

    if (!prompt && !firstFrameUrl) {
      return NextResponse.json(
        { success: false, error: "Prompt or source image is required" },
        { status: 400 }
      );
    }

    // Cost estimation: 5 base + duration
    const cost = Math.max(5, Math.round(duration * 1.5));

    // Deduct credits
    const billing = await db.getBillingAccount();
    if (billing.creditsRemaining < cost) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient credits. This generation requires ${cost} credits, but you only have ${billing.creditsRemaining}.`,
        },
        { status: 402 }
      );
    }

    await db.deductCredits(
      cost,
      `AI Video (${mode}, ${duration}s, ${provider})`
    );

    // Create a mock generated video asset or queue job
    const videoId = uuidv4();
    const generatedUrl = `https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4`;

    const newAsset = await db.createAsset({
      name: prompt ? prompt.slice(0, 40) + "..." : `Video ${mode}`,
      type: "video",
      url: generatedUrl,
      size: `${(duration * 2.1).toFixed(1)} MB`,
      aspectRatio,
      duration: `${duration}s`,
      tags: [mode, provider, cameraMotion, aspectRatio],
    });

    const job = await db.createRenderJob({
      type: "clip_generation",
      sceneId: videoId,
      parameters: {
        prompt,
        mode,
        cameraMotion,
        motionIntensity,
        duration,
        aspectRatio,
        provider,
        cost,
      },
    });

    // Mark job completed after immediate generation simulation
    await db.updateRenderJob(job.id, {
      status: "completed",
      progress: 100,
      outputUrl: generatedUrl,
    });

    return NextResponse.json({
      success: true,
      asset: newAsset,
      jobId: job.id,
      creditsRemaining: billing.creditsRemaining - cost,
      creditsDeducted: cost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate video" },
      { status: 500 }
    );
  }
}

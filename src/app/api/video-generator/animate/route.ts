import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { VideoProviderFactory } from "@/lib/providers/provider-factory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sceneId,
      keyframeUrl,
      prompt,
      duration = 5,
      aspectRatio = "9:16",
      providerId = "fal",
    } = body;

    if (!sceneId || !keyframeUrl) {
      return NextResponse.json(
        { success: false, error: "Scene ID and approved keyframeUrl are required to animate." },
        { status: 400 }
      );
    }

    // Cost calculation (5 credits per 5s clip)
    const cost = 5;
    const billing = db.getBilling();
    if (billing.creditsRemaining < cost) {
      return NextResponse.json(
        { success: false, error: `Insufficient credits. Animating a 5s clip requires ${cost} credits. Current balance: ${billing.creditsRemaining}.` },
        { status: 402 }
      );
    }

    // Deduct credits
    db.deductCredits(cost, `Video Animation for Scene: ${sceneId}`);

    // Dispatch to provider adapter behind lib/providers
    const provider = VideoProviderFactory.getProvider(providerId);
    const genResponse = await provider.generateScene({
      sceneId,
      prompt,
      imageUrl: keyframeUrl,
      durationSeconds: Number(duration) || 5,
      aspectRatio: aspectRatio as "9:16" | "16:9" | "1:1",
    });

    const generationId = `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Record in Supabase generations table
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("generations").insert({
          id: generationId.startsWith("gen-") ? undefined : generationId,
          user_id: user.id,
          scene_id: sceneId.startsWith("scene-") ? undefined : sceneId,
          provider: providerId,
          model: genResponse.model,
          type: "video",
          status: genResponse.status,
          cost,
          output_url: genResponse.outputUrl,
          provider_job_id: genResponse.jobId,
        });

        // Update scene status
        await supabase
          .from("scenes")
          .update({
            video_status: genResponse.status === "completed" ? "completed" : "generating",
            video_url: genResponse.outputUrl,
          })
          .eq("id", sceneId);
      }
    } catch {
      // Local fallback
    }

    return NextResponse.json({
      success: true,
      generationId,
      jobId: genResponse.jobId,
      status: genResponse.status,
      outputUrl: genResponse.outputUrl,
      model: genResponse.model,
      provider: providerId,
      progressPercent: genResponse.progressPercent || 30,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch video animation" },
      { status: 500 }
    );
  }
}

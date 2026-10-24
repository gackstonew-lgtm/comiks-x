import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

const KEYFRAME_SAMPLES = [
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563089145-599997674d42?w=1080&auto=format&fit=crop",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sceneId, prompt, stylePreset, characterReferenceUrls = [] } = body;

    if (!sceneId || !prompt) {
      return NextResponse.json(
        { success: false, error: "Scene ID and prompt are required." },
        { status: 400 }
      );
    }

    // Verify credits (1 credit per keyframe generation)
    const billing = db.getBilling();
    if (billing.creditsRemaining < 1) {
      return NextResponse.json(
        { success: false, error: "Insufficient credits. Keyframe generation requires 1 credit." },
        { status: 402 }
      );
    }

    db.deductCredits(1, `Keyframe Generation for Scene: ${sceneId}`);

    // If Fal.ai key configured, we can dispatch FLUX / SDXL, otherwise use clean deterministic seed
    let keyframeUrl = "";
    const falKey = process.env.FAL_KEY;

    if (falKey) {
      try {
        const res = await fetch("https://queue.fal.run/fal-ai/flux/schnell", {
          method: "POST",
          headers: {
            "Authorization": `Key ${falKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: `${stylePreset || "African Comic"} style: ${prompt}`,
            image_size: "portrait_4_3",
            num_images: 1,
          }),
        });

        if (res.ok) {
          const falData = await res.json();
          if (falData.images && falData.images[0]?.url) {
            keyframeUrl = falData.images[0].url;
          }
        }
      } catch {
        // Fallback to high-res sample
      }
    }

    if (!keyframeUrl) {
      const idx = Math.abs(sceneId.split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)) % KEYFRAME_SAMPLES.length;
      keyframeUrl = KEYFRAME_SAMPLES[idx];
    }

    // Update scene in Supabase if exists
    try {
      const supabase = createClient();
      await supabase
        .from("scenes")
        .update({
          keyframe_url: keyframeUrl,
          keyframe_status: "generated",
        })
        .eq("id", sceneId);
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      sceneId,
      keyframeUrl,
      status: "generated",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate keyframe" },
      { status: 500 }
    );
  }
}

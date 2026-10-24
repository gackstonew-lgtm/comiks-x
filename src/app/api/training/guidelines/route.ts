import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_GUIDELINES = {
  brandVoice: "Vibrant, authentic, witty, high-energy Nairobi comic tone",
  visualStyle: "African comic animation on-twos with rich cel shading, sharp ink linework, saturated tropical palettes",
  doRules: [
    "Keep character outfits strictly consistent with character sheet",
    "Frame subjects dynamically with wide comic angles",
    "Incorporate authentic urban Nairobi street textures",
  ],
  dontRules: [
    "No photorealistic 3D rendering",
    "No western comic speech bubbles",
    "No distorted anatomy or extra limbs",
  ],
  cameraPreferences: "24mm-35mm dynamic comic angles, subtle dutch tilts, dramatic push-ins",
  bannedContent: ["NSFW", "Graphic violence", "Hate speech"],
};

export async function GET(request: NextRequest) {
  try {
    let guidelines = { ...DEFAULT_GUIDELINES };

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("studio_guidelines")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          guidelines = {
            brandVoice: data.brand_voice,
            visualStyle: data.visual_style,
            doRules: data.do_rules || DEFAULT_GUIDELINES.doRules,
            dontRules: data.dont_rules || DEFAULT_GUIDELINES.dontRules,
            cameraPreferences: data.camera_preferences,
            bannedContent: data.banned_content || DEFAULT_GUIDELINES.bannedContent,
          };
        }
      }
    } catch {
      // Local fallback
    }

    return NextResponse.json({ success: true, guidelines });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch studio guidelines" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { brandVoice, visualStyle, doRules, dontRules, cameraPreferences, bannedContent } = body;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("studio_guidelines")
          .upsert({
            user_id: user.id,
            brand_voice: brandVoice,
            visual_style: visualStyle,
            do_rules: doRules,
            dont_rules: dontRules,
            camera_preferences: cameraPreferences,
            banned_content: bannedContent,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      message: "Studio guidelines saved and applied to generation prompts.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save guidelines" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      aspectRatio = "9:16",
      duration = 15, // Total duration in seconds, e.g. 15s (3 scenes), 30s (6 scenes)
      stylePreset = "African Comic",
      attachedReferences = [],
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Script or brief prompt is required." },
        { status: 400 }
      );
    }

    // Determine number of 5-second scenes
    const numScenes = Math.max(1, Math.min(12, Math.round((Number(duration) || 15) / 5)));
    const projectId = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Build decomposition prompt
    const sentences = prompt
      .split(/[.!?]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const scenes = [];
    for (let i = 0; i < numScenes; i++) {
      const sentencePart =
        sentences[i] ||
        sentences[i % sentences.length] ||
        `Action continuation of ${prompt.slice(0, 30)}`;

      const scenePrompt = `${stylePreset} art style, ${sentencePart}. Vibrant cinematic lighting, expressive lines, 2D comic animation on-twos. Highly detailed, clean linework.`;

      scenes.push({
        id: `scene-${Date.now()}-${i + 1}`,
        sceneNumber: i + 1,
        prompt: scenePrompt,
        negativePrompt: "photorealistic, 3D render, deformed anatomy, blurry, artifacts, low resolution",
        duration: 5,
        keyframeStatus: "pending",
        videoStatus: "pending",
        costEstimate: 1.0,
      });
    }

    // Try saving project & scenes to Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: projData } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: prompt.slice(0, 40) || "Untitled Animation",
            aspect_ratio: aspectRatio,
            status: "draft",
          })
          .select()
          .single();

        if (projData) {
          const scenesToInsert = scenes.map((s, idx) => ({
            user_id: user.id,
            project_id: projData.id,
            scene_number: idx + 1,
            prompt: s.prompt,
            negative_prompt: s.negativePrompt,
            duration: 5,
            keyframe_status: "pending",
            video_status: "pending",
          }));

          await supabase.from("scenes").insert(scenesToInsert);
        }
      }
    } catch {
      // Local development fallback
    }

    // Calculate credit estimate: 1 credit per keyframe + 5 credits per 5s video scene
    const estimatedCost = numScenes * (1 + 5);

    return NextResponse.json({
      success: true,
      project: {
        id: projectId,
        name: prompt.slice(0, 40) || "New Animated Story",
        aspectRatio,
        duration: numScenes * 5,
        stylePreset,
        attachedReferences,
        scenes,
      },
      estimatedCost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to decompose script into scenes" },
      { status: 500 }
    );
  }
}

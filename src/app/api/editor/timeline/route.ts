import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    let timelineData = null;

    if (projectId) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("projects")
            .select("timeline_data, name, aspect_ratio")
            .eq("id", projectId)
            .eq("user_id", user.id)
            .single();

          if (data && data.timeline_data) {
            timelineData = data.timeline_data;
          }
        }
      } catch {
        // Fallback
      }
    }

    if (!timelineData) {
      // Default empty timeline
      timelineData = {
        aspectRatio: "9:16",
        resolution: "1080p",
        clips: [],
        bgMusic: { volume: 0.5, ducking: true },
        watermark: { enabled: true, opacity: 0.85, position: "top-right" },
        captions: [],
      };
    }

    return NextResponse.json({ success: true, timeline: timelineData });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load timeline" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, timeline } = body;

    if (!timeline) {
      return NextResponse.json(
        { success: false, error: "Timeline data is required" },
        { status: 400 }
      );
    }

    // Autosave to Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && projectId) {
        await supabase
          .from("projects")
          .update({
            timeline_data: timeline,
            updated_at: new Date().toISOString(),
          })
          .eq("id", projectId)
          .eq("user_id", user.id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to autosave timeline" },
      { status: 500 }
    );
  }
}

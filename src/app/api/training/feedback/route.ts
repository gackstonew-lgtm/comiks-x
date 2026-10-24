import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_FEEDBACK = [
  {
    id: "fb-1",
    generationId: "gen-sample-1",
    rating: "thumbs_up",
    note: "Great dynamic lighting on the matatu interior. Cel shading matches the comic style perfectly.",
    errorTags: [],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "fb-2",
    generationId: "gen-sample-2",
    rating: "thumbs_down",
    note: "Character jacket changed from dark green to black leather during movement.",
    errorTags: ["style", "face"],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export async function GET() {
  try {
    let feedback = [...DEFAULT_FEEDBACK];

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("generation_feedback")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (data && data.length > 0) {
          feedback = data.map((item) => ({
            id: item.id,
            generationId: item.generation_id,
            rating: item.rating,
            note: item.note,
            errorTags: item.error_tags || [],
            createdAt: item.created_at,
          }));
        }
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { generationId, rating, note, errorTags = [] } = body;

    if (!rating || !["thumbs_up", "thumbs_down"].includes(rating)) {
      return NextResponse.json(
        { success: false, error: "Valid rating ('thumbs_up' or 'thumbs_down') is required." },
        { status: 400 }
      );
    }

    const feedbackId = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("generation_feedback").insert({
          id: feedbackId.startsWith("fb-") ? undefined : feedbackId,
          user_id: user.id,
          generation_id: generationId,
          rating,
          note,
          error_tags: errorTags,
        });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      success: true,
      feedback: {
        id: feedbackId,
        generationId,
        rating,
        note,
        errorTags,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

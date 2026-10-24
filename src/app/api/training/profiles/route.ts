import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

const DEFAULT_PROFILES = [
  {
    id: "profile-brian",
    name: "Brian Otieno",
    description: "22-year-old Kenyan software developer, sharp observant eyes, dreadlocks tied back, athletic build.",
    wardrobeAnchor: "Signature dark green safari tech jacket with front zip, black tee, dark denim jeans, white sneakers.",
    visualAnchors: ["green tech jacket", "neat dreadlocks", "silver stud earring"],
    referenceImageUrls: ["https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop"],
    notes: "Main protagonist. Must maintain consistent tech jacket across all scenes.",
  },
  {
    id: "profile-amina",
    name: "Amina Hassan",
    description: "24-year-old creative producer & digital artist, confident demeanor, natural afro puffs, stylish glasses.",
    wardrobeAnchor: "Oversized mustard corduroy overshirt, graphic comic tee, wide-leg beige trousers.",
    visualAnchors: ["mustard corduroy overshirt", "round tortoiseshell glasses"],
    referenceImageUrls: ["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop"],
    notes: "Lead director character. Energetic gestures and expressive eyebrows.",
  },
];

export async function GET(request: NextRequest) {
  try {
    let profiles = [...DEFAULT_PROFILES];

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("character_profiles")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          profiles = data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            wardrobeAnchor: item.wardrobe_anchor,
            visualAnchors: item.visual_anchors || [],
            referenceImageUrls: item.reference_image_urls || [],
            notes: item.notes,
          }));
        }
      }
    } catch {
      // Local fallback
    }

    return NextResponse.json({ success: true, profiles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch character profiles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, wardrobeAnchor, visualAnchors = [], referenceImageUrls = [], notes } = body;

    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: "Name and description are required for a profile." },
        { status: 400 }
      );
    }

    const profileId = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProfile = {
      id: profileId,
      name,
      description,
      wardrobeAnchor,
      visualAnchors,
      referenceImageUrls,
      notes,
    };

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("character_profiles").insert({
          id: profileId.startsWith("profile-") ? undefined : profileId,
          user_id: user.id,
          name,
          description,
          wardrobe_anchor: wardrobeAnchor,
          visual_anchors: visualAnchors,
          reference_image_urls: referenceImageUrls,
          notes,
        });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, profile: newProfile });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create character profile" },
      { status: 500 }
    );
  }
}

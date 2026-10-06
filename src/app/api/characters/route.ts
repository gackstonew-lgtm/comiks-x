import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ComicPromptEngine } from "@/lib/prompt-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get("seriesId") || undefined;
    const list = db.getCharacters(seriesId);
    return NextResponse.json({ success: true, data: list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.seriesId) {
      return NextResponse.json({ success: false, error: "Name and seriesId are required." }, { status: 400 });
    }

    const series = db.getSeriesById(body.seriesId);
    const artStyle = series?.artStyle || "African Comic";

    // Auto-generate character prompt if not provided
    const characterPrompt =
      body.characterPrompt ||
      `${artStyle} art style, ${body.name}, ${body.age} years old, ${body.skinTone} skin tone, ${body.hairstyle} hair, wearing signature ${body.clothing}, ${body.appearance}, ${body.personality}, clean cel-shaded comic lineart, high detail keyframe`;

    const negativePrompt =
      body.negativePrompt ||
      "photorealistic, 3d render, blurry, distorted facial features, western superhero proportions, extra limbs, low resolution";

    const created = db.createCharacter({
      seriesId: body.seriesId,
      name: body.name,
      age: body.age || 25,
      personality: body.personality || "Determined and expressive",
      appearance: body.appearance || "Expressive eyes, distinct facial features",
      clothing: body.clothing || "Modern urban clothing",
      hairstyle: body.hairstyle || "Neat tapered fade",
      skinTone: body.skinTone || "Warm bronze brown",
      bodyType: body.bodyType || "Athletic build",
      voice: body.voice || {
        voiceId: "ke-custom",
        provider: "elevenlabs",
        accent: "Kenyan English",
        gender: "male",
        ageBracket: "young-adult",
        tone: "Energetic",
        speed: 1.0,
        pitch: 1.0,
      },
      accent: body.accent || "Kenyan English",
      speechStyle: body.speechStyle || "Natural urban conversation",
      characterDescription: body.characterDescription || "",
      referenceImages: body.referenceImages || [],
      characterPrompt,
      negativePrompt,
      isLocked: body.isLocked ?? false,
      characterSheetUrl: body.characterSheetUrl || undefined,
      avatarUrl: body.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { audioDubbingStudio } from "@/lib/audio-studio";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { characterId, originalText, targetLanguage = "sheng" } = body;

    if (!characterId || !originalText) {
      return NextResponse.json({ success: false, error: "characterId and originalText are required" }, { status: 400 });
    }

    const char = db.getCharacterById(characterId);
    if (!char) return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });

    const dubbed = await audioDubbingStudio.generateDubbedTrack(char, originalText, targetLanguage);

    return NextResponse.json({ success: true, data: dubbed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

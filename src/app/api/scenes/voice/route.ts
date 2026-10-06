import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VoiceProvider } from "@/lib/providers/voice-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { characterId, text, language = "en" } = body;

    if (!characterId || !text) {
      return NextResponse.json({ success: false, error: "characterId and text are required" }, { status: 400 });
    }

    const char = db.getCharacterById(characterId);
    if (!char) {
      return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
    }

    const settings = db.getSettings();
    const voiceProvider = new VoiceProvider(settings.elevenlabsApiKey, settings.openaiApiKey);

    const result = await voiceProvider.generateSpeech({
      character: char,
      text,
      language,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

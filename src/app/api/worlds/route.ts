import { NextResponse } from "next/server";
import { worldBuilder, localizationEngine } from "@/lib/world";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get("seriesId") || "series-nairobi-01";

    const world = worldBuilder.getOrCreateDefaultWorld(seriesId);
    const glossary = localizationEngine.getGlossary();

    return NextResponse.json({ success: true, world, glossary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { text, characterRole } = await req.json();
    const result = localizationEngine.analyzeAndEnhanceDialogue(text || "", characterRole || "Protagonist");
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}


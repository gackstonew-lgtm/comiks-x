import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StoryLlmProvider } from "@/lib/providers/story-llm-provider";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { seriesId, mode = "idea", promptContent, targetDurationMinutes = 30 } = body;

    if (!seriesId || !promptContent) {
      return NextResponse.json(
        { success: false, error: "seriesId and promptContent are required." },
        { status: 400 }
      );
    }

    const series = db.getSeriesById(seriesId);
    if (!series) {
      return NextResponse.json({ success: false, error: "Series not found" }, { status: 404 });
    }

    const characters = db.getCharacters(seriesId);
    const locations = db.getLocations(seriesId);

    const settings = db.getSettings();
    const storyProvider = new StoryLlmProvider(settings.geminiApiKey, settings.openaiApiKey);

    const episodeDraft = await storyProvider.generateEpisodeStructure({
      series,
      characters,
      locations,
      mode,
      promptContent,
      targetDurationMinutes,
    });

    const createdEpisode = db.createEpisode(episodeDraft);

    return NextResponse.json({ success: true, data: createdEpisode });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

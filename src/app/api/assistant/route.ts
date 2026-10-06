import { NextResponse } from "next/server";
import { creatorPlatform } from "@/lib/creator-platform";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, episodeId, seriesId } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: "query is required" }, { status: 400 });
    }

    const currentEp = episodeId ? db.getEpisodeById(episodeId) : db.getEpisodes()[0];
    const currentSeries = seriesId ? db.getSeriesById(seriesId) : db.getSeries()[0];

    const result = await creatorPlatform.handleAssistantQuery(query, currentEp, currentSeries);

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

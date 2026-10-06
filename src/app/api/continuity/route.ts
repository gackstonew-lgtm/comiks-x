import { NextResponse } from "next/server";
import { continuityEngine } from "@/lib/continuity";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId") || "ep-01-the-pitch";

    const ep = db.getEpisodeById(episodeId);
    if (!ep) return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });

    const series = db.getSeriesById(ep.seriesId);
    const characters = series ? db.getCharacters(series.id) : db.getCharacters();

    const report = continuityEngine.verifyEpisodeContinuity(
      ep.id,
      ep.scenes,
      characters,
      series || ({} as any)
    );

    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, warningId } = body;

    const ep = db.getEpisodeById(episodeId);
    if (!ep) return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });

    const series = db.getSeriesById(ep.seriesId);
    const characters = series ? db.getCharacters(series.id) : db.getCharacters();

    const report = continuityEngine.verifyEpisodeContinuity(
      ep.id,
      ep.scenes,
      characters,
      series || ({} as any)
    );

    const targetWarning = report.warnings.find((w) => w.id === warningId);
    if (targetWarning) {
      const scene = ep.scenes.find((s) => s.sceneNumber === targetWarning.sceneNumber);
      if (scene) {
        continuityEngine.applyFix(targetWarning, scene, characters);
      }
    }

    return NextResponse.json({ success: true, message: "Continuity fix applied successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

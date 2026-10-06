import { NextResponse } from "next/server";
import { aiDirector, motionLibrary } from "@/lib/director";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sceneId = searchParams.get("sceneId");
    const episodeId = searchParams.get("episodeId");

    const presets = motionLibrary.getPresets();

    if (!sceneId || !episodeId) {
      return NextResponse.json({ success: true, motionPresets: presets });
    }

    const scene = db.getSceneById(episodeId, sceneId);
    if (!scene) {
      return NextResponse.json({ success: false, error: "Scene not found" }, { status: 404 });
    }

    const ep = db.getEpisodeById(episodeId);
    const series = ep ? db.getSeriesById(ep.seriesId) : undefined;
    const characters = series ? db.getCharacters(series.id) : db.getCharacters();

    const shots = aiDirector.planSceneShots(scene, series || ({} as any), characters);

    return NextResponse.json({ success: true, shots, motionPresets: presets });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, sceneId } = body;

    const scene = db.getSceneById(episodeId, sceneId);
    if (!scene) return NextResponse.json({ success: false, error: "Scene not found" }, { status: 404 });

    const ep = db.getEpisodeById(episodeId);
    const series = ep ? db.getSeriesById(ep.seriesId) : undefined;
    const characters = series ? db.getCharacters(series.id) : db.getCharacters();

    const shots = aiDirector.planSceneShots(scene, series || ({} as any), characters);
    db.updateScene(episodeId, sceneId, { shots });

    return NextResponse.json({ success: true, shots });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

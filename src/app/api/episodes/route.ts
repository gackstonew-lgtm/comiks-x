import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const seriesId = searchParams.get("seriesId") || undefined;
    const list = db.getEpisodes(seriesId);
    return NextResponse.json({ success: true, data: list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.seriesId) {
      return NextResponse.json({ success: false, error: "Title and seriesId are required" }, { status: 400 });
    }

    const created = db.createEpisode({
      seriesId: body.seriesId,
      episodeNumber: body.episodeNumber || 1,
      title: body.title,
      logline: body.logline || "",
      synopsis: body.synopsis || "",
      targetDurationMinutes: body.targetDurationMinutes || 30,
      actualDurationSeconds: body.actualDurationSeconds || 0,
      status: body.status || "draft",
      charactersInvolved: body.charactersInvolved || [],
      threeActStructure: body.threeActStructure || {
        beginning: "",
        conflict: "",
        escalation: "",
        climax: "",
        resolution: "",
        endingHook: "",
      },
      chapters: body.chapters || [],
      scenes: body.scenes || [],
      progressPercent: 0,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

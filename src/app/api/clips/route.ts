import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SocialClipExtractor } from "@/lib/clips";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId") || undefined;
    const clips = db.getSocialClips(episodeId);
    return NextResponse.json({ success: true, data: clips });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, platformFocus = "all" } = body;

    if (!episodeId) {
      return NextResponse.json({ success: false, error: "episodeId is required" }, { status: 400 });
    }

    const episode = db.getEpisodeById(episodeId);
    if (!episode) {
      return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });
    }

    const extracted = SocialClipExtractor.extractViralClips({
      episode,
      platformFocus,
    });

    // Save extracted clips to db
    const saved = extracted.map((c) => db.createSocialClip(c));

    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ComicPromptEngine } from "@/lib/prompt-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId") || undefined;
    const thumbs = db.getThumbnails(episodeId);
    return NextResponse.json({ success: true, data: thumbs });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, action, thumbnailId } = body;

    if (!episodeId) {
      return NextResponse.json({ success: false, error: "episodeId is required" }, { status: 400 });
    }

    if (action === "select" && thumbnailId) {
      db.selectThumbnail(episodeId, thumbnailId);
      return NextResponse.json({ success: true, message: "Thumbnail selected" });
    }

    // Auto-generate multiple high-contrast concepts
    const ep = db.getEpisodeById(episodeId);
    if (!ep) return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });

    const series = db.getSeriesById(ep.seriesId);
    if (!series) return NextResponse.json({ success: false, error: "Series not found" }, { status: 404 });

    const characters = db.getCharacters(series.id);
    const char = characters[0] || { name: "Protagonist", appearance: "expressive" };

    const concept1 = db.createThumbnail({
      episodeId,
      title: `${ep.title} - Reaction Shock`,
      conceptPrompt: ComicPromptEngine.compileThumbnailPrompt(series, ep.title, char as any, series.artStyle),
      focalCharacterName: char.name,
      facialExpression: "Exaggerated shock / comedic panic",
      composition: "Dramatic Dutch angle close-up with neon comic rim light",
      contrastStyle: "High contrast electric amber & deep midnight blue",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
      isSelected: true,
    });

    const concept2 = db.createThumbnail({
      episodeId,
      title: `${ep.title} - Climax Showdown`,
      conceptPrompt: `${series.artStyle} comic cover, split diagonal layout, character in high stakes sprint vs approaching deadline, bold impact title typography`,
      focalCharacterName: char.name,
      facialExpression: "Intense focus and sweat beads",
      composition: "Dynamic horizontal action cut",
      contrastStyle: "Vibrant cyan pop on black ink halftone",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
      isSelected: false,
    });

    return NextResponse.json({ success: true, data: [concept1, concept2] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

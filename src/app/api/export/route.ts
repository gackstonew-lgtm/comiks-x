import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EpisodeExportBuilder } from "@/lib/export";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId");
    const format = searchParams.get("format") || "manifest"; // "manifest" | "srt" | "vtt" | "chapters"
    const resolution = (searchParams.get("resolution") as "720p" | "1080p") || "1080p";

    if (!episodeId) {
      return NextResponse.json({ success: false, error: "episodeId is required" }, { status: 400 });
    }

    const episode = db.getEpisodeById(episodeId);
    if (!episode) {
      return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });
    }

    if (format === "srt") {
      const srt = EpisodeExportBuilder.generateSrt(episode.scenes);
      return new NextResponse(srt, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${episode.title.replace(/\s+/g, "_")}.srt"`,
        },
      });
    }

    if (format === "vtt") {
      const vtt = EpisodeExportBuilder.generateVtt(episode.scenes);
      return new NextResponse(vtt, {
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Content-Disposition": `attachment; filename="${episode.title.replace(/\s+/g, "_")}.vtt"`,
        },
      });
    }

    if (format === "chapters") {
      const chaptersText = EpisodeExportBuilder.generateChapterList(episode);
      return NextResponse.json({ success: true, chapters: chaptersText });
    }

    // Default: build assembly manifest
    const manifest = EpisodeExportBuilder.buildAssemblyManifest(episode, resolution);
    return NextResponse.json({ success: true, data: manifest });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

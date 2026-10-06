import { NextResponse } from "next/server";
import { derivativesGenerator } from "@/lib/social-director";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId") || "ep-01-the-pitch";

    const ep = db.getEpisodeById(episodeId);
    if (!ep) return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });

    const bundle = derivativesGenerator.generateDerivativesBundle(ep);

    return NextResponse.json({ success: true, bundle });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

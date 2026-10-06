import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const list = db.getSeries();
    return NextResponse.json({ success: true, data: list });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: "Series title is required." }, { status: 400 });
    }

    const created = db.createSeries({
      title: body.title,
      description: body.description || "",
      genre: body.genre || "Animation / Comic Drama",
      artStyle: body.artStyle || "African Comic",
      isStyleLocked: body.isStyleLocked ?? true,
      mainCharacterIds: body.mainCharacterIds || [],
      supportingCharacterIds: body.supportingCharacterIds || [],
      locationIds: body.locationIds || [],
      worldRules: body.worldRules || [],
      voiceProfilesSummary: body.voiceProfilesSummary || "",
      visualReferences: body.visualReferences || [],
      brandIdentity: body.brandIdentity || {
        tagline: "Epic Comic Animation",
        outroHook: "Follow on TikTok @ComiksX",
        primaryColor: "#f59e0b",
        secondaryColor: "#06b6d4",
        fontStyle: "Bangers",
      },
      episodeCount: 0,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

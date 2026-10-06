import { NextResponse } from "next/server";
import { queueManager } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, sceneId } = body;

    if (!episodeId || !sceneId) {
      return NextResponse.json({ success: false, error: "episodeId and sceneId are required." }, { status: 400 });
    }

    const job = await queueManager.regenerateSingleScene(episodeId, sceneId);

    return NextResponse.json({ success: true, data: job });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

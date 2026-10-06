import { NextResponse } from "next/server";
import { queueManager } from "@/lib/queue";
import { db } from "@/lib/db";
import { CostManager } from "@/lib/cost";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json({ success: false, error: "episodeId is required" }, { status: 400 });
    }

    const progress = queueManager.getProgress(episodeId);
    const scenes = db.getScenes(episodeId);
    const settings = db.getSettings();
    const costEstimate = CostManager.calculateEpisodeEstimate(scenes, settings.activeProvider);

    return NextResponse.json({
      success: true,
      data: {
        progress,
        costEstimate,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { episodeId, action, sceneId } = body;

    if (!episodeId || !action) {
      return NextResponse.json({ success: false, error: "episodeId and action are required." }, { status: 400 });
    }

    switch (action) {
      case "start": {
        const state = await queueManager.startEpisodeGeneration(episodeId);
        return NextResponse.json({ success: true, data: state });
      }
      case "pause": {
        const state = queueManager.pauseQueue(episodeId);
        return NextResponse.json({ success: true, data: state });
      }
      case "resume": {
        const state = await queueManager.startEpisodeGeneration(episodeId);
        return NextResponse.json({ success: true, data: state });
      }
      case "cancel": {
        const state = queueManager.cancelQueue(episodeId);
        return NextResponse.json({ success: true, data: state });
      }
      case "retry": {
        if (!sceneId) {
          return NextResponse.json({ success: false, error: "sceneId required for retry action." }, { status: 400 });
        }
        const job = await queueManager.retryFailedScene(episodeId, sceneId);
        return NextResponse.json({ success: true, data: job });
      }
      default:
        return NextResponse.json({ success: false, error: "Unknown queue action." }, { status: 400 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

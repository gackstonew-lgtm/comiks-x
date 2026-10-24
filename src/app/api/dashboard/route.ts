import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const seriesList = db.getSeries();
    const episodes = db.getEpisodes();
    const characters = db.getCharacters();
    const jobs = db.getGenerationJobs();
    const billing = db.getBillingAccount();
    const assets = await db.getAssets();

    return NextResponse.json({
      success: true,
      seriesList,
      episodes,
      characters,
      jobs,
      billing,
      assets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, jobId } = body;

    if (action === "retry_job" && jobId) {
      db.updateJobStatus(jobId, "queued", 10);
      const jobs = db.getGenerationJobs();
      return NextResponse.json({ success: true, jobs });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to execute dashboard action" },
      { status: 500 }
    );
  }
}

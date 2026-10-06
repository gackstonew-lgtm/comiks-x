import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const ep = db.getEpisodeById(params.id);
    if (!ep) {
      return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: ep });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = db.updateEpisode(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Episode not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

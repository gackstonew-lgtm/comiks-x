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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const success = db.deleteEpisode(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: "Episode not found or could not be deleted" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Episode and associated media deleted successfully" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

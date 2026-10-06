import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ComicPromptEngine } from "@/lib/prompt-engine";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const char = db.getCharacterById(params.id);
    if (!char) {
      return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: char });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = db.updateCharacter(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const success = db.deleteCharacter(params.id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const action = body.action;

    if (action === "duplicate") {
      const duplicated = db.duplicateCharacter(params.id);
      return NextResponse.json({ success: true, data: duplicated });
    }

    if (action === "generate_sheet_prompt") {
      const char = db.getCharacterById(params.id);
      if (!char) return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
      const series = db.getSeriesById(char.seriesId);
      const prompt = ComicPromptEngine.compileCharacterSheetPrompt(char, series?.artStyle || "African Comic");
      return NextResponse.json({ success: true, prompt });
    }

    if (action === "lock_toggle") {
      const char = db.getCharacterById(params.id);
      if (!char) return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
      const updated = db.updateCharacter(params.id, { isLocked: !char.isLocked });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

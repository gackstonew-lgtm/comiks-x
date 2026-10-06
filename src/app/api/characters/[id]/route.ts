import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ComicPromptEngine } from "@/lib/prompt-engine";
import { CharacterOperatingSystem } from "@/lib/character-os";

const charOS = CharacterOperatingSystem.getInstance();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    let char = db.getCharacterById(params.id);
    if (!char) {
      return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
    }
    char = charOS.ensureCharacterDNA(char);
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
    const fullyFormed = charOS.ensureCharacterDNA(updated);
    return NextResponse.json({ success: true, data: fullyFormed });
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

    if (action === "add_memory") {
      const { description, type, significance } = body;
      const mem = charOS.addMemory(params.id, {
        description: description || "New memory",
        type: type || "event",
        significance: significance || "minor",
      });
      const updated = db.getCharacterById(params.id);
      return NextResponse.json({ success: true, data: updated, memory: mem });
    }

    if (action === "add_reference") {
      const { label, type, imageUrl, cameraAngle, isPrimary } = body;
      const ref = charOS.addReference(params.id, {
        label: label || "New Reference",
        type: (type as any) || "identity",
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
        cameraAngle: cameraAngle || "front",
        isPrimary: !!isPrimary,
      });
      const updated = db.getCharacterById(params.id);
      return NextResponse.json({ success: true, data: updated, reference: ref });
    }

    if (action === "request_override") {
      const { level, entityId, attribute, overrideValue, justification, approvedBy } = body;
      const override = charOS.requestLockOverride({
        level: level || "character",
        entityId: entityId || params.id,
        attribute: attribute || "wardrobe",
        overrideValue: overrideValue || "",
        justification: justification || "Story requirement for episode",
        approvedBy: approvedBy || "Creator",
      });
      const updated = db.getCharacterById(params.id);
      return NextResponse.json({ success: true, data: updated, override });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}


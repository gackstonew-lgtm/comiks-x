import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("type"); // all | video | image | audio | turnaround

    const series = await db.getSeries();
    const assets = await db.getAssets(filter === "all" || !filter ? undefined : (filter as any));

    return NextResponse.json({
      success: true,
      series,
      assets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, genre, defaultAspectRatio } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Project name is required" }, { status: 400 });
    }

    const project = await db.createSeries({
      title: name,
      logline: description || "",
      genre: genre || "comedy",
      defaultAspectRatio: defaultAspectRatio || "9:16",
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create project" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId");
    const seriesId = searchParams.get("seriesId");

    if (assetId) {
      const ok = await db.deleteAsset(assetId);
      return NextResponse.json({ success: ok });
    }

    if (seriesId) {
      const ok = await db.deleteSeries(seriesId);
      return NextResponse.json({ success: ok });
    }

    return NextResponse.json({ success: false, error: "Missing ID to delete" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete" },
      { status: 500 }
    );
  }
}

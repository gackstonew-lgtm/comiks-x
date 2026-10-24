import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const brandKit = await db.getBrandKit();
    return NextResponse.json({ success: true, brandKit });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch brand kit" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.updateBrandKit(body);
    return NextResponse.json({ success: true, brandKit: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update brand kit" },
      { status: 500 }
    );
  }
}

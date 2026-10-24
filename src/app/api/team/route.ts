import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const team = await db.getTeamWorkspace();
    return NextResponse.json({ success: true, team });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch team workspace" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "invite", name, email, role = "editor", memberId } = body;

    if (action === "invite") {
      if (!email || !name) {
        return NextResponse.json(
          { success: false, error: "Name and email are required" },
          { status: 400 }
        );
      }
      const member = await db.addTeamMember({ name, email, role });
      const team = await db.getTeamWorkspace();
      return NextResponse.json({ success: true, member, team });
    }

    if (action === "update_role") {
      if (!memberId || !role) {
        return NextResponse.json(
          { success: false, error: "Member ID and role are required" },
          { status: 400 }
        );
      }
      const ok = await db.updateTeamMemberRole(memberId, role);
      const team = await db.getTeamWorkspace();
      return NextResponse.json({ success: ok, team });
    }

    return NextResponse.json({ success: false, error: "Invalid team action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to modify team" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) {
      return NextResponse.json({ success: false, error: "Missing memberId" }, { status: 400 });
    }
    const ok = await db.removeTeamMember(memberId);
    const team = await db.getTeamWorkspace();
    return NextResponse.json({ success: ok, team });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}

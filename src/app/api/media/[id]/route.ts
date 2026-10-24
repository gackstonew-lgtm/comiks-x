import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, tags, projectId } = body;

    // Update in Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updatePayload: Record<string, any> = {};
        if (name !== undefined) updatePayload.name = name;
        if (tags !== undefined) updatePayload.tags = tags;
        if (projectId !== undefined) updatePayload.project_id = projectId;

        await supabase
          .from("media_assets")
          .update(updatePayload)
          .eq("id", id)
          .eq("user_id", user.id);
      }
    } catch {
      // Fallback
    }

    // Update in local DB store
    const updatePayload: Partial<any> = {};
    if (name) {
      updatePayload.name = name;
      updatePayload.title = name;
    }
    if (tags) updatePayload.tags = tags;
    if (projectId !== undefined) updatePayload.projectId = projectId;

    const target = db.updateAsset(id, updatePayload);

    return NextResponse.json({ success: true, asset: target });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete in Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("media_assets")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
      }
    } catch {
      // Fallback
    }

    // Delete in local DB
    db.deleteAsset(id);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete asset" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_RULES = [
  {
    id: "rule-1",
    ruleText: "Lock wardrobe anchor: Brian Otieno must wear dark green safari tech jacket with front zip, never leather.",
    category: "style",
    status: "pinned",
    source: "distilled_feedback",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "rule-2",
    ruleText: "Fast camera motion: Limit pan speeds during character dialogue to prevent facial morphing artifacts.",
    category: "motion",
    status: "approved",
    source: "distilled_feedback",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "rule-3",
    ruleText: "Maintain authentic Nairobi urban color palette: saturated violet, cyan neon, and warm evening golden hour sunlight.",
    category: "general",
    status: "approved",
    source: "guidelines",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export async function GET() {
  try {
    let rules = [...DEFAULT_RULES];

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("learned_rules")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          rules = data.map((item) => ({
            id: item.id,
            ruleText: item.rule_text,
            category: item.category,
            status: item.status,
            source: item.source,
            createdAt: item.created_at,
          }));
        }
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch learned rules" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Rule id and new status are required." },
        { status: 400 }
      );
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("learned_rules")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", user.id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, id, status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Rule ID is required to delete" },
        { status: 400 }
      );
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("learned_rules")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete rule" },
      { status: 500 }
    );
  }
}

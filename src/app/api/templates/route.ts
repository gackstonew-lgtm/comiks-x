import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const templates = await db.getTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, error: "Template ID is required" }, { status: 400 });
    }

    const template = await db.getTemplateById(templateId);
    if (!template) {
      return NextResponse.json({ success: false, error: "Template not found" }, { status: 404 });
    }

    // Instantiate a new project from template
    const newProject = await db.createSeries({
      title: `${template.title} Project`,
      logline: template.description,
      genre: "comedy",
      defaultAspectRatio: template.aspectRatio,
    });

    return NextResponse.json({
      success: true,
      project: newProject,
      message: `Project created from template "${template.title}"`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to use template" },
      { status: 500 }
    );
  }
}

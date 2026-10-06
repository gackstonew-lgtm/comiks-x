import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { VideoProviderFactory } from "@/lib/providers/provider-factory";

export async function GET() {
  try {
    const settings = db.getSettings();
    const providers = VideoProviderFactory.listProviders();

    // Mask secret keys when returning to frontend for security
    const maskedSettings = {
      activeProvider: settings.activeProvider,
      enableImageToVideo: settings.enableImageToVideo,
      defaultSceneDuration: settings.defaultSceneDuration,
      maxRetries: settings.maxRetries,
      dailyBudgetLimitUsd: settings.dailyBudgetLimitUsd,
      hasLumaKey: Boolean(settings.lumaApiKey || process.env.LUMA_API_KEY),
      hasRunwayKey: Boolean(settings.runwayApiKey || process.env.RUNWAY_API_KEY),
      hasKlingKey: Boolean(settings.klingApiKey || process.env.KLING_API_KEY),
      hasFalKey: Boolean(settings.falApiKey || process.env.FAL_KEY),
      hasOpenaiKey: Boolean(settings.openaiApiKey || process.env.OPENAI_API_KEY),
      hasElevenlabsKey: Boolean(settings.elevenlabsApiKey || process.env.ELEVENLABS_API_KEY),
      hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
    };

    return NextResponse.json({ success: true, settings: maskedSettings, providers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = db.updateSettings(body);
    return NextResponse.json({ success: true, message: "Settings successfully updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

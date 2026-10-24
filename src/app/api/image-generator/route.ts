import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const assets = await db.getAssets("image");
    const characters = await db.getCharacters();

    return NextResponse.json({
      success: true,
      assets,
      characters,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch image generator data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      negativePrompt = "",
      style = "flipaclip-2d", // flipaclip-2d | comic-book | graphic-novel | anime | pixar-3d | cyberpunk
      aspectRatio = "1:1",
      characterId,
      action = "generate", // generate | upscale | remove-bg | turnaround
      imageUrl,
    } = body;

    if (!prompt && action === "generate") {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const cost = action === "upscale" ? 1 : action === "turnaround" ? 4 : 2;

    const billing = await db.getBillingAccount();
    if (billing.creditsRemaining < cost) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient credits. Required: ${cost}, Available: ${billing.creditsRemaining}`,
        },
        { status: 402 }
      );
    }

    await db.deductCredits(
      cost,
      `AI Image (${action}, ${style}, ${aspectRatio})`
    );

    // SVG / placeholder or generated graphic representation
    // To be clean, deterministic and immediate without external broken URLs:
    const seed = Math.floor(Math.random() * 999999);
    const generatedUrl = imageUrl || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;

    const newAsset = await db.createAsset({
      name: prompt ? prompt.slice(0, 36) : `Image ${action}`,
      type: action === "turnaround" ? "turnaround" : "image",
      url: generatedUrl,
      size: action === "upscale" ? "4.2 MB" : "1.8 MB",
      aspectRatio,
      tags: [action, style, aspectRatio, characterId ? "character-anchored" : "freeform"],
    });

    return NextResponse.json({
      success: true,
      asset: newAsset,
      creditsRemaining: billing.creditsRemaining - cost,
      creditsDeducted: cost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}

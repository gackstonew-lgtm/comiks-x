import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clips = [] } = body;

    const generatedCaptions = [];
    let currentSecond = 0;

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const duration = clip.duration || 5;

      generatedCaptions.push({
        id: `cap-${Date.now()}-${i}`,
        startSec: currentSecond,
        endSec: currentSecond + duration,
        text: clip.name || `Shot ${i + 1} narration in authentic Nairobi dialogue`,
      });

      currentSecond += duration;
    }

    return NextResponse.json({
      success: true,
      captions: generatedCaptions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate auto-captions" },
      { status: 500 }
    );
  }
}

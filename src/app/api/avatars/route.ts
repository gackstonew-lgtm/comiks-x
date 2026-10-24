import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const avatars = await db.getAvatars();
    return NextResponse.json({ success: true, avatars });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch avatars" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "create_avatar" } = body;

    if (action === "create_avatar") {
      const {
        name,
        role = "Presenter",
        voiceId = "voice-ke-1",
        avatarType = "custom",
        stylePreset = "comic-vibrant",
        previewUrl,
        consentVerified = false,
      } = body;

      if (!name) {
        return NextResponse.json(
          { success: false, error: "Avatar name is required" },
          { status: 400 }
        );
      }

      if (avatarType === "custom" && !consentVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "Digital likeness consent verification is required before creating custom avatars.",
          },
          { status: 400 }
        );
      }

      const avatar = await db.createAvatar({
        name,
        role,
        voiceId,
        avatarType,
        stylePreset,
        previewUrl: previewUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        consentVerified: Boolean(consentVerified),
      });

      return NextResponse.json({ success: true, avatar });
    }

    if (action === "generate_presenter_video") {
      const {
        avatarId,
        scriptText,
        voiceId,
        background = "studio", // studio | green-screen | transparent | custom
        aspectRatio = "9:16",
      } = body;

      if (!avatarId || !scriptText) {
        return NextResponse.json(
          { success: false, error: "Avatar ID and script text are required" },
          { status: 400 }
        );
      }

      const cost = 6;
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

      await db.deductCredits(cost, `AI Presenter Lip-Sync Video`);

      const videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
      const asset = await db.createAsset({
        name: `Avatar Presenter: ${scriptText.slice(0, 30)}...`,
        type: "video",
        url: videoUrl,
        size: "3.4 MB",
        aspectRatio,
        duration: "8s",
        tags: ["avatar", "presenter", "lip-sync", background],
      });

      return NextResponse.json({
        success: true,
        asset,
        creditsRemaining: billing.creditsRemaining - cost,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process avatar request" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing avatar id" }, { status: 400 });
    }
    const success = await db.deleteAvatar(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete avatar" },
      { status: 500 }
    );
  }
}

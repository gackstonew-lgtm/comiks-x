import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Built-in royalty-free sound effects library
const SFX_LIBRARY = [
  { id: "sfx-punch", name: "Comic Comic Punch", category: "Action", duration: "0.8s", url: "https://actions.google.com/sounds/v1/cartoon/cartoon_punch.ogg" },
  { id: "sfx-whoosh", name: "Fast Whoosh / Cut", category: "Transition", duration: "0.5s", url: "https://actions.google.com/sounds/v1/cartoon/whoosh.ogg" },
  { id: "sfx-boing", name: "Rubber Boing", category: "Comedy", duration: "1.2s", url: "https://actions.google.com/sounds/v1/cartoon/boing.ogg" },
  { id: "sfx-laugh", name: "Audience Chortle", category: "Comedy", duration: "2.5s", url: "https://actions.google.com/sounds/v1/human_voices/applause.ogg" },
  { id: "sfx-reveal", name: "Dramatic Stinger", category: "Suspense", duration: "1.8s", url: "https://actions.google.com/sounds/v1/horror/creepy_violin_scrape.ogg" },
  { id: "sfx-cash", name: "Cash Register Cha-Ching", category: "Comedy", duration: "1.0s", url: "https://actions.google.com/sounds/v1/household/cash_register.ogg" },
];

const MUSIC_TRACKS = [
  { id: "mus-comedy", name: "Nairobi Slapstick Groove", bpm: 124, genre: "Comedy / Bikutsi", duration: "30s", url: "https://actions.google.com/sounds/v1/foley/metal_grate_scrapes.ogg" },
  { id: "mus-urban", name: "Eastlands Gengetone Chill", bpm: 105, genre: "Urban African", duration: "45s", url: "https://actions.google.com/sounds/v1/foley/rolling_barrel.ogg" },
  { id: "mus-action", name: "Cartoon Chase Hustle", bpm: 140, genre: "Upbeat Comic", duration: "28s", url: "https://actions.google.com/sounds/v1/foley/scrapes_and_scratches.ogg" },
];

export async function GET(req: NextRequest) {
  try {
    const assets = await db.getAssets("audio");
    return NextResponse.json({
      success: true,
      sfxLibrary: SFX_LIBRARY,
      musicLibrary: MUSIC_TRACKS,
      recentAudio: assets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audio assets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type = "tts", // tts | music | sfx
      text,
      voice = "sheng-comic-1",
      stability = 0.75,
      speed = 1.0,
      applyShengPhonetics = true,
      duckingDepth = -18,
      loudnessLufs = -14,
    } = body;

    if (type === "tts") {
      if (!text) {
        return NextResponse.json({ success: false, error: "Text is required for TTS" }, { status: 400 });
      }

      // Sheng phonetic translation dictionary demonstration
      let processedText = text;
      if (applyShengPhonetics) {
        processedText = text
          .replace(/\bmambo\b/gi, "mambo")
          .replace(/\bvipi\b/gi, "vee-pee")
          .replace(/\bniaje\b/gi, "nee-ah-jeh")
          .replace(/\bform\b/gi, "fowm")
          .replace(/\bgani\b/gi, "gah-nee")
          .replace(/\bbuda\b/gi, "boo-dah");
      }

      const cost = 1;
      const billing = await db.getBillingAccount();
      if (billing.creditsRemaining < cost) {
        return NextResponse.json(
          { success: false, error: "Insufficient credits for voice generation." },
          { status: 402 }
        );
      }

      await db.deductCredits(cost, `TTS Generation (${voice})`);

      const audioAsset = await db.createAsset({
        name: `VO: ${text.slice(0, 30)}...`,
        type: "audio",
        url: "https://actions.google.com/sounds/v1/human_voices/male_laugh.ogg",
        size: "0.4 MB",
        duration: `${Math.max(2, Math.round(text.split(" ").length * 0.4))}s`,
        tags: ["voiceover", voice, applyShengPhonetics ? "sheng-processed" : "standard"],
      });

      return NextResponse.json({
        success: true,
        asset: audioAsset,
        processedText,
        creditsRemaining: billing.creditsRemaining - cost,
      });
    }

    return NextResponse.json({ success: true, message: "Settings recorded" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process audio request" },
      { status: 500 }
    );
  }
}

import { Character } from "@/types";

export interface OrthogonalTurnaround {
  frontUrl: string;
  threeQuarterUrl: string;
  sideProfileUrl: string;
  backTurnaroundUrl: string;
}

export interface ColorPaletteLock {
  skinToneHex: string;
  hairHex: string;
  primaryWardrobeHex: string;
  secondaryWardrobeHex: string;
  accentHex: string;
  eyeColorHex: string;
}

export interface CharacterBibleSpec {
  characterId: string;
  canonicalName: string;
  turnaround: OrthogonalTurnaround;
  palette: ColorPaletteLock;
  facialAnchors: {
    eyeShape: string;
    noseBridge: string;
    jawline: string;
    distinctiveMarks: string[];
  };
  negativePromptGuardrails: string[];
}

export class CharacterBibleManager {
  private static instance: CharacterBibleManager;

  public static getInstance(): CharacterBibleManager {
    if (!CharacterBibleManager.instance) {
      CharacterBibleManager.instance = new CharacterBibleManager();
    }
    return CharacterBibleManager.instance;
  }

  /**
   * Derives or creates a standardized Character Bible for strict multi-shot consistency.
   */
  public getOrCreateBible(character: Character): CharacterBibleSpec {
    const defaultTurnaround: OrthogonalTurnaround = {
      frontUrl: character.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
      threeQuarterUrl: character.characterSheetUrl || character.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
      sideProfileUrl: character.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
      backTurnaroundUrl: character.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
    };

    // Extract or assign canonical hex palette
    const palette: ColorPaletteLock = {
      skinToneHex: "#3D2314",
      hairHex: "#111827",
      primaryWardrobeHex: "#15803D", // Signature dark green safari jacket
      secondaryWardrobeHex: "#1F2937",
      accentHex: "#F59E0B",
      eyeColorHex: "#1A1A1A",
    };

    return {
      characterId: character.id,
      canonicalName: character.name,
      turnaround: defaultTurnaround,
      palette,
      facialAnchors: {
        eyeShape: "Almond-shaped expressive comic eyes with defined lids",
        noseBridge: "Broad natural bridge with distinct cel shadow",
        jawline: "Strong angular jawline with clean black ink border",
        distinctiveMarks: [character.appearance || "Signature hairstyle and expressive features"],
      },
      negativePromptGuardrails: [
        "photorealistic",
        "3d render",
        "hyperrealistic",
        "deformed hands",
        "extra fingers",
        "inconsistent clothes",
        "changing face geometry",
        "blurry linework",
      ],
    };
  }

  /**
   * Compiles strict conditioning prompt tags enforcing Character Bible anchors.
   */
  public compileConditioningPrompt(bible: CharacterBibleSpec, actionDescription: string): string {
    const paletteTags = `[HEX LOCK: skin=${bible.palette.skinToneHex}, jacket=${bible.palette.primaryWardrobeHex}]`;
    const facialTags = `[FACE: ${bible.facialAnchors.eyeShape}, ${bible.facialAnchors.jawline}]`;
    return `2D Hand-Drawn Cel Animation, character: ${bible.canonicalName}. ${paletteTags} ${facialTags}. Action: ${actionDescription}. Crisp bold ink outlines, flat comic color fill, studio keyframe.`;
  }
}

export const characterBibleManager = CharacterBibleManager.getInstance();

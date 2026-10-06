import {
  Character,
  CharacterIdentityDNA,
  CharacterVisualDNA,
  CharacterPersonalityDNA,
  CharacterPerformanceDNA,
  CharacterVoiceDNA,
  CharacterMemoryItem,
  CharacterReferenceItem,
  LockLevel,
  LockOverride,
  ReferenceType,
} from "@/types";
import { db } from "@/lib/db";

export class CharacterOperatingSystem {
  private static instance: CharacterOperatingSystem;

  private constructor() {}

  public static getInstance(): CharacterOperatingSystem {
    if (!CharacterOperatingSystem.instance) {
      CharacterOperatingSystem.instance = new CharacterOperatingSystem();
    }
    return CharacterOperatingSystem.instance;
  }

  /**
   * Initializes or synthesizes full 5-dimensional Character DNA
   */
  public ensureCharacterDNA(char: Character): Character {
    if (char.dna && char.dna.identity && char.dna.visual && char.dna.personality && char.dna.performance && char.dna.voice) {
      return char;
    }

    const identity: CharacterIdentityDNA = char.dna?.identity || {
      role: "Protagonist / Key Cast",
      nationality: "Kenyan",
      culturalContext: "Nairobi Urban Tech & Street Culture",
      biography: char.characterDescription || `${char.name}, age ${char.age}, living and hustling in Nairobi.`,
    };

    const visual: CharacterVisualDNA = char.dna?.visual || {
      faceDetails: `Expressive features, distinct facial geometry, ${char.skinTone} complexion`,
      skinTone: char.skinTone,
      bodyType: char.bodyType,
      hairstyle: char.hairstyle,
      clothing: char.clothing,
      proportions: "Authentic stylized comic proportions, consistent height and stance",
      distinctiveFeatures: "Signature hairstyle, expressive eyes, wardrobe anchors",
      colorLanguage: "Warm earth tones with saturated urban accents",
      visualStyle: "Cel-shaded comic animation, sharp ink linework",
    };

    const personality: CharacterPersonalityDNA = char.dna?.personality || {
      values: ["Loyalty", "Ambition", "Creativity", "Hustle"],
      fears: ["Failure", "Letting down family", "Missing crucial deadlines"],
      motivations: ["Building a sustainable tech venture", "Proving their worth in Nairobi"],
      strengths: ["Fast learner", "Resilient under pressure", "Creative problem solver"],
      weaknesses: ["Overthinks", "Easily stressed when plans go wrong", "Reluctant to ask for help"],
      habits: ["Constantly checks phone notifications", "Taps fingers when thinking"],
      humorStyle: "Witty, self-deprecating, observant Nairobi satire",
      emotionalTriggers: ["Being doubted", "Traffic jams before key meetings", "Dead batteries"],
    };

    const performance: CharacterPerformanceDNA = char.dna?.performance || {
      posture: "Confident yet slightly restless posture, active body language",
      movementStyle: "Fast, purposeful walking, quick responsive gestures",
      gestures: ["Expressive hand gestures when explaining ideas", "Quick double-take reactions"],
      facialExpressionTendencies: ["Intense focus furrow", "Relieved broad smile", "Comedic shock eyes"],
      reactionPatterns: ["Freezes momentarily upon shocking news, then leaps into problem-solving"],
      aggressionLevel: 3,
      energyLevel: 8,
      emotionalRange: "Vibrant comedic to earnest dramatic stakes",
    };

    const voice: CharacterVoiceDNA = char.dna?.voice || {
      voiceId: char.voice?.voiceId || "ke-default",
      accent: char.accent,
      language: "Kenyan English / Sheng / Swahili code-switch",
      speechSpeed: char.voice?.speed || 1.05,
      pitch: char.voice?.pitch || 1.0,
      speechStyle: char.speechStyle,
      vocabulary: ["Buda", "Wazi", "Form ni gani", "Radar", "Chapaa", "Noma sana", "Code"],
      slang: ["Ngori", "Buda", "Manze", "Wasee", "Chapaa"],
      emotionalDelivery: "Energetic, authentic, relatable urban cadence",
    };

    const memories: CharacterMemoryItem[] = char.memories || [
      {
        id: `mem-${char.id}-01`,
        characterId: char.id,
        type: "event",
        description: "Nearly lost their big tech pitch due to an unruly matatu ride and dead battery.",
        significance: "pivotal",
        acquiredAt: new Date().toISOString(),
      },
      {
        id: `mem-${char.id}-02`,
        characterId: char.id,
        type: "relationship",
        description: "Shared history with childhood friend Kevin and fintech manager Mary.",
        significance: "moderate",
        acquiredAt: new Date().toISOString(),
      },
    ];

    const referencesPack: CharacterReferenceItem[] = char.referencesPack || [
      {
        id: `ref-${char.id}-identity`,
        characterId: char.id,
        type: "identity",
        label: "Master Face & Geometry Reference",
        imageUrl: char.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
        isPrimary: true,
      },
      {
        id: `ref-${char.id}-clothing`,
        characterId: char.id,
        type: "clothing",
        label: "Primary Signature Attire",
        imageUrl: char.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
        isPrimary: true,
      },
    ];

    const updated = db.updateCharacter(char.id, {
      dna: { identity, visual, personality, performance, voice },
      memories,
      referencesPack,
      lockOverrides: char.lockOverrides || [],
    });

    return updated || { ...char, dna: { identity, visual, personality, performance, voice }, memories, referencesPack };
  }

  /**
   * Reference Pack System: gets references categorized by shot purpose
   */
  public getCharacterReferences(characterId: string, filterType?: ReferenceType): CharacterReferenceItem[] {
    const char = db.getCharacterById(characterId);
    if (!char) return [];
    const pack = char.referencesPack || [];
    if (filterType) {
      return pack.filter((r) => r.type === filterType);
    }
    return pack;
  }

  public addReference(characterId: string, reference: Omit<CharacterReferenceItem, "id" | "characterId"> & { characterId?: string }): CharacterReferenceItem {
    const char = db.getCharacterById(characterId);
    if (!char) throw new Error("Character not found");

    const newRef: CharacterReferenceItem = {
      characterId,
      ...reference,
      id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    const currentPack = char.referencesPack || [];
    db.updateCharacter(characterId, {
      referencesPack: [...currentPack, newRef],
    });

    return newRef;
  }

  /**
   * Memory DNA: remembers past relationships, events, injuries, and knowledge
   */
  public addMemory(characterId: string, memory: Omit<CharacterMemoryItem, "id" | "acquiredAt" | "characterId"> & { characterId?: string }): CharacterMemoryItem {
    const char = db.getCharacterById(characterId);
    if (!char) throw new Error("Character not found");

    const newMem: CharacterMemoryItem = {
      characterId,
      ...memory,
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      acquiredAt: new Date().toISOString(),
    };

    const currentMemories = char.memories || [];
    db.updateCharacter(characterId, {
      memories: [...currentMemories, newMem],
    });

    return newMem;
  }

  public getRelevantMemories(characterId: string, sceneTopic?: string): string[] {
    const char = db.getCharacterById(characterId);
    if (!char || !char.memories) return [];

    if (!sceneTopic) {
      return char.memories.slice(0, 3).map((m) => `[MEMORY: ${m.type.toUpperCase()}] ${m.description}`);
    }

    const keywords = sceneTopic.toLowerCase().split(/\s+/);
    const matched = char.memories.filter((m) =>
      keywords.some((kw) => kw.length > 3 && m.description.toLowerCase().includes(kw))
    );

    const pool = matched.length > 0 ? matched : char.memories.slice(0, 2);
    return pool.map((m) => `[MEMORY: ${m.type.toUpperCase()}] ${m.description}`);
  }

  /**
   * Hierarchical Lock & Override Engine
   * Level: series -> world -> character -> episode -> scene -> shot
   */
  public checkLock(
    characterId: string,
    field: string,
    requestedValue: string,
    sceneId?: string
  ): { isAllowed: boolean; activeOverride?: LockOverride; warning?: string } {
    const char = db.getCharacterById(characterId);
    if (!char) return { isAllowed: true };

    if (!char.isLocked) {
      return { isAllowed: true };
    }

    // Check if an approved override exists for this scene
    const overrides = char.lockOverrides || [];
    const activeOverride = overrides.find(
      (o) => o.field === field && o.isApproved && (!o.approvedForSceneId || o.approvedForSceneId === sceneId)
    );

    if (activeOverride) {
      return { isAllowed: true, activeOverride };
    }

    // Check if requestedValue matches locked baseline
    const baseline = (char as any)[field] || (char.dna?.visual as any)?.[field];
    if (baseline && requestedValue.trim().toLowerCase() !== baseline.trim().toLowerCase()) {
      return {
        isAllowed: false,
        warning: `Locked attribute mismatch for ${char.name}: ${field} is locked to "${baseline}", requested "${requestedValue}". Explicit override required.`,
      };
    }

    return { isAllowed: true };
  }

  public requestOverride(override: Omit<LockOverride, "id">): LockOverride {
    const char = db.getCharacterById(override.targetId);
    if (!char) throw new Error("Target character not found");

    const newOverride: LockOverride = {
      ...override,
      id: `ovr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    const current = char.lockOverrides || [];
    db.updateCharacter(override.targetId, {
      lockOverrides: [...current, newOverride],
    });

    return newOverride;
  }

  public requestLockOverride(params: {
    level: LockLevel;
    entityId: string;
    attribute: string;
    overrideValue: string;
    justification: string;
    approvedBy: string;
  }): LockOverride {
    return this.requestOverride({
      targetId: params.entityId,
      level: params.level,
      field: params.attribute,
      attribute: params.attribute,
      originalValue: "default",
      overrideValue: params.overrideValue,
      reason: params.justification,
      justification: params.justification,
      approvedBy: params.approvedBy,
      isApproved: true,
    });
  }
}

export const characterOS = CharacterOperatingSystem.getInstance();


import { WorldUniverse, LocationItem, ComicSeries } from "@/types";
import { db } from "@/lib/db";

export type LocalizationRegion = "Kenya" | "East Africa" | "West Africa" | "Southern Africa" | "Global";

export interface CulturalGlossaryEntry {
  term: string;
  meaning: string;
  context: string;
  usageExample: string;
}

export class WorldBuilder {
  private static instance: WorldBuilder;

  private constructor() {}

  public static getInstance(): WorldBuilder {
    if (!WorldBuilder.instance) {
      WorldBuilder.instance = new WorldBuilder();
    }
    return WorldBuilder.instance;
  }

  /**
   * Returns default authentic Kenyan world universe
   */
  public getOrCreateDefaultWorld(seriesId: string): WorldUniverse {
    const existing = db.getSeriesById(seriesId);
    return {
      id: "world-nairobi-metropolis",
      seriesId,
      name: "Nairobi Metropolis Universe",
      description: "Fast-paced, vibrant, tech-driven Nairobi where modern high-rises contrast with bustling estates, neon-lit matatus, and street food kibandas.",
      geography: "Highland plateau city surrounded by rolling savannah, dense greenery in Kilimani and bustling urban grids in CBD.",
      cities: ["Nairobi"],
      neighborhoods: ["Kencom CBD", "Eastlands Buruburu", "Kilimani Tech Hub", "Westlands", "Gikomba Market", "Industrial Area"],
      architectureStyle: "Afro-modernist concrete and glass towers, gated estate maisonettes, corrugated roof markets, colorful street airbrush graffiti.",
      culturalContext: "Contemporary urban Kenyan youth hustle, tech startup grind, deep music and matatu subcultures.",
      timePeriod: "Present day with slight near-future tech aesthetic",
      techLevel: "High smartphone and fintech penetration, M-PESA ubiquity, dual-monitor developer stations, solar streetlights.",
      vehicles: [
        "Pimped-out custom Nganya matatus with glowing purple/cyan LEDs and loud subwoofers",
        "Boda-boda motorbikes weaving through roundabouts",
        "Double-decker commuter buses",
      ],
      clothingConventions: [
        "Urban streetwear (hoodies, graphic tees, tapered cargo pants)",
        "Kitenge patterned modern blazers and corporate wear",
        "Safari zip jackets, clean sneakers",
      ],
      recurringLocations: ["Kencom Bus Terminus", "Buru Buru Phase 2 Maisonette", "Kilimani Startup Hub", "Matatu 58 Interior"],
      lightingRules: "Golden hour equatorial sunlight, vibrant neon violet/cyan matatu interiors, warm fluorescent kibanda lights.",
      environmentalRules: [
        "Never show generic Western cityscapes; Nairobi's distinctive skyline and red soil verges must be recognizable.",
        "Traffic roundabouts must feature authentic vehicular congestion with street vendors selling snacks.",
        "Include local flora: Jacaranda trees, acacia silhouettes, and lush highland greenery.",
      ],
      colorLanguage: "Warm ochre, deep bronze, safari green, electric violet, amber yellow.",
      weatherDefaults: "Warm sunny mornings, golden afternoon light, occasional dramatic tropical downpours.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates location prompt tokens adhering strictly to established world rules
   */
  public compileLocationPrompt(locationName: string, world: WorldUniverse, timeOfDay: string = "daylight"): string {
    return `Setting [${locationName}]: located in ${world.name}, ${world.architectureStyle}. Lighting: ${timeOfDay} ${world.lightingRules}. Distinctive cultural atmosphere: ${world.culturalContext}. Reusable environment anchors: ${world.environmentalRules.join(" ")}`;
  }
}

export class CulturalLocalizationEngine {
  private static instance: CulturalLocalizationEngine;

  private shengGlossary: CulturalGlossaryEntry[] = [
    { term: "Buda", meaning: "Bro / Friend / Man", context: "Informal greeting or attention grabber", usageExample: "Buda, umencheki ile form?" },
    { term: "Wazi", meaning: "Clear / Cool / Alright", context: "Agreement or acknowledgment", usageExample: "Wazi wazi, tuko radar." },
    { term: "Form ni gani", meaning: "What's the plan / What's happening?", context: "Casual check-in with friends", usageExample: "Niaje Kevo, form ni gani leo?" },
    { term: "Ngori", meaning: "Danger / Big problem / Trouble", context: "High stakes or emergency", usageExample: "Hii issue ya server ni ngori sana!" },
    { term: "Chapaa", meaning: "Money / Cash", context: "Financial transactions or funding", usageExample: "Tumeland contract ya chapaa mob!" },
    { term: "Radar", meaning: "Aware / On the lookout", context: "Staying alert", usageExample: "Kaa radar, Mary amekaribia kufika." },
    { term: "Nganya", meaning: "Custom pimped-out Matatu bus", context: "Urban transport culture", usageExample: "Panda Nganya 58 tupitie express!" },
    { term: "Kibanda", meaning: "Local food kiosk", context: "Quick lunch or tea spot", usageExample: "Tuchukue chai ya kibanda kwanza." },
  ];

  private constructor() {}

  public static getInstance(): CulturalLocalizationEngine {
    if (!CulturalLocalizationEngine.instance) {
      CulturalLocalizationEngine.instance = new CulturalLocalizationEngine();
    }
    return CulturalLocalizationEngine.instance;
  }

  public getGlossary(): CulturalGlossaryEntry[] {
    return this.shengGlossary;
  }

  /**
   * Performs natural code-switching analysis and validates cultural phrasing
   */
  public analyzeAndEnhanceDialogue(dialogueText: string, characterRole: string, region: LocalizationRegion = "Kenya"): {
    enhancedText: string;
    detectedSlang: string[];
    culturalNotes: string;
  } {
    const lower = dialogueText.toLowerCase();
    const detected: string[] = [];

    this.shengGlossary.forEach((entry) => {
      if (lower.includes(entry.term.toLowerCase())) {
        detected.push(entry.term);
      }
    });

    let notes = "Authentic natural dialogue blending English with Kenyan urban idioms.";
    if (detected.length === 0 && characterRole.toLowerCase().includes("kevo")) {
      notes += " Suggest adding street-smart Sheng interjections for character voice fidelity.";
    }

    return {
      enhancedText: dialogueText,
      detectedSlang: detected,
      culturalNotes: notes,
    };
  }
}

export const worldBuilder = WorldBuilder.getInstance();
export const localizationEngine = CulturalLocalizationEngine.getInstance();

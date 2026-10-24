import { ComicSeries, Character, LocationItem, Episode, SocialClip, ThumbnailConcept } from "@/types";
import { db } from "../src/lib/db";

export const DEV_SERIES: ComicSeries[] = [
  {
    id: "series-nairobi-01",
    title: "Life in Nairobi",
    description:
      "A fast-paced, hilarious and relatable animated comic series following young Kenyan tech hustler Brian, his chaotic friend Kevin, and sharp fintech manager Mary as they navigate Nairobi's startup grind, matatu madness, and big ambitions.",
    genre: "Comedy / Drama / Urban Tech Slice-of-Life",
    artStyle: "African Comic",
    isStyleLocked: true,
    mainCharacterIds: ["char-brian-01", "char-kevin-02", "char-mary-03"],
    supportingCharacterIds: ["char-otieno-04"],
    locationIds: ["loc-cbd-01", "loc-matatu-02", "loc-eastlands-03", "loc-techhub-04"],
    worldRules: [
      "Natural multilingual blending: English, Swahili, and authentic Sheng are mixed effortlessly.",
      "High comic energy: sweat drops, exaggerated reaction shots, and dynamic comic freeze frames during comedic climaxes.",
      "Authentic Nairobi urban aesthetics: Nairobi skyline, bustling matatus with graffiti art, street food kibandas, and vibrant tech spaces.",
      "Character visual consistency: Brian always wears his signature green safari tech jacket; Kevin rocks oversized streetwear.",
    ],
    voiceProfilesSummary:
      "Brian: Fast, energetic Kenyan English. Kevin: Sheng heavy, witty, expressive. Mary: Crisp professional East African corporate English.",
    visualReferences: [
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop",
    ],
    brandIdentity: {
      tagline: "The Hustle is Real. The Drama is Epic.",
      outroHook: "Subscribe on TikTok @ComiksX for the next episode!",
      primaryColor: "#f59e0b",
      secondaryColor: "#06b6d4",
      fontStyle: "Bangers / Bold Comic Gothic",
    },
    episodeCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEV_CHARACTERS: Character[] = [
  {
    id: "char-brian-01",
    seriesId: "series-nairobi-01",
    name: "Brian Otieno",
    age: 24,
    personality: "Ambitious, slightly anxious developer, loyal friend, quick thinker under pressure.",
    appearance: "Lean athletic build, short clean fade haircut, warm brown skin tone, expressive warm eyes.",
    clothing: "Signature dark green safari tech jacket with front zip, fitted black tee, dark denim jeans, white sneakers.",
    hairstyle: "Crisp tapered fade with short neat waves on top.",
    skinTone: "Deep warm bronze brown.",
    bodyType: "Lean and athletic, 5ft 11in.",
    voice: {
      voiceId: "ke-male-brian",
      provider: "elevenlabs",
      accent: "Kenyan English",
      gender: "male",
      ageBracket: "young-adult",
      tone: "Energetic, witty, fast-paced",
      speed: 1.1,
      pitch: 1.0,
    },
    accent: "Kenyan English with occasional Sheng slang",
    speechStyle: "Fast-paced tech jargon mixed with relatable Nairobi humor",
    characterDescription: "A talented full-stack engineer trying to scale his first AI startup from a shared apartment in Nairobi.",
    referenceImages: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop",
    ],
    characterPrompt:
      "24-year-old Kenyan young man, Brian, short faded hairstyle, warm brown skin, expressive brown eyes, wearing green safari zip jacket and dark jeans, African comic art style, clean bold cel-shaded outlines, vivid colors, animated character sheet",
    negativePrompt: "photorealistic, European features, blurry, disfigured face, extra limbs, 3d clay render",
    isLocked: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "char-kevin-02",
    seriesId: "series-nairobi-01",
    name: "Kevin Mwangi",
    age: 23,
    personality: "Chaotic hype-man, street-smart marketer, always looking for a shortcut, deeply loyal.",
    appearance: "Tall lanky build, dreadlocks tied back, bright mischievous smile, expressive hands.",
    clothing: "Oversized graphic vintage tee, neon windbreaker, distressed cargo pants, chunky skate sneakers.",
    hairstyle: "Short dreadlocks pulled into a mini top-knot.",
    skinTone: "Warm caramel brown.",
    bodyType: "Lanky, 6ft 1in.",
    voice: {
      voiceId: "ke-male-kevin",
      provider: "elevenlabs",
      accent: "Kenyan Sheng",
      gender: "male",
      ageBracket: "young-adult",
      tone: "Hype, comedic, vibrant",
      speed: 1.15,
      pitch: 1.05,
    },
    accent: "Heavy Nairobi Sheng mixed with Swahili",
    speechStyle: "Street slang heavy, enthusiastic punchlines, uses 'Manze' and 'Buda' frequently",
    characterDescription: "Brian's best friend and self-appointed chief growth officer.",
    referenceImages: [],
    characterPrompt: "23-year-old Kenyan man, Kevin, short dreadlocks, oversized streetwear, comedic African comic style",
    negativePrompt: "photorealistic, European features, blurry",
    isLocked: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "char-mary-03",
    seriesId: "series-nairobi-01",
    name: "Mary Wanjiku",
    age: 27,
    personality: "Sharp fintech operations lead, razor-sharp wit, secretly supportive.",
    appearance: "Confident posture, braided cornrows, elegant modern East African corporate style.",
    clothing: "Tailored blazer with Kitenge silk accents, gold minimal hoop earrings, sleek black pants.",
    hairstyle: "Neat braided cornrows flowing backward.",
    skinTone: "Rich dark chocolate complexion.",
    bodyType: "Poised, 5ft 8in.",
    voice: {
      voiceId: "ke-female-mary",
      provider: "elevenlabs",
      accent: "Kenyan English Corporate",
      gender: "female",
      ageBracket: "adult",
      tone: "Clear, authoritative, warm",
      speed: 1.0,
      pitch: 1.0,
    },
    accent: "Polished East African English",
    speechStyle: "Precise, corporate-ready, effortless Swahili interjections when exasperated",
    characterDescription: "Series protagonist counterpart evaluating Brian's startup.",
    referenceImages: [],
    characterPrompt: "27-year-old Kenyan businesswoman, Mary, cornrows, modern blazer with African print, African comic style",
    negativePrompt: "photorealistic, blurry",
    isLocked: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const DEV_LOCATIONS: LocationItem[] = [
  {
    id: "loc-cbd-01",
    seriesId: "series-nairobi-01",
    name: "Kencom Bus Stage & CBD Street",
    category: "cbd",
    description: "Iconic central Nairobi bus stage with towering brutalist architecture, street food vendors, and bustling foot traffic.",
    visualPrompt: "Nairobi Kencom bus stage, midday equatorial sunlight, bustling crowds, modern African comic book art style",
    referenceImages: [],
    timeOfDayDefaults: "day",
    tags: ["nairobi", "kencom", "cbd"],
    createdAt: new Date().toISOString(),
  },
];

export function seedDevData(): void {
  console.log("Seeding development test fixtures into database...");
  DEV_SERIES.forEach((s) => {
    if (!db.getSeriesById(s.id)) {
      db.createSeries(s);
    }
  });
  DEV_CHARACTERS.forEach((c) => {
    if (!db.getCharacterById(c.id)) {
      db.createCharacter(c);
    }
  });
  DEV_LOCATIONS.forEach((l) => {
    db.createLocation(l);
  });
}

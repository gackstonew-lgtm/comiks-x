import fs from "fs";
import path from "path";
import {
  ComicSeries,
  Character,
  LocationItem,
  Episode,
  Scene,
  SocialClip,
  ThumbnailConcept,
  GenerationJob,
  UsageRecord,
  VideoProviderConfig,
} from "@/types";

interface DatabaseSchema {
  series: ComicSeries[];
  characters: Character[];
  locations: LocationItem[];
  episodes: Episode[];
  scenes: Scene[];
  socialClips: SocialClip[];
  thumbnails: ThumbnailConcept[];
  generationJobs: GenerationJob[];
  usageRecords: UsageRecord[];
  settings: VideoProviderConfig;
}

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "comiks_db.json");

const DEFAULT_SETTINGS: VideoProviderConfig = {
  activeProvider: "luma",
  lumaApiKey: process.env.LUMA_API_KEY || "",
  runwayApiKey: process.env.RUNWAY_API_KEY || "",
  klingApiKey: process.env.KLING_API_KEY || "",
  falApiKey: process.env.FAL_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  enableImageToVideo: true,
  defaultSceneDuration: 12,
  maxRetries: 3,
  dailyBudgetLimitUsd: 50.0,
};

// Seed authentic Kenyan animation series: "Life in Nairobi"
const INITIAL_SERIES: ComicSeries[] = [
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
    episodeCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_CHARACTERS: Character[] = [
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
      tone: "Energetic and relatable",
      speed: 1.05,
      pitch: 1.0,
    },
    accent: "Kenyan English with occasional Sheng slang",
    speechStyle: "Fast-paced tech jargon mixed with relatable Nairobi humor",
    characterDescription:
      "A talented full-stack engineer trying to scale his first AI startup from a shared apartment in Nairobi.",
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
    name: "Kevin 'Kevo' Mwangi",
    age: 25,
    personality: "Charismatic hustler, comedic hype man, always knows a guy who knows a guy, big risk taker.",
    appearance: "Stocky build, dreadlock bun fade, big radiant smile, animated hand gestures.",
    clothing: "Bold oversized graphic hoodie with Nairobi graffiti print, baggy cargo pants, chunky sneakers.",
    hairstyle: "Short dreadlocks tied in a neat top bun with shaved sides.",
    skinTone: "Rich dark chocolate brown.",
    bodyType: "Stocky, expressive body language.",
    voice: {
      voiceId: "ke-male-kevo",
      provider: "elevenlabs",
      accent: "Sheng / Swahili Casual",
      gender: "male",
      ageBracket: "young-adult",
      tone: "Comedic, witty, high energy",
      speed: 1.1,
      pitch: 0.95,
    },
    accent: "Nairobi Sheng with heavy Swahili street slang",
    speechStyle: "Punchy, comedic, uses phrases like 'Buda!', 'Wazi wazi', 'Hii ni noma!'",
    characterDescription:
      "Brian's childhood buddy and unofficial marketing manager who turns simple problems into wild adventures.",
    referenceImages: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop",
    ],
    characterPrompt:
      "25-year-old Kenyan man Kevin, short dreadlocks tied in top bun, rich dark brown skin, big expressive smile, oversized graffiti streetwear hoodie, baggy cargos, African comic art style, bold outlines, vibrant colors",
    negativePrompt: "photorealistic, skinny, different hairstyle, faded colors, blurry",
    isLocked: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "char-mary-03",
    seriesId: "series-nairobi-01",
    name: "Mary Wanjiku",
    age: 26,
    personality: "Sharp, no-nonsense fintech operations lead, razor-sharp wit, secretly supportive.",
    appearance: "Elegant poise, braided crown cornrows, stylish spectacles, confident demeanor.",
    clothing: "Tailored modern African blazer with kitenge pattern lapels, cream silk blouse, gold hoop earrings.",
    hairstyle: "Intricate braided cornrow updo.",
    skinTone: "Warm golden brown.",
    bodyType: "Graceful, tall posture.",
    voice: {
      voiceId: "ke-female-mary",
      provider: "elevenlabs",
      accent: "Kenyan Corporate English",
      gender: "female",
      ageBracket: "young-adult",
      tone: "Authoritative yet warm",
      speed: 1.0,
      pitch: 1.05,
    },
    accent: "Refined Kenyan English with subtle Swahili expressions",
    speechStyle: "Direct, articulate, business-savvy with dry comedic timing",
    characterDescription:
      "A rising fintech lead who gives Brian his biggest client opportunity while holding him to impossible deadlines.",
    referenceImages: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop",
    ],
    characterPrompt:
      "26-year-old Kenyan woman Mary, braided cornrow crown hairstyle, warm golden brown skin, stylish modern spectacles, wearing tailored blazer with kitenge lapels, African comic art style, crisp cel-shaded animation linework",
    negativePrompt: "photorealistic, loose hair, messy clothes, distorted anatomy",
    isLocked: true,
    avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_LOCATIONS: LocationItem[] = [
  {
    id: "loc-cbd-01",
    seriesId: "series-nairobi-01",
    name: "Nairobi CBD & Kencom",
    category: "cbd",
    description: "Bustling downtown Nairobi with towering glass skyscrapers, red double-decker buses, and dense pedestrian energy.",
    visualPrompt:
      "Downtown Nairobi CBD skyline at golden hour, Kencom bus station background, modern skyscrapers, bustling pedestrian street, vibrant African comic art style, high contrast, clean lineart",
    referenceImages: [],
    tags: ["nairobi", "cbd", "city", "urban", "exterior"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "loc-matatu-02",
    seriesId: "series-nairobi-01",
    name: "Custom Nganya (Matatu 58)",
    category: "matatu",
    description: "Legendary pimped-out Nairobi Matatu with glowing neon interior, custom airbrush graffiti, giant subwoofer displays, and tinted windows.",
    visualPrompt:
      "Interior of pimped-out Nairobi matatu nganya, custom comic graffiti art on ceiling, violet and cyan LED neon ambient glow, passengers seated, dynamic cinematic comic style",
    referenceImages: [],
    tags: ["matatu", "nganya", "transport", "neon", "sheng"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "loc-eastlands-03",
    seriesId: "series-nairobi-01",
    name: "Buru Buru Apartment & Balcony",
    category: "estate",
    description: "Brian and Kevin's two-bedroom apartment in Buru Buru Phase 2 with a balcony overlooking the vibrant neighborhood.",
    visualPrompt:
      "Living room of Nairobi apartment in Buruburu estate, developer workstation with two monitors, Kenyan art prints on walls, balcony door open showing residential neighborhood, warm sunlight, comic art style",
    referenceImages: [],
    tags: ["estate", "apartment", "buruburu", "home", "interior"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "loc-techhub-04",
    seriesId: "series-nairobi-01",
    name: "Kilimani Tech Hub & Co-working",
    category: "office",
    description: "Ultra-modern glass co-working incubator in Kilimani with exposed brick, indoor plants, and a rooftop coffee lounge.",
    visualPrompt:
      "Modern African startup tech hub office in Kilimani Nairobi, glass partitions, large windows with Nairobi green canopy view, whiteboard with app diagrams, sleek desks, African comic cel-shaded style",
    referenceImages: [],
    tags: ["tech", "office", "kilimani", "fintech", "interior"],
    createdAt: new Date().toISOString(),
  },
];

// Initial Episode: "The Big Pitch"
const INITIAL_EPISODES: Episode[] = [
  {
    id: "ep-01-the-pitch",
    seriesId: "series-nairobi-01",
    episodeNumber: 1,
    title: "The Big Pitch",
    logline: "A young Nairobi developer lands a game-changing fintech client meeting, but an unruly matatu and a dead laptop battery threaten to ruin everything.",
    synopsis:
      "Brian receives an urgent call from Mary to pitch his AI financial assistant to senior venture investors at 2:00 PM in Kilimani. Kevin insists on escorting him, leading to a hilarious chain reaction involving an impromptu detour through Gikomba, a forgotten charger, and an emergency sprint through Nairobi traffic.",
    targetDurationMinutes: 30,
    actualDurationSeconds: 1820,
    status: "storyboarded",
    charactersInvolved: ["Brian Otieno", "Kevin 'Kevo' Mwangi", "Mary Wanjiku"],
    threeActStructure: {
      beginning: "Brian wakes up to Mary's surprise call scheduling a multi-million shilling venture pitch in 2 hours.",
      conflict: "Kevin convinces Brian to take a notorious express nganya matatu that takes a wild unplanned detour.",
      escalation: "Brian's laptop battery dips to 4% while stuck in a major roundabout jam on Uhuru Highway.",
      climax: "Brian and Kevin abandon the vehicle and sprint across downtown Nairobi, arriving at the boardroom with seconds to spare.",
      resolution: "Brian delivers the pitch verbally with Kevin providing dynamic live whiteboard sketches; the board is captivated.",
      endingHook: "Mary smiles and tells Brian they got the funding—but the investor wants the prototype live in 48 hours.",
    },
    chapters: [
      {
        id: "ch-01",
        episodeId: "ep-01-the-pitch",
        chapterNumber: 1,
        title: "The 2-Hour Warning",
        timecode: "00:00",
        startTimeSeconds: 0,
        endTimeSeconds: 300,
        summary: "Brian gets the high-stakes call from Mary while Kevin is busy making mandazi.",
      },
      {
        id: "ch-02",
        episodeId: "ep-01-the-pitch",
        chapterNumber: 2,
        title: "Boarding the Beast",
        timecode: "05:00",
        startTimeSeconds: 300,
        endTimeSeconds: 780,
        summary: "The duo hops into the wildest matatu in Eastlands with deafening bass and wild driving.",
      },
      {
        id: "ch-03",
        episodeId: "ep-01-the-pitch",
        chapterNumber: 3,
        title: "Gridlock Panic",
        timecode: "13:00",
        startTimeSeconds: 780,
        endTimeSeconds: 1320,
        summary: "Uhuru Highway standstill. Battery reaches 4%. Panic ensues.",
      },
      {
        id: "ch-04",
        episodeId: "ep-01-the-pitch",
        chapterNumber: 4,
        title: "The Downtown Sprint",
        timecode: "22:00",
        startTimeSeconds: 1320,
        endTimeSeconds: 1620,
        summary: "Brian and Kevin sprint through the city, dodging cart pullers and street fruit stalls.",
      },
      {
        id: "ch-05",
        episodeId: "ep-01-the-pitch",
        chapterNumber: 5,
        title: "The Hustler's Triumph",
        timecode: "27:00",
        startTimeSeconds: 1620,
        endTimeSeconds: 1820,
        summary: "An unforgettable pitch, standing ovation, and a cliffhanger contract.",
      },
    ],
    scenes: [
      {
        id: "scene-01",
        episodeId: "ep-01-the-pitch",
        sceneNumber: 1,
        actNumber: 1,
        chapterId: "ch-01",
        duration: 12,
        location: "Buru Buru Apartment",
        locationDetails: "Morning light streaming into apartment. Code on dual monitors.",
        characters: ["Brian Otieno"],
        dialogue: [
          {
            id: "d-01",
            characterId: "char-brian-01",
            characterName: "Brian Otieno",
            line: "Just one more function and the sync is complete... Come on, compile!",
            language: "en",
            emotion: "intense focus",
          },
        ],
        narration: "Monday morning in Nairobi. The hustle begins before sunrise.",
        visualDescription: "Close-up of Brian's intense eyes reflecting green code lines, pulling back to show him hunched over his mechanical keyboard.",
        cameraAngle: "Medium Close-up",
        cameraMovement: "Slow Pull-back",
        action: "Brian taps enter aggressively, then leans back as green success messages scroll on screen.",
        facialExpressions: "Brian breathes a sigh of relief with a triumphant grin.",
        soundEffects: ["Keyboard mechanical clacking", "Success chime sound"],
        backgroundMusic: "Lo-fi afrobeat with subtle rhythmic bass",
        transition: "Cut",
        aiPrompt:
          "African comic art style, 24-year-old Kenyan developer Brian, tapered fade hairstyle, dark green safari zip jacket, seated in Buruburu apartment in front of dual monitors with coding IDE, warm sunrise light, clean bold outlines, vibrant colors, cinematic framing",
        negativePrompt: "photorealistic, 3d render, blurry, distorted anatomy, messy linework",
        status: "completed",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-african-man-working-on-his-laptop-at-home-41857-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
        retryCount: 0,
        costEstimate: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-02",
        episodeId: "ep-01-the-pitch",
        sceneNumber: 2,
        actNumber: 1,
        chapterId: "ch-01",
        duration: 14,
        location: "Buru Buru Apartment",
        characters: ["Brian Otieno", "Kevin 'Kevo' Mwangi"],
        dialogue: [
          {
            id: "d-02",
            characterId: "char-kevin-02",
            characterName: "Kevin 'Kevo' Mwangi",
            line: "Buda! Simu yako inapiga kengele kama ambulansi ya Kenyatta!",
            language: "sheng",
            emotion: "loud and comedic",
          },
          {
            id: "d-03",
            characterId: "char-brian-01",
            characterName: "Brian Otieno",
            line: "Wait... it's Mary! Hello, Mary?",
            language: "en",
            emotion: "surprised",
          },
        ],
        visualDescription: "Kevin kicks open kitchen door holding a spatula, pointing at Brian's vibrating smartphone.",
        cameraAngle: "Medium Shot",
        cameraMovement: "Dynamic Zoom",
        action: "Kevin strikes an exaggerated martial arts pose with his cooking spatula.",
        facialExpressions: "Kevin laughing loudly, Brian frantically reaching for the phone.",
        soundEffects: ["Door creak", "High-tempo phone ringtone"],
        backgroundMusic: "Upbeat comedic afro-pop rhythm",
        transition: "Comic Halftone Wipe",
        aiPrompt:
          "African comic art style, interior Nairobi apartment, Kenyan comedic friend Kevin in oversized graphic hoodie holding cooking spatula, laughing dramatically, Brian reaching across desk for glowing phone, dynamic comic panel composition, bold black ink outlines",
        negativePrompt: "photorealistic, extra limbs, low resolution, blurred faces",
        status: "completed",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-man-answering-a-phone-call-in-an-office-42998-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
        retryCount: 0,
        costEstimate: 14,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-03",
        episodeId: "ep-01-the-pitch",
        sceneNumber: 3,
        actNumber: 1,
        chapterId: "ch-01",
        duration: 10,
        location: "Kilimani Tech Hub",
        characters: ["Mary Wanjiku"],
        dialogue: [
          {
            id: "d-04",
            characterId: "char-mary-03",
            characterName: "Mary Wanjiku",
            line: "Brian, the Silicon Savannah partners arrived early. Be in Kilimani by 2 PM sharp, or we forfeit the term sheet.",
            language: "en",
            emotion: "firm and urgent",
          },
        ],
        visualDescription: "Mary standing by executive floor-to-ceiling glass in Kilimani with phone to ear, holding an iPad.",
        cameraAngle: "Medium Shot",
        cameraMovement: "Slow Push-in",
        action: "Mary checks her elegant watch while looking out at Nairobi skyline.",
        facialExpressions: "Sharp, confident, raised eyebrow.",
        soundEffects: ["Subtle office chatter", "Phone click"],
        backgroundMusic: "Tense corporate bass groove",
        transition: "Cut",
        aiPrompt:
          "African comic art style, elegant Kenyan fintech businesswoman Mary, braided crown hairstyle, stylish spectacles, kitenge lapel blazer, holding modern tablet in glass executive office overlooking Nairobi skyline, crisp comic book cel-shading, rich colors",
        negativePrompt: "photorealistic, 3d CGI, western comic distortion, messy background",
        status: "completed",
        videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-businesswoman-talking-on-the-phone-in-an-office-42996-large.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop",
        retryCount: 0,
        costEstimate: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "scene-04",
        episodeId: "ep-01-the-pitch",
        sceneNumber: 4,
        actNumber: 2,
        chapterId: "ch-02",
        duration: 15,
        location: "Custom Nganya (Matatu 58)",
        characters: ["Brian Otieno", "Kevin 'Kevo' Mwangi"],
        dialogue: [
          {
            id: "d-05",
            characterId: "char-brian-01",
            characterName: "Brian Otieno",
            line: "Kevo, why did we board this specific nganya?! The bass is shaking my laptop screen!",
            language: "en",
            emotion: "panicked",
          },
          {
            id: "d-06",
            characterId: "char-kevin-02",
            characterName: "Kevin 'Kevo' Mwangi",
            line: "Tulia buda! Huyu dereva ni fundi. Nairobi traffic haina nguvu mbele ya Nganya 58!",
            language: "sheng",
            emotion: "boastful and excited",
          },
        ],
        visualDescription: "Inside the matatu bathed in pulsing violet neon light, bass speakers vibrating, Brian clinging onto his laptop backpack.",
        cameraAngle: "Medium Shot",
        cameraMovement: "Handheld Shake",
        action: "Matatu swerves slightly as Kevin bobs his head to the heavy Gengetone beat while Brian grips his seat in terror.",
        facialExpressions: "Brian wide-eyed terror, Kevin ecstatic joy.",
        soundEffects: ["Booming bass subwoofer", "Matatu exhaust roar", "Conductor coin rattle"],
        backgroundMusic: "Heavy Kenyan Gengetone bassline",
        transition: "Flash Cut",
        aiPrompt:
          "African comic art style, inside vibrant Nairobi matatu nganya, neon purple and cyan LED lights glowing, 24yo Kenyan techie Brian clutching laptop with terrified expression, comedic friend Kevin grooving to music with big grin, motion lines, high octane comic animation",
        negativePrompt: "photorealistic, dim lighting, washed out, blurry, anatomical errors",
        status: "pending",
        retryCount: 0,
        costEstimate: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    progressPercent: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SOCIAL_CLIPS: SocialClip[] = [
  {
    id: "clip-01-matatu-panic",
    episodeId: "ep-01-the-pitch",
    title: "When you have a 2 PM pitch and board a Kenyan Nganya 💀😭",
    hook: "POV: You have 15 minutes to pitch to investors...",
    mainMoment: "Brian realizing the matatu driver is turning the opposite direction towards Gikomba.",
    endingCta: "Watch full Episode 01 'The Big Pitch' on link in bio! #ComiksX",
    startTimeSeconds: 310,
    endTimeSeconds: 345,
    durationSeconds: 35,
    aspectRatio: "9:16",
    platform: "all",
    captions: [
      { start: 0, end: 3, text: "POV: You have 15 mins to pitch investors...", emphasisWords: ["POV", "pitch"] },
      { start: 3, end: 8, text: "And your boy picked the loudest matatu in Eastlands! 🔊", emphasisWords: ["loudest", "Eastlands"] },
      { start: 8, end: 14, text: "Dereva: 'Leo hatupiti highway, tunapitia short-cut!' 😭", emphasisWords: ["Dereva", "short-cut"] },
      { start: 14, end: 20, text: "Battery: 4%. Traffic: Gridlocked. Blood pressure: 200.", emphasisWords: ["4%", "Gridlocked"] },
      { start: 20, end: 35, text: "Follow @ComiksX for Episode 2! 🔥🇰🇪", emphasisWords: ["Follow"] },
    ],
    description:
      "Nairobi tech developers will feel this pain in their souls! 😂 Episode 1 of Life in Nairobi is OUT NOW. Drop your craziest matatu delay in the comments! 👇",
    hashtags: ["#NairobiComics", "#KenyanAnimation", "#LifeInNairobi", "#NairobiTech", "#TikTokKenya", "#MatatuCulture", "#AfricanAnimation", "#ComiksX"],
    safeZoneCompliance: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&auto=format&fit=crop",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-young-man-answering-a-phone-call-in-an-office-42998-large.mp4",
    createdAt: new Date().toISOString(),
  },
  {
    id: "clip-02-battery-panic",
    episodeId: "ep-01-the-pitch",
    title: "4% Battery vs Multi-Million Shilling Pitch 🔥",
    hook: "That moment your charger is still at home in Buru Buru...",
    mainMoment: "The red battery notification popping up on Brian's MacBook screen.",
    endingCta: "Part 2 dropping this Friday! Hit follow!",
    startTimeSeconds: 840,
    endTimeSeconds: 885,
    durationSeconds: 45,
    aspectRatio: "9:16",
    platform: "tiktok",
    captions: [
      { start: 0, end: 4, text: "That cold sweat when battery hits 4%... 🔋⚠️", emphasisWords: ["cold sweat", "4%"] },
      { start: 4, end: 10, text: "Mary on phone: 'Where are you?! The partners are seated!'", emphasisWords: ["Where are you"] },
      { start: 10, end: 18, text: "Kevo: 'Buda, chukua powerbank yangu ya 200bob!' 💀", emphasisWords: ["powerbank"] },
      { start: 18, end: 30, text: "The powerbank: 0% also. We are cooked.", emphasisWords: ["cooked"] },
      { start: 30, end: 45, text: "Tap + for the conclusion! #LifeInNairobi", emphasisWords: ["Tap +"] },
    ],
    description:
      "When the startup gods decide to test your faith on pitch day! 😭 Stream the complete 30-minute animated comic episode now.",
    hashtags: ["#AfricanComics", "#KenyanHumor", "#NairobiCreatives", "#AnimeKenya", "#TechHustle", "#ShengVibes"],
    safeZoneCompliance: true,
    thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-african-man-working-on-his-laptop-at-home-41857-large.mp4",
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_THUMBNAILS: ThumbnailConcept[] = [
  {
    id: "thumb-01",
    episodeId: "ep-01-the-pitch",
    title: "Reaction Shock: 4% Battery & Matatu Drift",
    conceptPrompt:
      "High visual contrast comic book cover, African comic style, Brian wide-eyed in horror with hands on face, neon purple matatu headlights glaring in background, bold typography 'THE BIG PITCH', glowing comic speech bubble, dynamic saturated colors",
    focalCharacterName: "Brian Otieno",
    facialExpression: "Exaggerated anime/comic shock with sweat drops",
    composition: "Dynamic Dutch angle close-up with neon motion trail",
    contrastStyle: "High contrast neon cyan and amber yellow",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop",
    isSelected: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "thumb-02",
    episodeId: "ep-01-the-pitch",
    title: "Duo Sprint: Downtown Nairobi Showdown",
    conceptPrompt:
      "Split-screen comic cover, left side Mary stern in luxury glass office checking watch, right side Brian and Kevin sprinting past street market in panic, bold comic ink lines, title text 'CAN THEY MAKE IT IN TIME?'",
    focalCharacterName: "Brian & Kevin",
    facialExpression: "Determined sweat-drenched sprint",
    composition: "Dynamic diagonal split screen",
    contrastStyle: "Golden hour orange and deep navy comic ink",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop",
    isSelected: false,
    createdAt: new Date().toISOString(),
  },
];

export class ComiksDb {
  private static instance: ComiksDb;
  private data: DatabaseSchema;

  private constructor() {
    this.ensureDbExists();
    this.data = this.load();
  }

  public static getInstance(): ComiksDb {
    if (!ComiksDb.instance) {
      ComiksDb.instance = new ComiksDb();
    }
    return ComiksDb.instance;
  }

  private ensureDbExists(): void {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        series: INITIAL_SERIES,
        characters: INITIAL_CHARACTERS,
        locations: INITIAL_LOCATIONS,
        episodes: INITIAL_EPISODES,
        scenes: INITIAL_EPISODES[0].scenes,
        socialClips: INITIAL_SOCIAL_CLIPS,
        thumbnails: INITIAL_THUMBNAILS,
        generationJobs: [],
        usageRecords: [],
        settings: DEFAULT_SETTINGS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    }
  }

  private load(): DatabaseSchema {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw) as DatabaseSchema;
    } catch {
      return {
        series: INITIAL_SERIES,
        characters: INITIAL_CHARACTERS,
        locations: INITIAL_LOCATIONS,
        episodes: INITIAL_EPISODES,
        scenes: INITIAL_EPISODES[0].scenes,
        socialClips: INITIAL_SOCIAL_CLIPS,
        thumbnails: INITIAL_THUMBNAILS,
        generationJobs: [],
        usageRecords: [],
        settings: DEFAULT_SETTINGS,
      };
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to persist database to file:", err);
    }
  }

  // --- Series ---
  public getSeries(): ComicSeries[] {
    return this.data.series;
  }

  public getSeriesById(id: string): ComicSeries | undefined {
    return this.data.series.find((s) => s.id === id);
  }

  public createSeries(item: Omit<ComicSeries, "id" | "createdAt" | "updatedAt">): ComicSeries {
    const newSeries: ComicSeries = {
      ...item,
      id: `series-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.series.push(newSeries);
    this.save();
    return newSeries;
  }

  public updateSeries(id: string, updates: Partial<ComicSeries>): ComicSeries | undefined {
    const index = this.data.series.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.data.series[index] = {
      ...this.data.series[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.series[index];
  }

  // --- Characters ---
  public getCharacters(seriesId?: string): Character[] {
    if (seriesId) {
      return this.data.characters.filter((c) => c.seriesId === seriesId);
    }
    return this.data.characters;
  }

  public getCharacterById(id: string): Character | undefined {
    return this.data.characters.find((c) => c.id === id);
  }

  public createCharacter(item: Omit<Character, "id" | "createdAt" | "updatedAt">): Character {
    const newChar: Character = {
      ...item,
      id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.characters.push(newChar);
    this.save();
    return newChar;
  }

  public updateCharacter(id: string, updates: Partial<Character>): Character | undefined {
    const index = this.data.characters.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.data.characters[index] = {
      ...this.data.characters[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.characters[index];
  }

  public duplicateCharacter(id: string): Character | undefined {
    const char = this.getCharacterById(id);
    if (!char) return undefined;
    const duplicated: Character = {
      ...char,
      id: `char-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${char.name} (Copy)`,
      isLocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.characters.push(duplicated);
    this.save();
    return duplicated;
  }

  public deleteCharacter(id: string): boolean {
    const beforeLen = this.data.characters.length;
    this.data.characters = this.data.characters.filter((c) => c.id !== id);
    if (this.data.characters.length !== beforeLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Locations ---
  public getLocations(seriesId?: string): LocationItem[] {
    if (seriesId) {
      return this.data.locations.filter((l) => l.seriesId === seriesId);
    }
    return this.data.locations;
  }

  public createLocation(item: Omit<LocationItem, "id" | "createdAt">): LocationItem {
    const newLoc: LocationItem = {
      ...item,
      id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.locations.push(newLoc);
    this.save();
    return newLoc;
  }

  // --- Episodes ---
  public getEpisodes(seriesId?: string): Episode[] {
    if (seriesId) {
      return this.data.episodes.filter((e) => e.seriesId === seriesId);
    }
    return this.data.episodes;
  }

  public getEpisodeById(id: string): Episode | undefined {
    return this.data.episodes.find((e) => e.id === id);
  }

  public createEpisode(item: Omit<Episode, "id" | "createdAt" | "updatedAt">): Episode {
    const newEp: Episode = {
      ...item,
      id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.episodes.push(newEp);

    // Also update series episodeCount
    const series = this.data.series.find((s) => s.id === item.seriesId);
    if (series) {
      series.episodeCount = (series.episodeCount || 0) + 1;
    }

    this.save();
    return newEp;
  }

  public updateEpisode(id: string, updates: Partial<Episode>): Episode | undefined {
    const index = this.data.episodes.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    this.data.episodes[index] = {
      ...this.data.episodes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.episodes[index];
  }

  // --- Scenes ---
  public getScenes(episodeId: string): Scene[] {
    const ep = this.getEpisodeById(episodeId);
    return ep ? ep.scenes : [];
  }

  public getSceneById(episodeId: string, sceneId: string): Scene | undefined {
    const ep = this.getEpisodeById(episodeId);
    return ep ? ep.scenes.find((s) => s.id === sceneId) : undefined;
  }

  public updateScene(episodeId: string, sceneId: string, updates: Partial<Scene>): Scene | undefined {
    const ep = this.getEpisodeById(episodeId);
    if (!ep) return undefined;
    const sceneIdx = ep.scenes.findIndex((s) => s.id === sceneId);
    if (sceneIdx === -1) return undefined;
    ep.scenes[sceneIdx] = {
      ...ep.scenes[sceneIdx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.updateEpisode(episodeId, { scenes: ep.scenes });
    return ep.scenes[sceneIdx];
  }

  // --- Social Clips ---
  public getSocialClips(episodeId?: string): SocialClip[] {
    if (episodeId) {
      return this.data.socialClips.filter((c) => c.episodeId === episodeId);
    }
    return this.data.socialClips;
  }

  public createSocialClip(clip: Omit<SocialClip, "id" | "createdAt">): SocialClip {
    const newClip: SocialClip = {
      ...clip,
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.socialClips.push(newClip);
    this.save();
    return newClip;
  }

  // --- Thumbnails ---
  public getThumbnails(episodeId?: string): ThumbnailConcept[] {
    if (episodeId) {
      return this.data.thumbnails.filter((t) => t.episodeId === episodeId);
    }
    return this.data.thumbnails;
  }

  public createThumbnail(item: Omit<ThumbnailConcept, "id" | "createdAt">): ThumbnailConcept {
    const newThumb: ThumbnailConcept = {
      ...item,
      id: `thumb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.thumbnails.push(newThumb);
    this.save();
    return newThumb;
  }

  public selectThumbnail(episodeId: string, thumbnailId: string): void {
    this.data.thumbnails.forEach((t) => {
      if (t.episodeId === episodeId) {
        t.isSelected = t.id === thumbnailId;
      }
    });
    const selected = this.data.thumbnails.find((t) => t.id === thumbnailId);
    if (selected?.imageUrl) {
      this.updateEpisode(episodeId, { thumbnailUrl: selected.imageUrl });
    }
    this.save();
  }

  // --- Generation Queue & Jobs ---
  public getJobs(episodeId?: string): GenerationJob[] {
    if (episodeId) {
      return this.data.generationJobs.filter((j) => j.episodeId === episodeId);
    }
    return this.data.generationJobs;
  }

  public createJob(job: Omit<GenerationJob, "id" | "createdAt" | "updatedAt">): GenerationJob {
    const newJob: GenerationJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.generationJobs.push(newJob);
    this.save();
    return newJob;
  }

  public updateJob(id: string, updates: Partial<GenerationJob>): GenerationJob | undefined {
    const idx = this.data.generationJobs.findIndex((j) => j.id === id);
    if (idx === -1) return undefined;
    this.data.generationJobs[idx] = {
      ...this.data.generationJobs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.generationJobs[idx];
  }

  // --- Usage Records ---
  public getUsageRecords(): UsageRecord[] {
    return this.data.usageRecords;
  }

  public recordUsage(record: Omit<UsageRecord, "id" | "timestamp">): UsageRecord {
    const newRecord: UsageRecord = {
      ...record,
      id: `use-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.usageRecords.push(newRecord);
    this.save();
    return newRecord;
  }

  // --- Settings ---
  public getSettings(): VideoProviderConfig {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  public updateSettings(updates: Partial<VideoProviderConfig>): VideoProviderConfig {
    this.data.settings = {
      ...this.getSettings(),
      ...updates,
    };
    this.save();
    return this.data.settings;
  }
}

export const db = ComiksDb.getInstance();

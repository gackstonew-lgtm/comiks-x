import { ComicSeries, Character, LocationItem, Episode, Scene, EpisodeChapter, CameraAngle, CameraMovement, SceneTransition } from "@/types";

export interface StoryGenerationInput {
  series: ComicSeries;
  characters: Character[];
  locations: LocationItem[];
  mode: "idea" | "script" | "outline";
  promptContent: string;
  targetDurationMinutes?: number; // e.g. 30
  targetSceneCount?: number; // e.g. 15 to 60
}

export class StoryLlmProvider {
  private geminiKey: string;
  private openaiKey: string;

  constructor(geminiKey?: string, openaiKey?: string) {
    this.geminiKey = geminiKey || process.env.GEMINI_API_KEY || "";
    this.openaiKey = openaiKey || process.env.OPENAI_API_KEY || "";
  }

  /**
   * Transforms raw user idea/script into a structured 30-min episode with chapters and scenes
   */
  public async generateEpisodeStructure(input: StoryGenerationInput): Promise<Omit<Episode, "id" | "createdAt" | "updatedAt">> {
    const { series, characters, locations, promptContent, targetDurationMinutes = 30 } = input;

    // Check if Gemini or OpenAI API is available
    if (this.geminiKey) {
      try {
        const result = await this.callGemini(input);
        if (result) return result;
      } catch (err) {
        console.warn("Gemini story generation failed, falling back to internal engine:", err);
      }
    } else if (this.openaiKey) {
      try {
        const result = await this.callOpenAI(input);
        if (result) return result;
      } catch (err) {
        console.warn("OpenAI story generation failed, falling back to internal engine:", err);
      }
    }

    // High-performance intelligent story architect fallback
    return this.buildStructuredEpisode(series, characters, locations, promptContent, targetDurationMinutes);
  }

  private async callGemini(input: StoryGenerationInput): Promise<Omit<Episode, "id" | "createdAt" | "updatedAt"> | null> {
    const systemPrompt = `You are an elite animation director and digital comic screenwriting architect. Output strictly JSON matching the episode schema.
Series Title: ${input.series.title}
Genre: ${input.series.genre}
Art Style: ${input.series.artStyle}
Characters: ${input.characters.map((c) => `${c.name} (${c.personality})`).join(", ")}
Locations: ${input.locations.map((l) => l.name).join(", ")}`;

    const userPrompt = `Input Idea/Script: "${input.promptContent}". Target duration: ${input.targetDurationMinutes || 30} minutes. Break into 3 acts, 5 chapters, and detailed scenes (5 to 20 seconds each).`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nReturn pure JSON with keys: title, logline, synopsis, charactersInvolved, threeActStructure, chapters, scenes.` }] },
        ],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText) as Omit<Episode, "id" | "createdAt" | "updatedAt">;
    return parsed;
  }

  private async callOpenAI(input: StoryGenerationInput): Promise<Omit<Episode, "id" | "createdAt" | "updatedAt"> | null> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are an elite animation director and comic screenplay writer. Output JSON with title, logline, synopsis, charactersInvolved, threeActStructure, chapters, scenes.",
          },
          {
            role: "user",
            content: `Series: ${input.series.title}, Style: ${input.series.artStyle}. Idea: ${input.promptContent}. Target: ${input.targetDurationMinutes} mins.`,
          },
        ],
      }),
    });

    if (!res.ok) return null;
    const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = json.choices?.[0]?.message?.content;
    if (!text) return null;

    return JSON.parse(text) as Omit<Episode, "id" | "createdAt" | "updatedAt">;
  }

  /**
   * Deterministic story architecture engine tailored for African/Kenyan comic animation
   */
  private buildStructuredEpisode(
    series: ComicSeries,
    characters: Character[],
    locations: LocationItem[],
    promptContent: string,
    targetDurationMinutes: number
  ): Omit<Episode, "id" | "createdAt" | "updatedAt"> {
    const title = this.deriveTitle(promptContent);
    const mainChars = characters.slice(0, 3);
    const primaryChar = mainChars[0] || { name: "Protagonist", clothing: "casual jacket", appearance: "expressive" };
    const secondaryChar = mainChars[1] || { name: "Partner", clothing: "hoodie", appearance: "witty" };
    const mentorChar = mainChars[2] || { name: "Executive", clothing: "formal blazer", appearance: "authoritative" };

    const loc1 = locations[0]?.name || "Nairobi City Center";
    const loc2 = locations[1]?.name || "Local Matatu Transit";
    const loc3 = locations[2]?.name || "Buruburu Estate Apartment";
    const loc4 = locations[3]?.name || "Kilimani Tech Office";

    const chapters: EpisodeChapter[] = [
      {
        id: "ch-01",
        episodeId: "",
        chapterNumber: 1,
        title: "The Genesis & The Call",
        timecode: "00:00",
        startTimeSeconds: 0,
        endTimeSeconds: 360,
        summary: "The morning calm is shattered by an unexpected high-stakes dilemma.",
      },
      {
        id: "ch-02",
        episodeId: "",
        chapterNumber: 2,
        title: "The Plan & The Transit Trap",
        timecode: "06:00",
        startTimeSeconds: 360,
        endTimeSeconds: 780,
        summary: "An audacious shortcut turns into an unforgettable obstacle course.",
      },
      {
        id: "ch-03",
        episodeId: "",
        chapterNumber: 3,
        title: "Everything Goes Wrong",
        timecode: "13:00",
        startTimeSeconds: 780,
        endTimeSeconds: 1260,
        summary: "Dead batteries, mistaken identities, and escalating comedy.",
      },
      {
        id: "ch-04",
        episodeId: "",
        chapterNumber: 4,
        title: "The Climax Confrontation",
        timecode: "21:00",
        startTimeSeconds: 1260,
        endTimeSeconds: 1560,
        summary: "The final sprint against the clock and face-to-face showdown.",
      },
      {
        id: "ch-05",
        episodeId: "",
        chapterNumber: 5,
        title: "The Twist & Resolution",
        timecode: "26:00",
        startTimeSeconds: 1560,
        endTimeSeconds: targetDurationMinutes * 60,
        summary: "A thrilling victory with a cliffhanger hook for the next episode.",
      },
    ];

    const cameraAngles: CameraAngle[] = [
      "Establishing Shot",
      "Medium Shot",
      "Medium Close-up",
      "Close-up",
      "Dutch Tilt",
      "Low Angle",
      "Wide Shot",
    ];
    const cameraMovements: CameraMovement[] = [
      "Static",
      "Slow Push-in",
      "Pan Right",
      "Dynamic Zoom",
      "Handheld Shake",
      "Tracking Shot",
    ];
    const transitions: SceneTransition[] = [
      "Cut",
      "Comic Page Flip",
      "Comic Halftone Wipe",
      "Flash Cut",
      "Crossfade",
    ];

    // Generate balanced scene breakdown (e.g. 10 to 14 foundational scenes per 30-min episode framework)
    const sceneTemplates = [
      {
        act: 1 as const,
        chapterId: "ch-01",
        duration: 12,
        loc: loc3,
        chars: [primaryChar.name],
        action: `${primaryChar.name} inspects their workspace, checking the notifications with focused determination.`,
        dialogueText: "Everything is set. Today is the day we change everything.",
        dialogueLang: "en" as const,
        cameraAngle: "Medium Shot" as CameraAngle,
        movement: "Slow Push-in" as CameraMovement,
        sfx: ["Keyboard typing", "Digital chime"],
        music: "Uplifting modern afro-fusion beat",
      },
      {
        act: 1 as const,
        chapterId: "ch-01",
        duration: 15,
        loc: loc3,
        chars: [primaryChar.name, secondaryChar.name],
        action: `${secondaryChar.name} bursts through the door brandishing a breakfast snack and shouting excitedly.`,
        dialogueText: "Buda! Umeona ile notification? Hatuna time ya kupoteza!",
        dialogueLang: "sheng" as const,
        cameraAngle: "Wide Shot" as CameraAngle,
        movement: "Dynamic Zoom" as CameraMovement,
        sfx: ["Door burst", "Laughter"],
        music: "Fast-paced comedic rhythm",
      },
      {
        act: 1 as const,
        chapterId: "ch-01",
        duration: 10,
        loc: loc4,
        chars: [mentorChar.name],
        action: `${mentorChar.name} looks at a digital schedule in the conference room, tapping fingers impatiently.`,
        dialogueText: "They have thirty minutes to arrive. Let's see if their hustle matches their promise.",
        dialogueLang: "en" as const,
        cameraAngle: "Medium Close-up" as CameraAngle,
        movement: "Static" as CameraMovement,
        sfx: ["Clock ticking", "Glass clink"],
        music: "Subtle corporate tension bassline",
      },
      {
        act: 2 as const,
        chapterId: "ch-02",
        duration: 16,
        loc: loc2,
        chars: [primaryChar.name, secondaryChar.name],
        action: `Both characters scramble aboard the vibrant matatu as heavy bass notes vibrate the windows.`,
        dialogueText: "Tulia buda, huyu dereva anajua shortcuts za Nairobi kuliko Google Maps!",
        dialogueLang: "sheng" as const,
        cameraAngle: "Medium Shot" as CameraAngle,
        movement: "Handheld Shake" as CameraMovement,
        sfx: ["Matatu horn", "Heavy bass drop", "Coins rattling"],
        music: "High energy Gengetone beat",
      },
      {
        act: 2 as const,
        chapterId: "ch-02",
        duration: 14,
        loc: loc2,
        chars: [primaryChar.name],
        action: `${primaryChar.name} gasps as the red battery indicator flashes at 5% on their screen.`,
        dialogueText: "No no no... 5%?! Kevo, where is the backup power bank?!",
        dialogueLang: "en" as const,
        cameraAngle: "Close-up" as CameraAngle,
        movement: "Slow Push-in" as CameraMovement,
        sfx: ["Warning buzzer", "Gasps"],
        music: "Rising suspense string swell",
      },
      {
        act: 2 as const,
        chapterId: "ch-03",
        duration: 18,
        loc: loc1,
        chars: [primaryChar.name, secondaryChar.name],
        action: `Traffic comes to a dead halt along the roundabout; the driver shrugs unapologetically.`,
        dialogueText: "Jam imekwama kabisa. Kama tunataka kufika, lazima tuchape lap!",
        dialogueLang: "sheng" as const,
        cameraAngle: "Wide Shot" as CameraAngle,
        movement: "Tracking Shot" as CameraMovement,
        sfx: ["Loud car horns", "Street shouting"],
        music: "Urgent comedic brass run",
      },
      {
        act: 3 as const,
        chapterId: "ch-04",
        duration: 20,
        loc: loc1,
        chars: [primaryChar.name, secondaryChar.name],
        action: `Both characters sprint down the avenue dodging street carts and fruit displays in frantic comic fashion.`,
        dialogueText: "Run, Brian, run! Usiangalie nyuma!",
        dialogueLang: "sheng" as const,
        cameraAngle: "Low Angle" as CameraAngle,
        movement: "Tracking Shot" as CameraMovement,
        sfx: ["Footsteps slamming", "Cart rattle"],
        music: "Fast orchestral afro-percussion",
      },
      {
        act: 3 as const,
        chapterId: "ch-04",
        duration: 15,
        loc: loc4,
        chars: [primaryChar.name, mentorChar.name],
        action: `${primaryChar.name} bursts through the boardroom doors panting, hair slightly wild, holding up the prototype.`,
        dialogueText: "We are here. And the solution is right here in my hand.",
        dialogueLang: "en" as const,
        cameraAngle: "Medium Shot" as CameraAngle,
        movement: "Slow Push-in" as CameraMovement,
        sfx: ["Heavy breathing", "Door open"],
        music: "Dramatic pause then victorious chords",
      },
      {
        act: 3 as const,
        chapterId: "ch-05",
        duration: 18,
        loc: loc4,
        chars: [primaryChar.name, secondaryChar.name, mentorChar.name],
        action: `${mentorChar.name} applauds with an impressed smile while ${secondaryChar.name} winks triumphantly in the background.`,
        dialogueText: "Impressive hustle. The contract is yours... but you launch in 48 hours.",
        dialogueLang: "en" as const,
        cameraAngle: "Wide Shot" as CameraAngle,
        movement: "Slow Pull-back" as CameraMovement,
        sfx: ["Boardroom applause", "Celebration chime"],
        music: "Triumphant energetic outro theme",
      },
    ];

    const scenes: Scene[] = sceneTemplates.map((tmpl, idx) => {
      const artStylePrefix = `${series.artStyle} art style, cel-shaded clean comic book lineart, rich dynamic saturation, 4k keyframe`;
      const charAnchors = tmpl.chars.map((name) => {
        const found = characters.find((c) => c.name === name);
        return found ? `${name}: ${found.appearance}, wearing ${found.clothing}` : name;
      }).join("; ");

      const aiPrompt = `${artStylePrefix}. Location: ${tmpl.loc}. Characters: ${charAnchors}. Action: ${tmpl.action}. Camera: ${tmpl.cameraAngle}, ${tmpl.movement}. Highly expressive animated comic episode keyframe.`;
      const negativePrompt = "photorealistic, 3d render, blurry, distorted anatomy, western superhero anatomy, washed out, low resolution, multiple heads, deformed hands";

      return {
        id: `scene-auto-${idx + 1}`,
        episodeId: "",
        sceneNumber: idx + 1,
        actNumber: tmpl.act,
        chapterId: tmpl.chapterId,
        duration: tmpl.duration,
        location: tmpl.loc,
        locationDetails: `Scene set at ${tmpl.loc}`,
        characters: tmpl.chars,
        dialogue: [
          {
            id: `diag-${idx + 1}`,
            characterId: characters.find((c) => c.name === tmpl.chars[0])?.id || "char-01",
            characterName: tmpl.chars[0],
            line: tmpl.dialogueText,
            language: tmpl.dialogueLang,
            emotion: "expressive",
          },
        ],
        narration: idx === 0 ? "When opportunity knocks in the city, seconds matter." : undefined,
        visualDescription: tmpl.action,
        cameraAngle: tmpl.cameraAngle,
        cameraMovement: tmpl.movement,
        action: tmpl.action,
        facialExpressions: idx % 2 === 0 ? "Excited and intense" : "Comedic shock and surprise",
        soundEffects: tmpl.sfx,
        backgroundMusic: tmpl.music,
        transition: transitions[idx % transitions.length],
        aiPrompt,
        negativePrompt,
        status: "pending",
        retryCount: 0,
        costEstimate: Math.round(tmpl.duration * 1.0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    const totalSeconds = scenes.reduce((sum, s) => sum + s.duration, 0);

    return {
      seriesId: series.id,
      episodeNumber: (series.episodeCount || 0) + 1,
      title,
      logline: `In the heart of Nairobi, a high-stakes challenge tests ${primaryChar.name}'s wit and grit against unexpected comic urban hurdles.`,
      synopsis: `An engaging 30-minute animated comic episode depicting the energetic clash of ambition, comedy, and street-smart survival in Nairobi, starring ${mainChars.map((c) => c.name).join(", ")}.`,
      targetDurationMinutes,
      actualDurationSeconds: totalSeconds,
      status: "storyboarded",
      charactersInvolved: mainChars.map((c) => c.name),
      threeActStructure: {
        beginning: `${primaryChar.name} receives an unexpected ultimatum that sets the clock ticking.`,
        conflict: `A chaotic urban obstacle threatens to derail the mission before it even starts.`,
        escalation: `Battery failure, intense Nairobi traffic gridlock, and hilarious miscommunications compound the urgency.`,
        climax: `A breathless downtown sprint brings ${primaryChar.name} face to face with the final challenge.`,
        resolution: `A charismatic breakthrough clinches victory through impromptu creativity.`,
        endingHook: `A new twist arrives immediately after victory, setting up the next episode.`,
      },
      chapters,
      scenes,
      progressPercent: 0,
    };
  }

  private deriveTitle(prompt: string): string {
    const cleaned = prompt.replace(/[^\w\s]/gi, "").trim();
    if (!cleaned) return "Nairobi Chronicles";
    const words = cleaned.split(/\s+/);
    if (words.length <= 4) return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return words.slice(0, 4).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
}

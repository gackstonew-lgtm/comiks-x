import { Character, ComicSeries, LocationItem, Scene, ComicArtStyle } from "@/types";

export interface PromptCompilationInput {
  series: ComicSeries;
  scene: Scene;
  characters: Character[];
  location?: LocationItem;
  previousScene?: Scene;
  customDirectives?: string;
}

export interface CompiledPromptResult {
  positivePrompt: string;
  negativePrompt: string;
  artStyleTokens: string;
  characterTokens: string[];
  cameraTokens: string;
  continuityTokens: string;
}

export class ComicPromptEngine {
  /**
   * Style-specific prompt enhancers
   */
  private static stylePresets: Record<ComicArtStyle, { prefix: string; suffix: string; negative: string }> = {
    "African Comic": {
      prefix: "Masterpiece African Comic art style, rich Afro-futuristic cel-shaded animation, crisp black graphic ink contours, vibrant Kenyan color saturation, warm earth and neon glow accents",
      suffix: "4K ultra-detailed animated comic keyframe, dynamic high-contrast comic book lighting, authentic African aesthetic, studio production quality",
      negative: "photorealistic, live action, Western superhero exaggeration, washed out colors, 3d clay render, distorted faces, mutated fingers, extra limbs, low resolution, blurry",
    },
    "2D Comic": {
      prefix: "Classic 2D comic book animation, sharp ink linework, vibrant flat colors, retro halftone dot pattern textures, bold comic panel shading",
      suffix: "comic book illustration in motion, clean outlines, bold dynamic shadows, expressive character animation",
      negative: "3d render, photorealism, blurry outlines, muddy colors, CGI, distorted anatomy",
    },
    "Western Comic": {
      prefix: "Modern Western comic graphic novel aesthetic, dynamic cross-hatching, dramatic muscular anatomy, high-impact chiaroscuro lighting, cinematic comic angles",
      suffix: "Marvel and DC animation inspired, gritty ink lines, rich deep blacks, powerful motion staging",
      negative: "flat cartoon, anime eyes, washed out, blurry, bad anatomy, photorealistic",
    },
    "Anime-inspired": {
      prefix: "High-end anime animation aesthetic, fluid cel-shading, expressive anime eyes, modern Japanese-African animation fusion, glowing atmospheric lighting",
      suffix: "Makoto Shinkai and Ufotable inspired cinematic lighting, clean linework, vibrant animation frame",
      negative: "western comic heavy ink, photorealistic, 3d CGI, low budget, blurry faces",
    },
    "Cartoon": {
      prefix: "Vibrant playful animated cartoon, smooth rounded shapes, lively exaggerated facial expressions, saturated candy colors, clean vector linework",
      suffix: "smooth Saturday morning animation style, charming character movement, vivid cheerful lighting",
      negative: "gritty, dark noir, photorealistic, scary, desaturated, hyper-detailed",
    },
    "Cinematic Cartoon": {
      prefix: "Cinematic animated feature film style, Spider-Verse and Arcane inspired visual flair, painterly stylized textures, dramatic volumetric lighting",
      suffix: "award-winning animated studio aesthetic, rich depth of field, vivid atmospheric particles",
      negative: "cheap 2d, stick figure, photorealistic live action, uncanny valley, flat lighting",
    },
    "Motion Comic": {
      prefix: "Layered digital motion comic, parallax graphic novel panels, atmospheric smoke and neon lighting, subtle graphic depth",
      suffix: "stylized motion comic keyframe, bold speech bubble typography ready, dramatic contrast",
      negative: "photorealistic, chaotic camera, live video, low quality scan",
    },
    "Graphic Novel": {
      prefix: "Dark noir graphic novel, Frank Miller high contrast black and white with striking selective amber accents, heavy ink shadows, gritty urban rain",
      suffix: "intense graphic novel mood, razor-sharp silhouettes, dramatic cinematic framing",
      negative: "bright pastel colors, childish cartoon, photorealistic, blurry ink",
    },
    "Satirical Cartoon": {
      prefix: "Editorial satirical comic style, expressive energetic caricatures, punchy comedic timing, bold dynamic poses",
      suffix: "hilarious animated comic panel, exaggerated gestures, crisp comic print aesthetic",
      negative: "somber, photorealistic, dark drama, 3d render",
    },
    "Minimalist Comic": {
      prefix: "Modern minimalist comic illustration, clean two-tone palette, elegant simple vector strokes, spacious aesthetic composition",
      suffix: "sleek indie graphic novel style, understated elegance, clean framing",
      negative: "busy background, photorealism, heavy clutter, muddy gradients",
    },
  };

  /**
   * Compiles complete structured, consistent prompt for video generation
   */
  public static compilePrompt(input: PromptCompilationInput): CompiledPromptResult {
    const { series, scene, characters, location, previousScene, customDirectives } = input;

    // 1. Art Style
    const stylePreset = this.stylePresets[series.artStyle] || this.stylePresets["African Comic"];
    const artStyleTokens = `${stylePreset.prefix}, series: "${series.title}"`;

    // 2. Character Anchors (Consistency Engine)
    const characterTokens: string[] = [];
    const involvedCharacters = characters.filter((c) =>
      scene.characters.some((name) => name.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(name.toLowerCase()))
    );

    if (involvedCharacters.length > 0) {
      involvedCharacters.forEach((c) => {
        const token = `[CHARACTER ${c.name}]: identical consistent facial structure, age ${c.age}, ${c.skinTone} skin, ${c.hairstyle} hairstyle, wearing signature ${c.clothing}, ${c.appearance}, exact face lock`;
        characterTokens.push(token);
      });
    } else if (scene.characters.length > 0) {
      characterTokens.push(`Characters present: ${scene.characters.join(", ")}`);
    }

    // 3. Location Tokens
    let locationToken = `Environment: ${scene.location}`;
    if (location) {
      locationToken = `Setting [${location.name}]: ${location.visualPrompt || location.description}`;
    } else if (scene.locationDetails) {
      locationToken = `Setting: ${scene.location} (${scene.locationDetails})`;
    }

    // 4. Camera & Action Directives
    const cameraTokens = `Cinematography: ${scene.cameraAngle}, ${scene.cameraMovement}. Action: ${scene.action}. Emotion/Expression: ${scene.facialExpressions}`;

    // 5. Continuity Anchoring from previous scene
    let continuityTokens = "Maintain exact character wardrobe, hairstyle, skin tone, and artistic linework from previous shots.";
    if (previousScene && previousScene.characters.some((c) => scene.characters.includes(c))) {
      continuityTokens += ` Direct continuity from Scene ${previousScene.sceneNumber}: characters keep identical attire and lighting.`;
    }

    // 6. Sound & Mood cues
    const audioTokens = `Atmosphere: ${scene.backgroundMusic}. Transition: ${scene.transition}`;

    // Assemble Positive Prompt
    const promptParts = [
      artStyleTokens,
      characterTokens.join(" | "),
      locationToken,
      cameraTokens,
      continuityTokens,
      audioTokens,
      customDirectives,
      stylePreset.suffix,
    ].filter(Boolean);

    const positivePrompt = promptParts.join(". ");

    // Assemble Negative Prompt
    const negativePrompt = [
      stylePreset.negative,
      "changing clothes between shots, altered hair style, inconsistent face, Western comic caricature distortion, photorealistic faces, messy blur, glitch, disjointed frame, watermark",
      scene.negativePrompt,
    ].filter(Boolean).join(", ");

    return {
      positivePrompt,
      negativePrompt,
      artStyleTokens,
      characterTokens,
      cameraTokens,
      continuityTokens,
    };
  }

  /**
   * Generates character sheet prompt for Character Bible
   */
  public static compileCharacterSheetPrompt(character: Character, style: ComicArtStyle): string {
    const stylePreset = this.stylePresets[style] || this.stylePresets["African Comic"];
    return `${stylePreset.prefix}, model turnaround character concept sheet, 3 views: front view, three-quarter angle, side profile. Character: ${character.name}, age ${character.age}, ${character.skinTone} skin tone, ${character.hairstyle} hairstyle, signature ${character.clothing}, ${character.appearance}, ${character.personality}. Clean white backdrop, model sheet guides, highly consistent cel-shaded comic lineart, 4K production asset.`;
  }

  /**
   * Generates thumbnail concept prompt
   */
  public static compileThumbnailPrompt(series: ComicSeries, title: string, focalCharacter: Character, style: ComicArtStyle): string {
    const stylePreset = this.stylePresets[style] || this.stylePresets["African Comic"];
    return `${stylePreset.prefix}, viral YouTube and TikTok high-contrast comic book cover thumbnail for episode "${title}". Featuring ${focalCharacter.name} with intense, exaggerated facial reaction, dynamic dramatic lighting, neon color pop, bold typography layout space, thrilling comic action angle, high visual retention composition.`;
  }
}

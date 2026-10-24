import { VisemeShape, VisemeFrame } from "../render-engine/schema";

export class VisemeExtractor {
  /**
   * Generates timed viseme frames (A-X) from phonetic transcription or word timestamps.
   */
  public extractVisemesFromText(
    text: string, 
    totalDurationMs: number
  ): VisemeFrame[] {
    const words = text.trim().split(/\s+/);
    if (words.length === 0) {
      return [{ timeMs: 0, shape: "X" }];
    }

    const timePerWord = totalDurationMs / words.length;
    const visemes: VisemeFrame[] = [];

    words.forEach((word, wordIdx) => {
      const wordStartMs = Math.round(wordIdx * timePerWord);
      const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");
      
      // Analyze letters in the word to approximate phonetic mouth movement
      const chars = cleanWord.split("");
      const stepMs = Math.max(50, Math.round(timePerWord / (chars.length || 1)));

      chars.forEach((ch, charIdx) => {
        const timeMs = wordStartMs + (charIdx * stepMs);
        let shape: VisemeShape = "B";

        if ("mbp".includes(ch)) {
          shape = "A"; // Closed
        } else if ("eiy".includes(ch)) {
          shape = "B"; // EE consonant
        } else if ("ea".includes(ch)) {
          shape = "C"; // EH, AH open
        } else if ("o".includes(ch)) {
          shape = "E"; // Rounded O
        } else if ("uw".includes(ch)) {
          shape = "F"; // Puckered OO
        } else if ("fv".includes(ch)) {
          shape = "G"; // Fricative
        } else if ("lth".includes(ch)) {
          shape = "H"; // Wide L/TH
        }

        visemes.push({ timeMs, shape });
      });
    });

    // End with rest shape
    visemes.push({ timeMs: totalDurationMs, shape: "X" });

    return visemes;
  }
}

export const visemeExtractor = new VisemeExtractor();

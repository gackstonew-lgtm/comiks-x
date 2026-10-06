import { Scene, Character, ContinuityWarning, ContinuityReport, ComicSeries } from "@/types";
import { characterOS } from "@/lib/character-os";

export class ContinuityEngine {
  private static instance: ContinuityEngine;

  private constructor() {}

  public static getInstance(): ContinuityEngine {
    if (!ContinuityEngine.instance) {
      ContinuityEngine.instance = new ContinuityEngine();
    }
    return ContinuityEngine.instance;
  }

  /**
   * Evaluates all scenes in an episode for character, world, and narrative continuity
   */
  public verifyEpisodeContinuity(
    episodeId: string,
    scenes: Scene[],
    characters: Character[],
    series: ComicSeries
  ): ContinuityReport {
    const warnings: ContinuityWarning[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const current = scenes[i];
      const previous = i > 0 ? scenes[i - 1] : null;

      // 1. Character Wardrobe & Appearance Continuity
      current.characters.forEach((charName) => {
        const char = characters.find((c) => c.name.toLowerCase().includes(charName.toLowerCase()));
        if (!char) return;

        // Check if current action mentions an altered outfit without an approved lock override
        const actionLower = current.action.toLowerCase();
        if (actionLower.includes("suit") && !char.clothing.toLowerCase().includes("suit")) {
          const lockCheck = characterOS.checkLock(char.id, "clothing", "formal suit", current.id);
          if (!lockCheck.isAllowed) {
            warnings.push({
              id: `cont-char-${current.id}-${char.id}`,
              type: "character",
              severity: "warning",
              sceneNumber: current.sceneNumber,
              characterName: char.name,
              issue: `${char.name} is described in formal suit, but locked wardrobe is "${char.clothing}".`,
              previousContext: `Scene ${previous?.sceneNumber || 1}: ${char.clothing}`,
              currentContext: `Scene ${current.sceneNumber}: "${current.action}"`,
              suggestedFix: `Revert to locked signature outfit or approve an explicit Scene ${current.sceneNumber} wardrobe override.`,
            });
          }
        }
      });

      // 2. World Continuity (Sudden unexplained location jumps)
      if (previous) {
        const isContinuousAction = previous.action.toLowerCase().includes("enters") || previous.action.toLowerCase().includes("sprints");
        if (isContinuousAction && previous.location !== current.location && !current.transition.includes("Wipe") && !current.transition.includes("Cut")) {
          warnings.push({
            id: `cont-world-${current.id}`,
            type: "world",
            severity: "warning",
            sceneNumber: current.sceneNumber,
            issue: `Abrupt environment transition from "${previous.location}" to "${current.location}".`,
            previousContext: `Scene ${previous.sceneNumber} in ${previous.location}`,
            currentContext: `Scene ${current.sceneNumber} in ${current.location}`,
            suggestedFix: "Add establishing transit shot or utilize a Comic Halftone Wipe transition.",
          });
        }
      }

      // 3. Narrative Continuity (Dialogue emotion match)
      if (current.dialogue && current.dialogue.length > 0) {
        current.dialogue.forEach((d) => {
          if (d.line.includes("?!") && d.emotion === "calm") {
            warnings.push({
              id: `cont-narr-${current.id}-${d.id}`,
              type: "narrative",
              severity: "warning",
              sceneNumber: current.sceneNumber,
              characterName: d.characterName,
              issue: `Exclamation and panic in dialogue "${d.line}" contradicts calm emotion tag.`,
              previousContext: "Pacing escalation",
              currentContext: `Emotion marked as "${d.emotion}"`,
              suggestedFix: "Update dialogue emotion to 'panicked' or 'alarmed' for accurate voice synthesis.",
            });
          }
        });
      }
    }

    return {
      episodeId,
      timestamp: new Date().toISOString(),
      passed: warnings.length === 0,
      warnings,
    };
  }

  /**
   * Applies an automated fix to an identified continuity issue
   */
  public applyFix(
    warning: ContinuityWarning,
    scene: Scene,
    characters: Character[]
  ): Scene {
    if (warning.type === "character" && warning.characterName) {
      const char = characters.find((c) => c.name.toLowerCase().includes(warning.characterName!.toLowerCase()));
      if (char) {
        // Enforce baseline locked wardrobe
        characterOS.requestOverride({
          targetId: char.id,
          level: "scene",
          field: "clothing",
          originalValue: char.clothing,
          overrideValue: char.clothing,
          reason: "Auto-reverted to locked continuity wardrobe baseline",
          approvedForSceneId: scene.id,
          isApproved: true,
        });
      }
    }

    if (warning.type === "narrative" && scene.dialogue && scene.dialogue.length > 0) {
      scene.dialogue[0].emotion = "urgent and alarmed";
    }

    return scene;
  }
}

export const continuityEngine = ContinuityEngine.getInstance();

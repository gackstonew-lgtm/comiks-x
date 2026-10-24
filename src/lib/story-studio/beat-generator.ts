export interface StoryBeat {
  beatNumber: number;
  name: "Hook" | "Setup" | "Inciting Incident" | "Escalation" | "Punchline" | "Resolution";
  description: string;
  suggestedDurationSeconds: number;
  cameraMovement: string;
  charactersInvolved: string[];
  comicPanelType: "splash" | "reaction" | "action" | "punchline_burst";
}

export class BeatGenerator {
  /**
   * Generates a viral 3-act / comedy short beat sheet tailored for vertical platforms (TikTok, Reels, Shorts).
   */
  public generateComedyBeats(premise: string, characterNames: string[]): StoryBeat[] {
    const lead = characterNames[0] || "Brayo";
    const foil = characterNames[1] || "The Preacher";

    return [
      {
        beatNumber: 1,
        name: "Hook",
        description: `Visual hook: Sudden extreme loud noise shocks ${lead} awake. Immediate comedic problem established: "${premise}".`,
        suggestedDurationSeconds: 3.0,
        cameraMovement: "Snap Zoom In + Screen Shake",
        charactersInvolved: [lead],
        comicPanelType: "splash",
      },
      {
        beatNumber: 2,
        name: "Inciting Incident",
        description: `${lead} looks out window or reacts to the absurdly loud speaker tower blasting right next to the bedroom wall.`,
        suggestedDurationSeconds: 2.5,
        cameraMovement: "Quick Pan Right",
        charactersInvolved: [lead, foil],
        comicPanelType: "action",
      },
      {
        beatNumber: 3,
        name: "Escalation",
        description: `${foil} intensifies preaching over megaphone with absurd microphone feedback and energetic praise.`,
        suggestedDurationSeconds: 2.5,
        cameraMovement: "Low Angle Dutch Tilt",
        charactersInvolved: [foil],
        comicPanelType: "reaction",
      },
      {
        beatNumber: 4,
        name: "Punchline",
        description: `${lead} delivers snappy Sheng remark while putting pillows over head as sound waves shake the room.`,
        suggestedDurationSeconds: 2.0,
        cameraMovement: "Extreme Close-Up + Impact Frame",
        charactersInvolved: [lead],
        comicPanelType: "punchline_burst",
      },
    ];
  }
}

export const beatGenerator = new BeatGenerator();

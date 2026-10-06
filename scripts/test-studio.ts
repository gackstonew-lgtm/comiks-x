import { db } from "../src/lib/db";
import { ComicPromptEngine } from "../src/lib/prompt-engine";
import { StoryLlmProvider } from "../src/lib/providers/story-llm-provider";
import { VoiceProvider } from "../src/lib/providers/voice-provider";
import { VideoProviderFactory } from "../src/lib/providers/provider-factory";
import { queueManager } from "../src/lib/queue";
import { SocialClipExtractor } from "../src/lib/clips";
import { EpisodeExportBuilder } from "../src/lib/export";
import { CostManager } from "../src/lib/cost";

async function runStudioTests() {
  console.log("==================================================");
  console.log("   COMIKS X STUDIO - COMPREHENSIVE TEST SUITE     ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST 1: Comic Series System
  console.log("--- 1. Testing Comic Series System ---");
  const seriesList = db.getSeries();
  assert(seriesList.length > 0, `Series loaded: found ${seriesList.length} series`);
  const nairobiSeries = seriesList[0];
  assert(nairobiSeries.artStyle === "African Comic", `Series art style is "${nairobiSeries.artStyle}"`);
  assert(nairobiSeries.isStyleLocked === true, "Visual art style is locked across series");
  assert(nairobiSeries.worldRules.length > 0, `World rules defined: ${nairobiSeries.worldRules.length} rules`);

  // TEST 2: Character Bible & Consistency
  console.log("\n--- 2. Testing Character Bible & Consistency ---");
  const characters = db.getCharacters(nairobiSeries.id);
  assert(characters.length >= 3, `Found ${characters.length} characters in Nairobi bible`);
  const brian = characters.find((c) => c.name.includes("Brian"));
  assert(Boolean(brian), "Found main protagonist Brian Otieno");
  if (!brian) throw new Error("Brian missing");

  assert(brian.isLocked === true, "Brian's character design is locked for consistency");
  assert(brian.clothing.includes("safari"), `Wardrobe anchor preserved: "${brian.clothing}"`);
  assert(brian.accent.includes("Kenyan"), `Voice accent anchor: "${brian.accent}"`);

  // Turnaround model sheet prompt
  const sheetPrompt = ComicPromptEngine.compileCharacterSheetPrompt(brian, nairobiSeries.artStyle);
  assert(sheetPrompt.includes("3 views: front view"), "Character turnaround prompt generated 3 views");

  // TEST 3: Story Creator & 30-Min Decomposition
  console.log("\n--- 3. Testing Story Creator & 30-Min Decomposition ---");
  const storyEngine = new StoryLlmProvider();
  const episodeDraft = await storyEngine.generateEpisodeStructure({
    series: nairobiSeries,
    characters,
    locations: db.getLocations(nairobiSeries.id),
    mode: "idea",
    promptContent: "A young Kenyan developer gets his first big client but everything goes wrong.",
    targetDurationMinutes: 30,
  });

  assert(Boolean(episodeDraft.title), `Episode title generated: "${episodeDraft.title}"`);
  assert(episodeDraft.threeActStructure.beginning.length > 0, "Act 1 Beginning generated");
  assert(episodeDraft.threeActStructure.conflict.length > 0, "Act 1 Conflict generated");
  assert(episodeDraft.threeActStructure.escalation.length > 0, "Act 2 Escalation generated");
  assert(episodeDraft.threeActStructure.climax.length > 0, "Act 2 Climax generated");
  assert(episodeDraft.threeActStructure.resolution.length > 0, "Act 3 Resolution generated");
  assert(episodeDraft.threeActStructure.endingHook.length > 0, "Ending hook generated");
  assert(episodeDraft.chapters.length >= 4, `Chapters structured: ${episodeDraft.chapters.length} chapters`);
  assert(episodeDraft.scenes.length >= 8, `Decomposed into ${episodeDraft.scenes.length} independent scenes`);

  const newEpisode = db.createEpisode(episodeDraft);
  assert(Boolean(newEpisode.id), `Episode persisted to database with ID: ${newEpisode.id}`);

  // TEST 4: Visual Storyboard & Prompt Engine
  console.log("\n--- 4. Testing Visual Storyboard & Prompt Engine ---");
  const firstScene = newEpisode.scenes[0];
  assert(Boolean(firstScene.location), `Scene 1 location: "${firstScene.location}"`);
  assert(Boolean(firstScene.cameraAngle), `Scene 1 camera angle: "${firstScene.cameraAngle}"`);
  assert(Boolean(firstScene.action), `Scene 1 action: "${firstScene.action}"`);

  const compiledPrompt = ComicPromptEngine.compilePrompt({
    series: nairobiSeries,
    scene: firstScene,
    characters,
  });
  assert(compiledPrompt.positivePrompt.includes(nairobiSeries.artStyle), "Compiled prompt includes art style anchor");
  assert(compiledPrompt.negativePrompt.includes("photorealistic"), "Negative prompt includes anti-photorealism guardrail");

  // TEST 5: Dialogue Voice Generation
  console.log("\n--- 5. Testing Character Dialogue Voice Synthesis ---");
  const voiceProvider = new VoiceProvider();
  const voiceResult = await voiceProvider.generateSpeech({
    character: brian,
    text: "Sasa buda! Form ni gani leo?",
    language: "sheng",
  });
  assert(Boolean(voiceResult.audioUrl), `Speech audio generated (duration: ${voiceResult.durationSeconds}s)`);

  // TEST 6: Modular AI Video Provider Abstraction
  console.log("\n--- 6. Testing Modular AI Video Provider Abstraction ---");
  const providerList = VideoProviderFactory.listProviders();
  assert(providerList.length >= 5, `Registered ${providerList.length} modular AI video providers (Luma, Runway, Kling, Fal, Sora)`);

  const activeProvider = VideoProviderFactory.getProvider("luma");
  assert(activeProvider.providerId === "luma", `Active provider instantiated: ${activeProvider.name}`);

  // TEST 7: Scene Regeneration & Cost Manager
  console.log("\n--- 7. Testing Scene Regeneration & Cost Manager ---");
  const costEstimate = CostManager.calculateEpisodeEstimate(newEpisode.scenes, "luma");
  assert(costEstimate.totalScenes === newEpisode.scenes.length, "Cost estimate calculated for all scenes");
  assert(costEstimate.totalEstimatedCostUsd > 0, `Estimated video cost: $${costEstimate.totalEstimatedCostUsd}`);

  // TEST 8: Social Media Viral Clip Extraction (TikTok & Reels 9:16)
  console.log("\n--- 8. Testing Social Media Clip Extractor (9:16) ---");
  const viralClips = SocialClipExtractor.extractViralClips({
    episode: newEpisode,
    preferredDurations: [15, 30, 45, 60, 90],
  });
  assert(viralClips.length === 5, `Extracted ${viralClips.length} viral clips (15s, 30s, 45s, 60s, 90s)`);
  assert(viralClips[0].aspectRatio === "9:16", "Clip formatted as vertical 9:16");

  // TEST 9: Subtitles & Export Builder
  console.log("\n--- 9. Testing Subtitle & Chapters Export Builder ---");
  const srtContent = EpisodeExportBuilder.generateSrt(newEpisode.scenes);
  assert(srtContent.includes("-->"), "SRT subtitles contain valid timecode arrows");

  const vttContent = EpisodeExportBuilder.generateVtt(newEpisode.scenes);
  assert(vttContent.startsWith("WEBVTT"), "WebVTT subtitles start with WEBVTT header");

  const chaptersText = EpisodeExportBuilder.generateChapterList(newEpisode);
  assert(chaptersText.includes("00:00"), "Chapter list contains starting timecode 00:00");

  const assemblyManifest = EpisodeExportBuilder.buildAssemblyManifest(newEpisode, "1080p");
  assert(assemblyManifest.resolution === "1080p", "Assembly manifest configured for 1080p resolution");

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runStudioTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

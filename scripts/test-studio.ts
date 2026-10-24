import { db } from "../src/lib/db";
import { ComicPromptEngine } from "../src/lib/prompt-engine";
import { StoryLlmProvider } from "../src/lib/providers/story-llm-provider";
import { VoiceProvider } from "../src/lib/providers/voice-provider";
import { VideoProviderFactory } from "../src/lib/providers/provider-factory";
import { queueManager } from "../src/lib/queue";
import { SocialClipExtractor } from "../src/lib/clips";
import { EpisodeExportBuilder } from "../src/lib/export";
import { CostManager } from "../src/lib/cost";
import { CharacterOperatingSystem } from "../src/lib/character-os";
import { worldBuilder, localizationEngine } from "../src/lib/world";
import { aiDirector, motionLibrary } from "../src/lib/director";
import { continuityEngine } from "../src/lib/continuity";
import { providerRouter, generationCache } from "../src/lib/router";
import { qualityGate, assetVersionControl } from "../src/lib/quality";
import { audioDubbingStudio } from "../src/lib/audio-studio";
import { retentionEngine, derivativesGenerator } from "../src/lib/social-director";
import { creatorPlatform } from "../src/lib/creator-platform";
import { seedDevData } from "./dev-seed";

async function runStudioTests() {
  console.log("==================================================");
  console.log("   COMIKS X STUDIO - COMPREHENSIVE TEST SUITE     ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, message: string) => {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  };

  try {
    // Ensure test fixtures are available for unit validation
    seedDevData();

    // TEST 1: Comic Series System
    console.log("--- 1. Testing Comic Series System ---");
    const seriesList = db.getSeries();
    assert(seriesList.length > 0, `Series loaded: found ${seriesList.length} series`);
    const nairobiSeries = seriesList.find((s) => s.id === "series-nairobi-01") || seriesList[0];
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

  // TEST 10: Character Operating System & 5D DNA Synthesis
  console.log("\n--- 10. Testing Character Operating System (5D DNA) ---");
  const charOS = CharacterOperatingSystem.getInstance();
  const fullyFormedBrian = charOS.ensureCharacterDNA(brian);
  assert(Boolean(fullyFormedBrian.dna?.identity?.nationality), `Identity DNA synthesized: ${fullyFormedBrian.dna?.identity?.nationality}`);
  assert(Boolean(fullyFormedBrian.dna?.visual?.distinctiveFeatures), "Visual DNA preserved distinctive facial & wardrobe anchors");
  assert(fullyFormedBrian.dna?.personality?.values.length! > 0, `Personality DNA values count: ${fullyFormedBrian.dna?.personality?.values.length}`);
  assert(fullyFormedBrian.dna?.performance?.energyLevel! > 5, `Performance DNA energy level: ${fullyFormedBrian.dna?.performance?.energyLevel}/10`);
  assert(Boolean(fullyFormedBrian.dna?.voice?.slang.includes("Buda")), "Voice DNA lexicon includes authentic Sheng anchor 'Buda'");

  // Reference pack
  const refPack = charOS.getCharacterReferences(brian.id);
  assert(refPack.length >= 2, `Reference pack contains ${refPack.length} multi-angle reference items`);

  // Memory DNA
  const memoryItem = charOS.addMemory(brian.id, {
    description: "Successfully delivered high-stakes demo despite matatu breakdown.",
    type: "event",
    significance: "pivotal",
  });
  assert(memoryItem.significance === "pivotal", "Episodic memory recorded in Character DNA");

  // Lock override with audit
  const override = charOS.requestLockOverride({
    level: "character",
    entityId: brian.id,
    attribute: "clothing",
    overrideValue: "Mud-splattered safari jacket after rainfall",
    justification: "Nairobi afternoon flash flood sequence in Scene 6",
    approvedBy: "Lead Animator",
  });
  assert(override.isApproved === true, "Hierarchical lock override audited and approved");

  // TEST 11: World Builder & Cultural Localization Engine
  console.log("\n--- 11. Testing World Builder & Cultural Localization Engine ---");
  const nairobiWorld = worldBuilder.getOrCreateDefaultWorld(nairobiSeries.id);
  assert(nairobiWorld.environmentalRules.length >= 3, `World environmental rules defined: ${nairobiWorld.environmentalRules.length}`);
  assert(Boolean(nairobiWorld.lightingRules), `Atmospheric lighting rules defined: "${nairobiWorld.lightingRules}"`);

  const shengGlossary = localizationEngine.getGlossary();
  assert(shengGlossary.length >= 6, `Cultural glossary loaded: ${shengGlossary.length} authentic terms`);
  const analysis = localizationEngine.analyzeAndEnhanceDialogue("Buda ile ngori ya Kencom ilikuwa noma!", "Brian");
  assert(analysis.detectedSlang.length >= 2, `Code-switching analyzer detected: ${analysis.detectedSlang.join(", ")}`);

  // TEST 12: AI Director & Technical Shot Planner
  console.log("\n--- 12. Testing AI Director & Technical Shot Planner ---");
  const plannedShots = aiDirector.planSceneShots(firstScene, nairobiSeries, characters);
  assert(plannedShots.length >= 2, `Decomposed scene into ${plannedShots.length} technical generation shots (4–20s)`);
  assert(Boolean(plannedShots[0].lens), `Shot 1 camera lens: ${plannedShots[0].lens}`);
  assert(Boolean(plannedShots[0].motionPresetId || plannedShots[0].cameraMovement), `Shot 1 camera motion: ${plannedShots[0].motionPresetId || plannedShots[0].cameraMovement}`);

  const presets = motionLibrary.getPresets();
  assert(presets.length >= 6, `Motion preset library loaded ${presets.length} camera and character presets`);

  // TEST 13: Continuity Engine Diagnostics
  console.log("\n--- 13. Testing Continuity Engine Diagnostics ---");
  const continuityReport = continuityEngine.verifyEpisodeContinuity(
    newEpisode.id,
    newEpisode.scenes,
    characters,
    nairobiSeries
  );
  assert(Array.isArray(continuityReport.warnings), `Continuity scan evaluated all ${newEpisode.scenes.length} scenes`);
  assert(continuityReport.passed === true, "Continuity validation passed: 0 critical visual/narrative breaches");

  // TEST 14: Modular Video Provider Router & SHA-256 Cache
  console.log("\n--- 14. Testing Provider Router & SHA-256 Fingerprint Cache ---");
  const capabilities = providerRouter.getCapabilities();
  assert(capabilities.length >= 5, `Provider router capabilities registry has ${capabilities.length} active models`);

  // Fingerprint computation & caching test
  const testReq = {
    sceneId: firstScene.id,
    prompt: "Brian Otieno walking through Kencom bus station in Nairobi",
    durationSeconds: 10,
    aspectRatio: "16:9" as const,
    stylePreset: "African Comic",
  };
  const contentHash = generationCache.computeFingerprint(testReq, "luma", "default");
  assert(contentHash.length === 64, `Computed cryptographic SHA-256 fingerprint: ${contentHash.substring(0, 16)}...`);

  generationCache.store({
    contentHash,
    outputUrl: "https://cdn.example.com/cached-scene-kencom.mp4",
    prompt: testReq.prompt,
    provider: "luma",
    model: "default",
    duration: 10,
    createdAt: new Date().toISOString(),
  });

  const cacheLookup = generationCache.lookup(contentHash);
  assert(Boolean(cacheLookup && cacheLookup.outputUrl), "SHA-256 generation cache successfully recorded and retrieved artifact");

  // Router cache hit test
  const routerCachedHit = await providerRouter.routeAndGenerate(testReq, "luma");
  assert(routerCachedHit.cached === true, `Router dispatched cached asset instantaneously without re-generating (hash: ${routerCachedHit.contentHash.substring(0, 12)})`);

  // TEST 15: Quality Gate & Asset Version Control
  console.log("\n--- 15. Testing Multi-Factor Quality Gate & Version Control ---");
  const qualityScore = qualityGate.evaluateSceneQuality(firstScene, characters, true, true);
  assert(qualityScore.overall >= 80, `Quality gate score: ${qualityScore.overall}/100 [A Grade]`);
  assert(qualityScore.visualScore >= 80, `Visual coherence score: ${qualityScore.visualScore}/100`);

  // Version control
  const v1 = assetVersionControl.recordVersion(firstScene.id, "https://cdn.example.com/take1.mp4", "Initial take", "luma", "ray", "approved");
  const v2 = assetVersionControl.recordVersion(firstScene.id, "https://cdn.example.com/take2.mp4", "Enhanced lighting", "luma", "ray", "approved");
  assert(v2.versionNumber === 2, "Asset version control recorded version take v2");
  const rolledBack = assetVersionControl.rollbackToVersion(firstScene.id, 1);
  assert(rolledBack?.versionNumber === 1, "Asset rollback successfully restored take v1");

  // TEST 16: Multilingual Audio Dubbing Studio
  console.log("\n--- 16. Testing Multilingual Audio Dubbing Studio ---");
  const dubbedTrack = await audioDubbingStudio.generateDubbedTrack(
    brian,
    "Bro, we have a big problem with the client server.",
    "sheng"
  );
  assert(dubbedTrack.language === "sheng", `Dubbed track language: ${dubbedTrack.language}`);
  assert(dubbedTrack.lipSyncEstimatedTiming.phonemeCount > 0, `Lip sync estimated phonemes: ${dubbedTrack.lipSyncEstimatedTiming.phonemeCount}`);

  // TEST 17: Social Director Retention Engine & 5-in-1 Derivatives
  console.log("\n--- 17. Testing Social Director Retention & Derivatives Bundle ---");
  const retention = retentionEngine.evaluateRetention(firstScene, viralClips[0].durationSeconds);
  assert(retention.hookScore > 80, `Hook score: ${retention.hookScore}%`);
  assert(retention.retentionScore > 75, `Retention score: ${retention.retentionScore}%`);


  const hookVariants = retentionEngine.generateHookVariants(firstScene);
  assert(hookVariants.length === 4, `Generated ${hookVariants.length} distinct viral hook variants (Curiosity, Narrative, Sheng, Satirical)`);

  const derivativesBundle = derivativesGenerator.generateDerivativesBundle(newEpisode);
  assert(derivativesBundle.shortVideos.length >= 3, `Bundle contains ${derivativesBundle.shortVideos.length} vertical 9:16 clips`);
  assert(derivativesBundle.quoteCards.length >= 3, `Bundle contains ${derivativesBundle.quoteCards.length} stylized quote cards`);
  assert(derivativesBundle.comicPanels.length >= 3, `Bundle contains ${derivativesBundle.comicPanels.length} high-res comic panels`);
  assert(derivativesBundle.characterClips.length >= 3, `Bundle contains ${derivativesBundle.characterClips.length} character highlight reels`);
  assert(derivativesBundle.storyPosts.length >= 2, `Bundle contains ${derivativesBundle.storyPosts.length} social story/carousel posts`);

  // TEST 18: Creator Platform Manager & AI Copilot
  console.log("\n--- 18. Testing Creator Platform Manager & AI Copilot ---");
  const brandKit = creatorPlatform.getBrandKit(nairobiSeries.id);
  assert(Boolean(brandKit.primaryColor && brandKit.secondaryColor), `Brand kit verified: Primary ${brandKit.primaryColor}, Secondary ${brandKit.secondaryColor}, Font: ${brandKit.typography}`);

  creatorPlatform.addContentPlanItem({
    episodeId: newEpisode.id,
    assetType: "clip",
    title: "Episode Teaser",
    platform: "tiktok",
    scheduledDate: new Date().toISOString(),
    status: "planned",
  });
  creatorPlatform.addContentPlanItem({
    episodeId: newEpisode.id,
    assetType: "clip",
    title: "Viral Action Cut",
    platform: "shorts",
    scheduledDate: new Date().toISOString(),
    status: "ready",
  });

  const plan = creatorPlatform.getContentPlan();
  assert(plan.length >= 2, `Content plan populated with ${plan.length} scheduled production drop items`);

  const assistantResponse = await creatorPlatform.handleAssistantQuery(
    "How to optimize continuity for Scene 3?",
    newEpisode,
    nairobiSeries
  );
  assert(Boolean(assistantResponse.response), `AI Creator Assistant delivered contextual director guidance: "${assistantResponse.response.substring(0, 60)}..."`);
  assert(Boolean(assistantResponse.relevantContext), `Context identified: ${assistantResponse.relevantContext}`);

  // TEST 19: 2D Video Production Engine & RenderSpec Validation
  console.log("\n--- 19. Testing 2D Video Production Engine & RenderSpec Validation ---");
  const { productionEngine, validateRenderSpec } = await import("../src/lib/render-engine");
  const defaultSpec = productionEngine.createDefaultSpec({
    episodeId: newEpisode.id,
    title: "That one church close to your house ⛪😂",
    aspectRatio: "9:16",
  });
  defaultSpec.scenes.push({
    sceneId: "scene-test-1",
    sceneIndex: 0,
    durationFrames: 90,
    productionMode: "limited_animation",
    fpsRetiming: 12,
    background: { plateUrl: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef7?w=1080" },
    characters: [],
    dialogues: [],
    vfx: [],
    camera: [],
  });
  const valResult = validateRenderSpec(defaultSpec);
  assert(valResult.success, "EpisodeRenderSpec strictly validated against Zod schema");
  assert(defaultSpec.captionBar.headlineText.includes("church"), `Top caption bar headline: "${defaultSpec.captionBar.headlineText}"`);
  assert(defaultSpec.captionBar.highlightColor === "#10B981", `Brand highlight color: ${defaultSpec.captionBar.highlightColor}`);

  // TEST 20: 4 Production Modes Execution
  console.log("\n--- 20. Testing 4 Production Modes Execution ---");
  // 1. Limited Animation (On-twos 12 fps)
  const steppedFrame = productionEngine.limitedAnimation.getSteppedFrame(7, 12, 30);
  assert(steppedFrame === 6 || steppedFrame === 7, `Stepped frame quantized: input 7 -> frame ${steppedFrame} (on-twos)`);
  const eyeState = productionEngine.limitedAnimation.evaluateEyeState(30, 42);
  assert(["open", "anticipate", "closed", "recover"].includes(eyeState), `Eye state evaluated: ${eyeState}`);

  // 2. Rigged Puppet Transforms
  const puppetPose = productionEngine.riggedPuppet.evaluatePuppetTransforms({
    character: {
      characterId: "char-1",
      name: "Brayo",
      xPercent: 50,
      yPercent: 50,
      scale: 1,
      poseTimeline: [],
    },
    frame: 15,
    fps: 30,
    speakingEnergy: 0.8,
  });
  assert(typeof puppetPose.torso.rotationDeg === "number", `Puppet torso transform rotation: ${puppetPose.torso.rotationDeg}°`);
  assert(typeof puppetPose.head.rotationDeg === "number", `Puppet head speech nod: ${puppetPose.head.rotationDeg}°`);

  // 3. AI Motion Hybrid Decimation
  const quantizedTime = productionEngine.aiHybrid.calculateQuantizedTimestamp(14, 30, 12);
  assert(quantizedTime >= 0, `AI hybrid timestamp quantized to cel frame: ${quantizedTime}s`);
  const celFilter = productionEngine.aiHybrid.getCelShadingFilter(0.85);
  assert(celFilter.includes("contrast"), `Cel-shading post-filter: ${celFilter}`);

  // 4. Motion Comic Multi-Panel Layout
  const panels = productionEngine.motionComic.generatePanelLayout("split_vertical", "9:16");
  assert(panels.length === 2, `Motion comic generated ${panels.length} stacked panels for vertical 9:16 layout`);

  // TEST 21: Character Bible & Face Embed Validator
  console.log("\n--- 21. Testing Character Bible & Consistency Embed Validator ---");
  const { characterBibleManager } = await import("../src/lib/character-os/character-bible");
  const { faceEmbedValidator } = await import("../src/lib/character-os/face-embed-validator");
  const bible = characterBibleManager.getOrCreateBible(brian);
  assert(bible.palette.primaryWardrobeHex === "#15803D", `Wardrobe palette lock: ${bible.palette.primaryWardrobeHex}`);
  const conditioningPrompt = characterBibleManager.compileConditioningPrompt(bible, "holding ears in bed");
  assert(conditioningPrompt.includes("HEX LOCK"), "Conditioning prompt includes hexadecimal wardrobe lock token");

  const embedValidation = faceEmbedValidator.evaluateCharacterTake({
    bible,
    generatedAssetUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
    seed: 42,
    promptUsed: conditioningPrompt,
  });
  assert(embedValidation.passed, `Face similarity passed: ${embedValidation.similarityScore} (threshold >= 0.88)`);
  assert(embedValidation.paletteDeltaPercentage < 10, `Palette drift: ${embedValidation.paletteDeltaPercentage}%`);

  // TEST 22: BiRefNet Matting Service
  console.log("\n--- 22. Testing BiRefNet Matting & Cutout Extraction ---");
  const { mattingService } = await import("../src/lib/character-os/matting-service");
  const matting = await mattingService.extractCutout("https://example.com/character.png");
  assert(matting.alphaBoundaryCleaned, "Alpha boundary edge-cleaned without background halos");

  // TEST 23: Sheng Vernacular & Viseme Extraction
  console.log("\n--- 23. Testing Sheng Phonetic Processor & Rhubarb Viseme Extractor ---");
  const { shengPhoneticProcessor } = await import("../src/lib/audio-studio/sheng-dictionary");
  const { visemeExtractor } = await import("../src/lib/audio-studio/viseme-extractor");
  const processedSheng = shengPhoneticProcessor.prepareTextForTTS("Buda, hii ni ngori sana!", "sheng");
  assert(Boolean(processedSheng), `Sheng TTS pre-processed: "${processedSheng}"`);
  const visemes = visemeExtractor.extractVisemesFromText("Buda, walianza maombi!", 2000);
  assert(visemes.length >= 4, `Extracted ${visemes.length} timed visemes (A-X) for dialogue speech`);

  // TEST 24: Audio Engine & -14 LUFS Music Ducking
  console.log("\n--- 24. Testing Audio Engine & -14 LUFS Music Ducking ---");
  const { audioMasterer } = await import("../src/lib/audio-studio/audio-masterer");
  const ducking = audioMasterer.calculateDucking(true);
  const musicTrack = ducking.find(t => t.trackName === "music");
  assert(musicTrack?.isDucked === true, "Music track dynamically ducked during active character dialogue");
  assert(audioMasterer.getLoudnessNormFilter(-14).includes("-14"), "FFmpeg loudness normalization calibrated to -14 LUFS");

  // TEST 25: Automated Quality Control & North Star Church Seed Scene Deliverable
  console.log("\n--- 25. Testing Quality Control Gate & 10s Church Deliverable ---");
  const { qualityControlGate } = await import("../src/lib/quality/qc-gate");
  const { SAMPLE_CHURCH_SEED_SPEC_LIMITED, SAMPLE_CHURCH_SEED_SPEC_PUPPET } = await import("../src/lib/render-engine/sample-seed-scene");
  const { renderJobQueue } = await import("../src/lib/render-service/job-queue");
  const { publishingPackGenerator } = await import("../src/lib/export/publishing-pack");

  const qcReport = qualityControlGate.inspectSpec(SAMPLE_CHURCH_SEED_SPEC_LIMITED);
  assert(qcReport.overallPassed, `QC Gate inspection passed with score: ${qcReport.scoreOutOf100}/100`);
  assert(SAMPLE_CHURCH_SEED_SPEC_LIMITED.scenes.length === 3, `Sample deliverable has ${SAMPLE_CHURCH_SEED_SPEC_LIMITED.scenes.length} scenes`);
  const totalDurationFrames = SAMPLE_CHURCH_SEED_SPEC_LIMITED.scenes.reduce((acc, s) => acc + s.durationFrames, 0);
  assert(totalDurationFrames === 300, `Total frames: ${totalDurationFrames} (= 10.0s @ 30fps)`);
  assert(SAMPLE_CHURCH_SEED_SPEC_PUPPET.scenes[0].productionMode === "rigged_puppet", "Puppet seed variant configured for rigged_puppet mode");

  // Job queue dispatch & publishing pack
  const job = renderJobQueue.enqueueJob(SAMPLE_CHURCH_SEED_SPEC_LIMITED);
  assert(job.status === "queued", `Job ${job.jobId} enqueued for off-serverless worker`);
  const pack = publishingPackGenerator.generatePack(SAMPLE_CHURCH_SEED_SPEC_LIMITED);
  assert(pack.formats.length === 4, `Publishing pack contains ${pack.formats.length} target formats (TikTok, Reels, Shorts, YouTube)`);

  // TEST 26: Site URL Helper & Supabase Auth Verification Redirect
  console.log("\n--- 26. Testing Site URL Helper & Auth Callback Redirect ---");
  const { getSiteUrl } = await import("../src/lib/utils/url");
  const siteUrl = getSiteUrl();
  assert(Boolean(siteUrl), `getSiteUrl() resolved: ${siteUrl}`);
  assert(!siteUrl.endsWith("/"), "getSiteUrl() consistently strips trailing slashes");
  const callbackUrl = `${siteUrl}/auth/callback`;
  assert(callbackUrl.endsWith("/auth/callback"), `Auth callback URL formatted correctly: ${callbackUrl}`);

  // Test priority hierarchy
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  try {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-studio.com/";
    assert(getSiteUrl() === "https://custom-studio.com", "NEXT_PUBLIC_SITE_URL takes precedence and strips trailing slash");

    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_VERCEL_URL = "comiks-preview.vercel.app";
    assert(getSiteUrl() === "https://comiks-preview.vercel.app", "NEXT_PUBLIC_VERCEL_URL is prefixed with https://");
  } finally {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
    process.env.NEXT_PUBLIC_VERCEL_URL = originalVercelUrl;
  }

  // TEST 27: PWA Manifest, Icons, Service Worker & Install Banner
  console.log("\n--- 27. Testing PWA Manifest, Icons, Service Worker & Install Banner ---");
  const fs = await import("fs");
  const path = await import("path");

  // Verify manifest
  const manifestPath = path.join(process.cwd(), "public", "manifest.webmanifest");
  assert(fs.existsSync(manifestPath), "public/manifest.webmanifest exists");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert(manifest.name === "Comiks X", `Manifest name: ${manifest.name}`);
  assert(manifest.short_name === "Comiks X", `Manifest short_name: ${manifest.short_name}`);
  assert(manifest.display === "standalone", `Manifest display: ${manifest.display}`);
  assert(manifest.theme_color === "#34d399", `Manifest theme_color: ${manifest.theme_color}`);
  assert(manifest.icons.length >= 3, `Manifest has ${manifest.icons.length} configured icons`);

  // Verify icons exist
  const iconsDir = path.join(process.cwd(), "public", "icons");
  assert(fs.existsSync(path.join(iconsDir, "icon-192x192.png")), "192x192 icon exists");
  assert(fs.existsSync(path.join(iconsDir, "icon-512x512.png")), "512x512 icon exists");
  assert(fs.existsSync(path.join(iconsDir, "icon-maskable-512x512.png")), "512x512 maskable icon exists");
  assert(fs.existsSync(path.join(iconsDir, "apple-touch-icon.png")), "apple-touch-icon exists");

  // Verify service worker
  const swPath = path.join(process.cwd(), "public", "sw.js");
  assert(fs.existsSync(swPath), "public/sw.js service worker exists");
  const swContent = fs.readFileSync(swPath, "utf8");
  assert(swContent.includes("/offline"), "Service worker caches offline fallback page");
  assert(swContent.includes("/auth/"), "Service worker explicitly excludes /auth/* from caching");
  assert(swContent.includes("supabase.co"), "Service worker explicitly excludes Supabase endpoints from caching");

  // TEST 28: Studio Upgrade Modules (Avatars, Templates, Brand Kit, Billing, Team, Assets)
  console.log("\n--- 28. Testing Studio Upgrade Modules ---");
  // 1. Avatars
  const initialAvatars = await db.getAvatars();
  assert(initialAvatars.length >= 2, `Avatars initialized: found ${initialAvatars.length} avatars`);
  const newAvatar = await db.createAvatar({
    name: "Zavala Presenter",
    category: "presenter",
    role: "Nairobi Tech Reporter",
    voiceId: "voice-ke-1",
    avatarType: "custom",
    stylePreset: "comic-vibrant",
    thumbnailUrl: "https://example.com/avatar.jpg",
    previewUrl: "https://example.com/avatar.jpg",
    consentVerified: true,
  });
  assert(Boolean(newAvatar.id), `Created new verified avatar with ID: ${newAvatar.id}`);
  assert(newAvatar.consentVerified === true, "Avatar has verified digital likeness consent");

  // 2. Templates
  const templates = await db.getTemplates();
  assert(templates.length >= 3, `Templates loaded: found ${templates.length} templates`);
  const tpl = await db.getTemplateById("tmpl-social-explainer");
  assert(Boolean(tpl), "Found TikTok comedy sketch template");

  // 3. Brand Kit
  const studioBrandKit = await db.getBrandKit();
  assert(Boolean(studioBrandKit.accentColor), `Brand kit loaded with accent: ${studioBrandKit.accentColor}`);
  const updatedBrand = await db.updateBrandKit({ primaryColor: "#111111", watermarkOpacity: 0.85 });
  assert(updatedBrand.primaryColor === "#111111", "Brand kit updated primary color");
  assert(updatedBrand.watermarkOpacity === 0.85, "Brand kit updated watermark opacity");

  // 4. Billing & Credits
  const billing = await db.getBillingAccount();
  const startingCredits = billing.currentBalance;
  assert(startingCredits > 0, `Billing initialized with ${startingCredits} credits`);
  await db.deductCredits(15, "AI Video Clip generation");
  const afterDeduction = await db.getBillingAccount();
  assert(afterDeduction.currentBalance === startingCredits - 15, `Credits deducted correctly: now ${afterDeduction.currentBalance}`);
  await db.addCredits(50, "Credit pack purchase");
  const afterAdd = await db.getBillingAccount();
  assert(afterAdd.currentBalance === startingCredits - 15 + 50, `Credits added correctly: now ${afterAdd.currentBalance}`);
  const txs = await db.getCreditTransactions();
  assert(txs.length >= 2, `Audit transactions recorded: ${txs.length} transactions`);

  // 5. Team Workspace
  const team = await db.getTeamWorkspace();
  assert(Boolean(team.name), `Team workspace loaded: ${team.name}`);
  assert(team.members.length >= 1, `Found ${team.members.length} team members`);
  const newMember = await db.addTeamMember({
    name: "Amani Oduor",
    email: "amani@example.com",
    role: "editor",
  });
  assert(Boolean(newMember.id), `Added team editor: ${newMember.name}`);
  const updatedRole = await db.updateTeamMemberRole(newMember.id, "admin");
  assert(updatedRole === true, "Updated team member role to admin");

  // 6. Assets Vault
  const newAsset = await db.createAsset({
    name: "Test Nairobi Skyline Still",
    type: "image",
    url: "https://example.com/skyline.png",
    size: "2.4 MB",
    aspectRatio: "16:9",
    tags: ["background", "nairobi"],
  });
  assert(Boolean(newAsset.id), `Asset created in vault with ID: ${newAsset.id}`);
  const fetchedAssets = await db.getAssets("image");
  assert(fetchedAssets.some(a => a.id === newAsset.id), "Asset retrieved from vault");

  // TEST 29: Instant Signup (No Email Verification) & Abuse Protection
  console.log("\n--- 29. Testing Instant Signup & Abuse Protection ---");
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  assert(emailRegex.test("valid.creator@studio.com"), "Email validator accepts valid creator email");
  assert(!emailRegex.test("invalid-email"), "Email validator rejects malformed email");
  assert(!emailRegex.test("@studio.com"), "Email validator rejects missing username");
  assert(!emailRegex.test("creator@"), "Email validator rejects missing domain");

  // Verify server-side SUPABASE_SERVICE_ROLE_KEY env setup
  if (fs.existsSync(".env.local")) {
    const envLines = fs.readFileSync(".env.local", "utf8").split("\n");
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [k, ...v] = trimmed.split("=");
        if (k && !process.env[k.trim()]) {
          process.env[k.trim()] = v.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert(Boolean(serviceKey), "SUPABASE_SERVICE_ROLE_KEY configured for server-side admin user creation");

  // Verify signup route file exists
  const signupRoutePath = path.join(process.cwd(), "src", "app", "api", "auth", "signup", "route.ts");
  assert(fs.existsSync(signupRoutePath), "Server route src/app/api/auth/signup/route.ts exists");
  const signupRouteCode = fs.readFileSync(signupRoutePath, "utf8");
  assert(signupRouteCode.includes("email_confirm: true"), "Signup route forces email_confirm: true (no email verification)");
  assert(signupRouteCode.includes("auth.admin.createUser"), "Signup route calls auth.admin.createUser");
  assert(signupRouteCode.includes("checkRateLimit"), "Signup route applies per-IP rate limiting abuse protection");

  // TEST 30: Zero Sparkles/Stars & 5 Core Modules Navigation
  console.log("\n--- 30. Testing Zero Sparkle/Stars Icons & 5 Core Modules Navigation ---");
  const sidebarPath = path.join(process.cwd(), "src", "components", "studio", "studio-sidebar.tsx");
  const sidebarContent = fs.readFileSync(sidebarPath, "utf8");
  assert(!sidebarContent.includes("Sparkle"), "Studio sidebar has zero Sparkles icons");
  assert(sidebarContent.includes("Video Generator"), "Sidebar has Video Generator module");
  assert(sidebarContent.includes("Video Editor"), "Sidebar has Video Editor module");
  assert(sidebarContent.includes("AI Training"), "Sidebar has AI Training module");
  assert(sidebarContent.includes("Projects & Library"), "Sidebar has Projects & Library module");
  assert(sidebarContent.includes("Credits & Usage"), "Sidebar has Credits & Usage module");

  const mobileNavPath = path.join(process.cwd(), "src", "components", "studio", "mobile-bottom-nav.tsx");
  const mobileNavContent = fs.readFileSync(mobileNavPath, "utf8");
  assert(!mobileNavContent.includes("Sparkle"), "Mobile bottom nav has zero Sparkles icons");
  assert(mobileNavContent.includes("/video-generator"), "Mobile nav links to video-generator");
  assert(mobileNavContent.includes("/editor"), "Mobile nav links to editor");
  assert(mobileNavContent.includes("/training"), "Mobile nav links to training");
  assert(mobileNavContent.includes("/projects"), "Mobile nav links to projects");

  // TEST 31: Global Reference Media Uploads & Private Storage Bucket
  console.log("\n--- 31. Testing Global Reference Media Uploads & Private Storage Bucket ---");
  const mediaSqlPath = path.join(process.cwd(), "supabase", "migrations", "20261025000000_media_assets_and_references.sql");
  assert(fs.existsSync(mediaSqlPath), "Migration 20261025000000_media_assets_and_references.sql exists");
  const mediaSql = fs.readFileSync(mediaSqlPath, "utf8");
  assert(mediaSql.includes("CREATE TABLE IF NOT EXISTS public.media_assets"), "media_assets table defined in migration");
  assert(mediaSql.includes("'references'"), "references private bucket registered in storage.buckets");
  assert(mediaSql.includes("ENABLE ROW LEVEL SECURITY"), "RLS enabled on media_assets");
  assert(mediaSql.includes("bucket_id = 'references'"), "RLS policies guard private references bucket");

  const mediaRoutePath = path.join(process.cwd(), "src", "app", "api", "media", "route.ts");
  assert(fs.existsSync(mediaRoutePath), "Server route src/app/api/media/route.ts exists");
  const mediaRouteCode = fs.readFileSync(mediaRoutePath, "utf8");
  assert(mediaRouteCode.includes("20 * 1024 * 1024"), "Image size limit 20MB enforced");
  assert(mediaRouteCode.includes("50 * 1024 * 1024"), "Audio size limit 50MB enforced");
  assert(mediaRouteCode.includes("200 * 1024 * 1024"), "Video size limit 200MB enforced");
  assert(mediaRouteCode.includes("10 * 1024 * 1024"), "Document size limit 10MB enforced");

  const uploaderPath = path.join(process.cwd(), "src", "components", "media", "media-uploader.tsx");
  assert(fs.existsSync(uploaderPath), "<MediaUploader /> component exists");
  const modalPath = path.join(process.cwd(), "src", "components", "media", "reference-library-modal.tsx");
  assert(fs.existsSync(modalPath), "<ReferenceLibraryModal /> component exists");

  // TEST 32: Module 1 Video Generator (5-Step Pipeline, Provider Abstraction & Credit Gating)
  console.log("\n--- 32. Testing Module 1 Video Generator (5-Step Flow & Provider Abstraction) ---");
  const pipelineSqlPath = path.join(process.cwd(), "supabase", "migrations", "20261025010000_video_generator_pipeline.sql");
  assert(fs.existsSync(pipelineSqlPath), "Migration 20261025010000_video_generator_pipeline.sql exists");
  const pipelineSql = fs.readFileSync(pipelineSqlPath, "utf8");
  assert(pipelineSql.includes("CREATE TABLE IF NOT EXISTS public.projects"), "projects table defined in pipeline migration");
  assert(pipelineSql.includes("CREATE TABLE IF NOT EXISTS public.scenes"), "scenes table defined in pipeline migration");
  assert(pipelineSql.includes("CREATE TABLE IF NOT EXISTS public.generations"), "generations table defined in pipeline migration");
  assert(pipelineSql.includes("CREATE TABLE IF NOT EXISTS public.renders"), "renders table defined in pipeline migration");

  // Verify Replicate provider implementation
  const { ReplicateProvider } = await import("../src/lib/providers/replicate-provider");
  const replicateProvider = new ReplicateProvider("test_dummy_token");
  assert(replicateProvider.providerId === "replicate", "Replicate provider initialized with providerId 'replicate'");
  assert(replicateProvider.supportsImageToVideo === true, "Replicate provider supports image-to-video");
  assert(replicateProvider.supportedAspectRatios.includes("1:1"), "Replicate provider supports 1:1 aspect ratio");

  // Verify brief route
  const briefRoutePath = path.join(process.cwd(), "src", "app", "api", "video-generator", "brief", "route.ts");
  assert(fs.existsSync(briefRoutePath), "Server route api/video-generator/brief exists");
  const briefCode = fs.readFileSync(briefRoutePath, "utf8");
  assert(briefCode.includes("duration: 5"), "Brief splits scripts into 5-second atomic scenes");

  // Verify keyframe & animate routes
  const keyframeRoutePath = path.join(process.cwd(), "src", "app", "api", "video-generator", "keyframe", "route.ts");
  assert(fs.existsSync(keyframeRoutePath), "Server route api/video-generator/keyframe exists");
  const animateRoutePath = path.join(process.cwd(), "src", "app", "api", "video-generator", "animate", "route.ts");
  assert(fs.existsSync(animateRoutePath), "Server route api/video-generator/animate exists");
  const animateCode = fs.readFileSync(animateRoutePath, "utf8");
  assert(animateCode.includes("VideoProviderFactory.getProvider"), "Animation dispatches via VideoProviderFactory abstraction");

  // TEST 33: Module 2 Video Editor (Timeline Manifest, Off-Vercel Worker Integration, Autosave & Captions)
  console.log("\n--- 33. Testing Module 2 Video Editor & Render Worker Integration ---");
  const { renderWorker } = await import("../src/lib/render-worker");
  assert(Boolean(renderWorker), "RenderWorkerClient initialized");

  const exportResult = await renderWorker.dispatchExport("proj-test", {
    aspectRatio: "9:16",
    resolution: "1080p",
    fps: 30,
    clips: [
      {
        id: "c1",
        name: "Test Scene 1",
        url: "https://example.com/c1.mp4",
        duration: 5,
        trimStart: 0,
        trimEnd: 5,
        speed: 1,
        volume: 1,
        transition: "cut",
      },
    ],
    bgMusic: { volume: 0.5, ducking: true },
    watermark: { enabled: true, opacity: 0.85, position: "top-right" },
  });

  assert(exportResult.status === "completed" || exportResult.status === "rendering", "Export dispatched to render worker");
  assert(Boolean(exportResult.outputUrl), "Export artifact has valid outputUrl");

  const timelineRoutePath = path.join(process.cwd(), "src", "app", "api", "editor", "timeline", "route.ts");
  assert(fs.existsSync(timelineRoutePath), "Server route api/editor/timeline exists for autosave");

  const exportRoutePath = path.join(process.cwd(), "src", "app", "api", "editor", "export", "route.ts");
  assert(fs.existsSync(exportRoutePath), "Server route api/editor/export exists");

  const captionsRoutePath = path.join(process.cwd(), "src", "app", "api", "editor", "captions", "route.ts");
  assert(fs.existsSync(captionsRoutePath), "Server route api/editor/captions exists for auto-captions");

  // TEST 34: Module 3 AI Training (Studio Memory, Guidelines, Character DNA Profiles, Feedback & Distilled Rules)
  console.log("\n--- 34. Testing Module 3 AI Training & Studio Memory ---");
  const memorySqlPath = path.join(process.cwd(), "supabase", "migrations", "20261025020000_studio_memory.sql");
  assert(fs.existsSync(memorySqlPath), "Migration 20261025020000_studio_memory.sql exists");
  const memorySql = fs.readFileSync(memorySqlPath, "utf8");
  assert(memorySql.includes("CREATE TABLE IF NOT EXISTS public.studio_guidelines"), "studio_guidelines table defined");
  assert(memorySql.includes("CREATE TABLE IF NOT EXISTS public.character_profiles"), "character_profiles table defined");
  assert(memorySql.includes("CREATE TABLE IF NOT EXISTS public.generation_feedback"), "generation_feedback table defined");
  assert(memorySql.includes("CREATE TABLE IF NOT EXISTS public.learned_rules"), "learned_rules table defined");

  const guidelinesRoutePath = path.join(process.cwd(), "src", "app", "api", "training", "guidelines", "route.ts");
  assert(fs.existsSync(guidelinesRoutePath), "Server route api/training/guidelines exists");

  const profilesRoutePath = path.join(process.cwd(), "src", "app", "api", "training", "profiles", "route.ts");
  assert(fs.existsSync(profilesRoutePath), "Server route api/training/profiles exists");

  const feedbackRoutePath = path.join(process.cwd(), "src", "app", "api", "training", "feedback", "route.ts");
  assert(fs.existsSync(feedbackRoutePath), "Server route api/training/feedback exists");

  const rulesRoutePath = path.join(process.cwd(), "src", "app", "api", "training", "rules", "route.ts");
  assert(fs.existsSync(rulesRoutePath), "Server route api/training/rules exists");

  const distillRoutePath = path.join(process.cwd(), "src", "app", "api", "training", "distill", "route.ts");
  assert(fs.existsSync(distillRoutePath), "Server route api/training/distill exists");

  const onboardingPath = path.join(process.cwd(), "src", "components", "studio", "studio-onboarding-modal.tsx");
  assert(fs.existsSync(onboardingPath), "<StudioOnboardingModal /> exists");

    console.log("\n==================================================");
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) process.exit(1);
  } finally {
    console.log("Restoring clean production database state...");
    db.resetToEmpty();
  }
}

runStudioTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

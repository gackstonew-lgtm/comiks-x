import React from "react";
import { EpisodeRenderSpec, SceneSpec } from "@/lib/render-engine/schema";
import { limitedAnimationDriver } from "@/lib/render-engine/modes/limited-animation";
import { VirtualCamera } from "./camera/VirtualCamera";
import { SpeedLines } from "./vfx/SpeedLines";
import { ImpactFrame } from "./vfx/ImpactFrame";
import { HalftoneOverlay } from "./vfx/HalftoneOverlay";
import { SoundBurst } from "./vfx/SoundBurst";
import { TopCaptionBar } from "./captions/TopCaptionBar";

export interface ComiksPlayerProps {
  spec: EpisodeRenderSpec;
  currentFrame: number;
  showSafeZones?: boolean;
}

export const ComiksPlayer: React.FC<ComiksPlayerProps> = ({
  spec,
  currentFrame,
  showSafeZones = false,
}) => {
  // Find which scene is currently active based on frame offsets
  let sceneStartFrame = 0;
  let activeScene: SceneSpec = spec.scenes[0];

  for (const scene of spec.scenes) {
    if (currentFrame >= sceneStartFrame && currentFrame < sceneStartFrame + scene.durationFrames) {
      activeScene = scene;
      break;
    }
    sceneStartFrame += scene.durationFrames;
  }

  if (!activeScene) {
    activeScene = spec.scenes[0] || {
      sceneId: "empty",
      sceneIndex: 0,
      durationFrames: 90,
      productionMode: "limited_animation",
      fpsRetiming: 12,
      background: { plateUrl: "" },
      characters: [],
      dialogues: [],
      vfx: [],
      camera: [],
    };
  }

  const relativeFrame = currentFrame - sceneStartFrame;
  const currentMs = Math.round((relativeFrame / spec.fps) * 1000);

  // Stepped frame calculation for character layer (e.g. 12 fps on-twos)
  const steppedFrame = limitedAnimationDriver.getSteppedFrame(
    relativeFrame, 
    activeScene.fpsRetiming || 12, 
    spec.fps
  );

  const activeDialogue = activeScene.dialogues[0];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#0A0A0A",
        overflow: "hidden",
        aspectRatio: spec.aspectRatio === "9:16" ? "9 / 16" : "16 / 9",
        userSelect: "none",
      }}
    >
      {/* Virtual Camera Container */}
      <VirtualCamera currentFrame={relativeFrame} keyframes={activeScene.camera || []}>
        {/* Layer 1: Painted Background Plate */}
        <div
          style={{
            position: "absolute",
            inset: "-5%", // 5% bleed for camera pans/shakes
            backgroundImage: activeScene.background.plateUrl ? `url(${activeScene.background.plateUrl})` : "none",
            backgroundColor: "#1E293B",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "contrast(1.05) saturate(1.1)",
          }}
        />

        {/* Halftone Comic Texture */}
        <HalftoneOverlay opacity={0.08} />

        {/* Layer 2: Characters (Quantized Stepped Timing 8–12 fps) */}
        {activeScene.characters.map((char) => {
          const pose = limitedAnimationDriver.evaluatePose(char, steppedFrame);
          const eyeState = limitedAnimationDriver.evaluateEyeState(steppedFrame, spec.seed);
          const viseme = limitedAnimationDriver.evaluateMouthViseme(activeDialogue, currentMs);

          return (
            <div
              key={char.characterId}
              style={{
                position: "absolute",
                left: `${char.xPercent}%`,
                top: `${char.yPercent}%`,
                transform: `translate(-50%, -50%) scale(${char.scale}) ${char.flipHorizontal ? "scaleX(-1)" : ""}`,
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Character Silhouette / Sprite with Stepped Mouth & Eyes */}
              <div
                style={{
                  position: "relative",
                  width: "280px",
                  height: "440px",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
                }}
              >
                {/* Stylized 2D Body Plate */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "24px",
                    backgroundColor: "#15803D", // Signature safari jacket green
                    border: "5px solid #111827",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                  }}
                >
                  {/* Head & Face Box */}
                  <div
                    style={{
                      width: "120px",
                      height: "140px",
                      backgroundColor: "#3D2314", // Canonical skin tone
                      borderRadius: "60px",
                      border: "4px solid #111827",
                      position: "relative",
                      marginTop: "10px",
                    }}
                  >
                    {/* Eyes with stepped blinking */}
                    <div
                      style={{
                        position: "absolute",
                        top: "40px",
                        left: "20px",
                        right: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: eyeState === "closed" ? "3px" : "16px",
                          backgroundColor: "#111827",
                          borderRadius: eyeState === "closed" ? "2px" : "8px",
                          border: "2px solid #FFFFFF",
                        }}
                      />
                      <div
                        style={{
                          width: "20px",
                          height: eyeState === "closed" ? "3px" : "16px",
                          backgroundColor: "#111827",
                          borderRadius: eyeState === "closed" ? "2px" : "8px",
                          border: "2px solid #FFFFFF",
                        }}
                      />
                    </div>

                    {/* Mouth Viseme Indicator (A-X) */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "24px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: viseme === "A" || viseme === "X" ? "22px" : "36px",
                        height: viseme === "D" ? "28px" : (viseme === "C" ? "18px" : "6px"),
                        backgroundColor: "#E11D48",
                        border: "3px solid #111827",
                        borderRadius: "12px",
                      }}
                    />
                  </div>

                  {/* Character Name Badge */}
                  <div
                    style={{
                      marginTop: "auto",
                      backgroundColor: "#111827",
                      color: "#FFFFFF",
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "800",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {char.name} ({pose})
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Layer 3: Comic VFX Overlays */}
        {activeScene.vfx.map((vfx) => {
          if (vfx.type === "speed_lines") {
            return (
              <SpeedLines
                key={vfx.id}
                frame={relativeFrame}
                intensity={vfx.intensity || 0.8}
              />
            );
          }
          if (vfx.type === "impact_frame") {
            return (
              <ImpactFrame
                key={vfx.id}
                currentFrame={relativeFrame}
                triggerFrame={vfx.startFrame}
                durationFrames={vfx.durationFrames}
              />
            );
          }
          if (vfx.type === "sound_burst") {
            return (
              <SoundBurst
                key={vfx.id}
                text={vfx.text || "BAM!"}
                startFrame={vfx.startFrame}
                currentFrame={relativeFrame}
                durationFrames={vfx.durationFrames}
                xPercent={vfx.xPercent || 50}
                yPercent={vfx.yPercent || 40}
              />
            );
          }
          return null;
        })}
      </VirtualCamera>

      {/* Layer 4: Platform-Safe Top Caption Bar */}
      <TopCaptionBar
        spec={spec.captionBar}
        currentMs={currentMs}
        activeDialogue={activeDialogue}
      />

      {/* Optional TikTok/Reels Safe-Zone Overlay */}
      {showSafeZones && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            border: "2px dashed #EF4444",
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: "16%",
              left: "4%",
              right: "4%",
              height: "12%",
              border: "1px dashed rgba(239, 68, 68, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#EF4444",
              fontSize: "12px",
              fontWeight: "700",
            }}
          >
            [TikTok / Shorts UI Danger Zone]
          </div>
        </div>
      )}
    </div>
  );
};

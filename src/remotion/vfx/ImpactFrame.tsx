import React from "react";

export interface ImpactFrameProps {
  currentFrame: number;
  triggerFrame: number;
  durationFrames?: number; // Usually 1 to 3 frames
  mode?: "inverted" | "pure_monochrome" | "neon_shock";
}

export const ImpactFrame: React.FC<ImpactFrameProps> = ({
  currentFrame,
  triggerFrame,
  durationFrames = 2,
  mode = "pure_monochrome",
}) => {
  const relativeFrame = currentFrame - triggerFrame;

  if (relativeFrame < 0 || relativeFrame >= durationFrames) {
    return null;
  }

  const isOdd = relativeFrame % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
        backgroundColor: isOdd ? "#FFFFFF" : "#000000",
        mixBlendMode: mode === "inverted" ? "difference" : "exclusion",
        opacity: 0.95,
      }}
    />
  );
};

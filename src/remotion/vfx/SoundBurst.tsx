import React from "react";

export interface SoundBurstProps {
  text: string;
  startFrame: number;
  currentFrame: number;
  durationFrames?: number;
  xPercent?: number;
  yPercent?: number;
  backgroundColor?: string;
  textColor?: string;
}

export const SoundBurst: React.FC<SoundBurstProps> = ({
  text,
  startFrame,
  currentFrame,
  durationFrames = 25,
  xPercent = 50,
  yPercent = 40,
  backgroundColor = "#FDE047", // Vibrant comic yellow
  textColor = "#111827",
}) => {
  const relativeFrame = currentFrame - startFrame;

  if (relativeFrame < 0 || relativeFrame >= durationFrames) {
    return null;
  }

  // Comedic pop spring animation (scale up rapidly, then subtle wobble)
  let scale = 1.0;
  if (relativeFrame < 4) {
    scale = (relativeFrame / 4) * 1.35; // Overshoot
  } else if (relativeFrame < 8) {
    scale = 1.35 - ((relativeFrame - 4) / 4) * 0.25; // Settle to 1.1
  } else {
    scale = 1.1 + Math.sin(relativeFrame * 0.4) * 0.04;
  }

  // Fade out during last 5 frames
  const opacity = relativeFrame > durationFrames - 5 
    ? (durationFrames - relativeFrame) / 5 
    : 1.0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${Math.sin(relativeFrame * 0.2) * 6}deg)`,
        opacity,
        zIndex: 35,
        pointerEvents: "none",
        filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.35))",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor,
          color: textColor,
          padding: "12px 24px",
          borderRadius: "16px",
          border: "4px solid #111827",
          fontFamily: "'Bangers', 'Impact', sans-serif",
          fontSize: "36px",
          fontWeight: "900",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          boxShadow: "6px 6px 0px #111827",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
};

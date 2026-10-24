import React from "react";
import { TopCaptionBarSpec, DialogueLineSpec } from "@/lib/render-engine/schema";

export interface TopCaptionBarProps {
  spec: TopCaptionBarSpec;
  currentMs: number;
  activeDialogue?: DialogueLineSpec;
}

export const TopCaptionBar: React.FC<TopCaptionBarProps> = ({
  spec,
  currentMs,
  activeDialogue,
}) => {
  if (!spec.enabled) return null;

  // If activeDialogue has word timestamps, highlight the currently spoken word
  const words = activeDialogue?.wordTimestamps || [];
  const hasKaraoke = spec.karaokeMode && words.length > 0;

  return (
    <div
      style={{
        position: "absolute",
        top: `${spec.positionYPercent}%`,
        left: "5%",
        right: "5%",
        zIndex: 40,
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: spec.backgroundColor,
          color: spec.textColor,
          padding: "14px 28px",
          borderRadius: "20px",
          border: "3px solid #111827",
          boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.3)",
          fontFamily: spec.fontFamily,
          fontWeight: spec.fontWeight,
          fontSize: "28px",
          lineHeight: "1.25",
          textAlign: "center",
          maxWidth: "92%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {!hasKaraoke ? (
          <span>{spec.headlineText}</span>
        ) : (
          words.map((w, idx) => {
            const isActive = currentMs >= w.startMs && currentMs <= w.endMs;
            const isSpoken = currentMs > w.endMs;

            return (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  color: isActive ? spec.highlightColor : (isSpoken ? spec.textColor : "#6B7280"),
                  transform: isActive ? "scale(1.15)" : "scale(1.0)",
                  transition: "transform 0.08s ease-out, color 0.08s ease-out",
                  textShadow: isActive ? `0 0 12px ${spec.highlightColor}44` : "none",
                }}
              >
                {w.word}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};

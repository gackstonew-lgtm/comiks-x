import React from "react";

export interface SpeechBubbleProps {
  text: string;
  xPercent: number;
  yPercent: number;
  tailDirection?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  backgroundColor?: string;
  textColor?: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  xPercent,
  yPercent,
  backgroundColor = "#FFFFFF",
  textColor = "#111827",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        left: `${xPercent}%`,
        top: `${yPercent}%`,
        transform: "translate(-50%, -100%)",
        zIndex: 32,
        pointerEvents: "none",
        filter: "drop-shadow(0px 6px 12px rgba(0,0,0,0.25))",
      }}
    >
      <div
        style={{
          position: "relative",
          backgroundColor,
          color: textColor,
          padding: "10px 18px",
          borderRadius: "16px",
          border: "3px solid #111827",
          fontFamily: "'Inter', sans-serif",
          fontWeight: "700",
          fontSize: "20px",
          lineHeight: "1.2",
          whiteSpace: "nowrap",
        }}
      >
        {text}
        {/* Comic Bubble Tail */}
        <div
          style={{
            position: "absolute",
            bottom: "-12px",
            left: "24px",
            width: "0",
            height: "0",
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "12px solid #111827",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-9px",
            left: "26px",
            width: "0",
            height: "0",
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "10px solid #FFFFFF",
          }}
        />
      </div>
    </div>
  );
};

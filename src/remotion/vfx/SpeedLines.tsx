import React from "react";

export interface SpeedLinesProps {
  frame: number;
  intensity?: number; // 0 to 1
  color?: string;
  cxPercent?: number; // Center of burst
  cyPercent?: number;
}

export const SpeedLines: React.FC<SpeedLinesProps> = ({
  frame,
  intensity = 0.8,
  color = "#111827",
  cxPercent = 50,
  cyPercent = 50,
}) => {
  // Generate 24 radial action lines with pseudo-jitter per frame
  const linesCount = 28;
  const lines = Array.from({ length: linesCount }, (_, i) => {
    const angle = (i * (360 / linesCount)) + ((frame * 13 + i * 7) % 8);
    const rad = (angle * Math.PI) / 180;
    const innerRadius = 180 + ((frame * 19 + i * 11) % 60);
    const outerRadius = 1200;

    const x1 = Math.cos(rad) * innerRadius;
    const y1 = Math.sin(rad) * innerRadius;
    const x2 = Math.cos(rad) * outerRadius;
    const y2 = Math.sin(rad) * outerRadius;

    const strokeWidth = 3 + ((i * 3 + frame) % 6);

    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={intensity}
      />
    );
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="-600 -600 1200 1200"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate(${cxPercent - 50}%, ${cyPercent - 50}%)`,
        }}
      >
        {lines}
      </svg>
    </div>
  );
};

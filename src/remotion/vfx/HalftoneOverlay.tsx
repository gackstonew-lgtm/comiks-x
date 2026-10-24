import React from "react";

export interface HalftoneOverlayProps {
  opacity?: number;
  dotSizePx?: number;
  dotColor?: string;
}

export const HalftoneOverlay: React.FC<HalftoneOverlayProps> = ({
  opacity = 0.12,
  dotSizePx = 4,
  dotColor = "#000000",
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 15,
        opacity,
        backgroundImage: `radial-gradient(${dotColor} 20%, transparent 20%)`,
        backgroundSize: `${dotSizePx * 2}px ${dotSizePx * 2}px`,
      }}
    />
  );
};

import React, { ReactNode } from "react";
import { CameraKeyframe } from "@/lib/render-engine/schema";

export interface VirtualCameraProps {
  currentFrame: number;
  keyframes: CameraKeyframe[];
  children: ReactNode;
}

export const VirtualCamera: React.FC<VirtualCameraProps> = ({
  currentFrame,
  keyframes,
  children,
}) => {
  // Interpolate camera parameters from keyframes
  let x = 0;
  let y = 0;
  let zoom = 1.0;
  let rotationDeg = 0;
  let shakeIntensity = 0;

  if (keyframes.length > 0) {
    const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);
    let activeKf = sorted[0];

    for (let i = 0; i < sorted.length; i++) {
      if (currentFrame >= sorted[i].frame) {
        activeKf = sorted[i];
      } else {
        break;
      }
    }

    x = activeKf.x;
    y = activeKf.y;
    zoom = activeKf.zoom;
    rotationDeg = activeKf.rotationDeg;
    shakeIntensity = activeKf.shakeIntensity;
  }

  // Calculate high-frequency damped screen shake if intensity > 0
  let shakeOffsetX = 0;
  let shakeOffsetY = 0;
  if (shakeIntensity > 0) {
    const freq = currentFrame * 29;
    shakeOffsetX = Math.sin(freq) * (shakeIntensity * 3.5);
    shakeOffsetY = Math.cos(freq * 1.3) * (shakeIntensity * 3.5);
  }

  const totalTranslateX = x + shakeOffsetX;
  const totalTranslateY = y + shakeOffsetY;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        transform: `translate3d(${totalTranslateX}px, ${totalTranslateY}px, 0px) scale(${zoom}) rotate(${rotationDeg}deg)`,
        transformOrigin: "center center",
        transition: "transform 0.05s ease-out",
      }}
    >
      {children}
    </div>
  );
};

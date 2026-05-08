import { evolvePath } from "@remotion/paths";
import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { EASE } from "@/lib/motion";

const SHIELD_PATH = "M50 5 L90 25 L90 55 C90 80 70 95 50 100 C30 95 10 80 10 55 L10 25 Z";

export const ShieldIcon: React.FC<{
  size: number;
  startFrame: number;
  duration?: number;
  fillOpacity?: number;
  style?: React.CSSProperties;
}> = ({ size, startFrame, duration = 35, fillOpacity = 0, style }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.enter,
  });

  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, SHIELD_PATH);

  return (
    <svg
      viewBox="0 0 100 105"
      width={size}
      height={size * 1.05}
      style={style}
      role="img"
      aria-label="Shield"
    >
      <path
        d={SHIELD_PATH}
        stroke="white"
        strokeWidth={4}
        fill="none"
        opacity={0.3}
        filter="blur(4px)"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />
      <path
        d={SHIELD_PATH}
        stroke="white"
        strokeWidth={2.5}
        fill={`rgba(255,255,255,${fillOpacity})`}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

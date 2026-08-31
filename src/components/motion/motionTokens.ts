/**
 * HomeHunt Motion Tokens
 * Centralized durations and easings for natural, responsive, and consistent UI animations.
 */

export const MOTION_DURATIONS = {
  instant: 0.1, // 100ms
  fast: 0.15, // 150ms
  normal: 0.25, // 250ms
  medium: 0.35, // 350ms
  slow: 0.5, // 500ms
  dramatic: 0.7, // 700ms
  story: 0.8, // 800ms
  celebration: 1.0, // 1000ms
} as const;

export const MOTION_EASINGS = {
  // Standard CSS transitions
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Acceleration curve (incoming elements)
  enter: "cubic-bezier(0, 0, 0.2, 1)",
  // Deceleration curve (outgoing elements)
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  // Emphasized (attention grabs / details layouts)
  emphasized: "cubic-bezier(0.83, 0, 0.17, 1)",

  // Spring transition presets for JS-based animation engines
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 25,
  },
  springSnappy: {
    type: "spring",
    stiffness: 400,
    damping: 30,
  },
  springBouncy: {
    type: "spring",
    stiffness: 350,
    damping: 18,
  },
} as const;

export type MotionDuration = keyof typeof MOTION_DURATIONS;
export type MotionEasing = keyof typeof MOTION_EASINGS;

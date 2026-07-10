/**
 * Typed token mirror for JS/Motion/canvas — SPEC §5–§8
 * CSS custom properties live in src/styles/tokens.css
 */

export const DURATIONS = {
  flip: 180,
  snap: 220,
  dealCard: 300,
  dealStagger: 45,
  hoverLift: 120,
  press: 90,
  invalidShake: 320,
  autocompleteCard: 160,
  autocompleteStagger: 60,
  cascadeLaunchStagger: 45,
  reducedFlip: 80,
  reducedSnap: 120,
  cascadeTimeout: 12_000,
} as const;

export const EASINGS = {
  standard: [0.2, 0.8, 0.2, 1] as const,
  decel: [0.16, 1, 0.3, 1] as const,
  accel: [0.4, 0, 1, 1] as const,
} as const;

export const SPRINGS = {
  snap: { stiffness: 520, damping: 30, mass: 0.9 },
  soft: { stiffness: 300, damping: 26, mass: 1 },
} as const;

export const GEOMETRY = {
  aspect: 5 / 7,
  heightMultiplier: 1.4,
  cardWidthMax: 104,
  cardWidthMin: 40,
  cardWidthDivisor: 8.52,
  gapRatio: 0.18,
  overlapFaceupRatio: 0.24,
  overlapFacedownRatio: 0.11,
  wasteFanRatio: 0.26,
  boardPadRatio: 0.22,
  rowGapRatio: 0.3,
  cardRadiusRatio: 0.06,
  cardRadiusRatioStudio: 0.08,
  uiRadius: 12,
  uiRadiusStudio: 16,
  svgViewBox: { width: 250, height: 350 },
} as const;

export const CASCADE = {
  gravity: 2400,
  vxMin: -480,
  vxMax: 480,
  vyMin: -440,
  vyMax: -160,
  floorRestitution: 0.86,
  wallRestitution: 0.72,
  invalidShakePx: 6,
  invalidShakeOscillations: 3,
  dragScale: 1.04,
  validTargetScale: 1.03,
  hoverLiftPx: -2,
  pressScale: 0.97,
} as const;

export const Z = {
  baize: 0,
  pilePlaceholder: 1,
  cardBase: 10,
  cardLifted: 500,
  cardDragging: 1000,
  cascade: 2000,
  hud: 2500,
  modal: 3000,
  toast: 3500,
} as const;

export type ThemeId = "heritage" | "midnight" | "studio";

export const THEMES: ThemeId[] = ["heritage", "midnight", "studio"];

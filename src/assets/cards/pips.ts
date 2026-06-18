/** Pip positions in normalized center field [0,1]×[0,1] — SPEC §11.1 center field. */
export type PipPoint = { x: number; y: number; invert?: boolean };

export const PIP_LAYOUTS: Record<number, PipPoint[]> = {
  1: [{ x: 0.5, y: 0.5 }],
  2: [
    { x: 0.5, y: 0.18 },
    { x: 0.5, y: 0.82, invert: true },
  ],
  3: [
    { x: 0.5, y: 0.18 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.82, invert: true },
  ],
  4: [
    { x: 0.28, y: 0.2 },
    { x: 0.72, y: 0.2 },
    { x: 0.28, y: 0.8, invert: true },
    { x: 0.72, y: 0.8, invert: true },
  ],
  5: [
    { x: 0.28, y: 0.2 },
    { x: 0.72, y: 0.2 },
    { x: 0.5, y: 0.5 },
    { x: 0.28, y: 0.8, invert: true },
    { x: 0.72, y: 0.8, invert: true },
  ],
  6: [
    { x: 0.28, y: 0.2 },
    { x: 0.72, y: 0.2 },
    { x: 0.28, y: 0.5 },
    { x: 0.72, y: 0.5 },
    { x: 0.28, y: 0.8, invert: true },
    { x: 0.72, y: 0.8, invert: true },
  ],
  7: [
    { x: 0.28, y: 0.16 },
    { x: 0.72, y: 0.16 },
    { x: 0.5, y: 0.33 },
    { x: 0.28, y: 0.5 },
    { x: 0.72, y: 0.5 },
    { x: 0.28, y: 0.84, invert: true },
    { x: 0.72, y: 0.84, invert: true },
  ],
  8: [
    { x: 0.28, y: 0.16 },
    { x: 0.72, y: 0.16 },
    { x: 0.28, y: 0.38 },
    { x: 0.72, y: 0.38 },
    { x: 0.28, y: 0.62, invert: true },
    { x: 0.72, y: 0.62, invert: true },
    { x: 0.28, y: 0.84, invert: true },
    { x: 0.72, y: 0.84, invert: true },
  ],
  9: [
    { x: 0.28, y: 0.16 },
    { x: 0.5, y: 0.16 },
    { x: 0.72, y: 0.16 },
    { x: 0.28, y: 0.5 },
    { x: 0.5, y: 0.5 },
    { x: 0.72, y: 0.5 },
    { x: 0.28, y: 0.84, invert: true },
    { x: 0.5, y: 0.84, invert: true },
    { x: 0.72, y: 0.84, invert: true },
  ],
  10: [
    { x: 0.28, y: 0.14 },
    { x: 0.72, y: 0.14 },
    { x: 0.5, y: 0.26 },
    { x: 0.28, y: 0.42 },
    { x: 0.72, y: 0.42 },
    { x: 0.28, y: 0.58, invert: true },
    { x: 0.72, y: 0.58, invert: true },
    { x: 0.5, y: 0.74, invert: true },
    { x: 0.28, y: 0.86, invert: true },
    { x: 0.72, y: 0.86, invert: true },
  ],
};

/** Center field bounds in card viewBox units (250×350). */
export const CENTER_FIELD = { x: 44, y: 58, width: 162, height: 234 };

export function pipToViewBox(point: PipPoint): { x: number; y: number } {
  return {
    x: CENTER_FIELD.x + point.x * CENTER_FIELD.width,
    y: CENTER_FIELD.y + point.y * CENTER_FIELD.height,
  };
}

export function pipSizeForRank(rank: number): number {
  if (rank === 1) return 90;
  if (rank >= 8) return 28;
  if (rank >= 5) return 32;
  return 36;
}

/** Pip positions in card viewBox units (250×350) — design system Contract H. */
export type PipPoint = { x: number; y: number; invert?: boolean };

export const PIP_LAYOUTS: Record<number, PipPoint[]> = {
  1: [{ x: 125, y: 178 }],
  2: [
    { x: 125, y: 104 },
    { x: 125, y: 246, invert: true },
  ],
  3: [
    { x: 125, y: 104 },
    { x: 125, y: 175 },
    { x: 125, y: 246, invert: true },
  ],
  4: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
  5: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 125, y: 175 },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
  6: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 78, y: 175 },
    { x: 172, y: 175 },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
  7: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 125, y: 140 },
    { x: 78, y: 175 },
    { x: 172, y: 175 },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
  8: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 125, y: 140 },
    { x: 78, y: 175 },
    { x: 172, y: 175 },
    { x: 125, y: 210, invert: true },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
  9: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 78, y: 153 },
    { x: 172, y: 153 },
    { x: 125, y: 175 },
    { x: 78, y: 197, invert: true },
    { x: 172, y: 197, invert: true },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
  10: [
    { x: 78, y: 104 },
    { x: 172, y: 104 },
    { x: 125, y: 128 },
    { x: 78, y: 153 },
    { x: 172, y: 153 },
    { x: 78, y: 197, invert: true },
    { x: 172, y: 197, invert: true },
    { x: 125, y: 222, invert: true },
    { x: 78, y: 246, invert: true },
    { x: 172, y: 246, invert: true },
  ],
};

/** Center field bounds in card viewBox units (250×350). */
export const CENTER_FIELD = { x: 44, y: 58, width: 162, height: 234 };

export function pipToViewBox(point: PipPoint): { x: number; y: number } {
  return { x: point.x, y: point.y };
}

export function pipSizeForRank(rank: number): number {
  if (rank === 1) return 94;
  return 34;
}

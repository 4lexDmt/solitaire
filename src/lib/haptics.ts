/** Guarded navigator.vibrate — SPEC §8.5 */

export function vibrate(
  pattern: number | readonly number[],
  enabled: boolean,
): void {
  if (!enabled || typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }
  try {
    const vibe: number | number[] =
      typeof pattern === 'number' ? pattern : [...pattern];
    navigator.vibrate(vibe);
  } catch {
    // Some browsers expose vibrate but reject calls outside user gestures.
  }
}

export const HAPTIC = {
  pickup: 10,
  foundationDrop: 15,
  win: [10, 40, 10] as const,
} as const;

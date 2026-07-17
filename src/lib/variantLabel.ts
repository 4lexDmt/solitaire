import type { VariantId } from '@/engine/variants';

/** User-facing variant names — Klondike is shown as "Solitaire". */
export function variantLabel(id: string | VariantId): string {
  if (id === 'freecell') return 'FreeCell';
  if (id === 'spider') return 'Spider';
  if (id === 'pyramid') return 'Pyramid';
  if (id === 'tripeaks') return 'TriPeaks';
  if (id === 'yukon') return 'Yukon';
  if (id === 'golf') return 'Golf';
  return 'Solitaire';
}

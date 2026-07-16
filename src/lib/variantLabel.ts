import type { VariantId } from '@/engine/variants';

/** User-facing variant names — Klondike is shown as "Solitaire". */
export function variantLabel(id: string | VariantId): string {
  if (id === 'freecell') return 'FreeCell';
  if (id === 'spider') return 'Spider';
  return 'Solitaire';
}

import type { VariantId } from '@/engine/variants';

/** Canonical game list for menus, dropdowns, and stats. */
export const VARIANT_OPTIONS: readonly { id: VariantId; label: string }[] = [
  { id: 'klondike', label: 'Solitaire' },
  { id: 'freecell', label: 'FreeCell' },
  { id: 'spider', label: 'Spider' },
  { id: 'pyramid', label: 'Pyramid' },
  { id: 'tripeaks', label: 'TriPeaks' },
  { id: 'yukon', label: 'Yukon' },
  { id: 'golf', label: 'Golf' },
] as const;

/** User-facing variant names — Klondike is shown as "Solitaire". */
export function variantLabel(id: string | VariantId): string {
  return VARIANT_OPTIONS.find((v) => v.id === id)?.label ?? 'Solitaire';
}

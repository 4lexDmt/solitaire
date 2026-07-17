import type { Variant } from '../variant';
import { freecell } from './freecell';
import { klondike } from './klondike';
import { pyramid } from './pyramid';
import { spider } from './spider';
import { tripeaks } from './tripeaks';

export type VariantId = 'klondike' | 'freecell' | 'spider' | 'pyramid' | 'tripeaks';

export const VARIANTS: Record<VariantId, Variant> = {
  klondike,
  freecell,
  spider,
  pyramid,
  tripeaks,
};

export const VARIANT_IDS = Object.keys(VARIANTS) as VariantId[];

export function getVariant(id: string): Variant {
  return VARIANTS[id as VariantId] ?? klondike;
}

export { freecell, klondike, pyramid, spider, tripeaks };

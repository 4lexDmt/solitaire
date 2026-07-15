import type { Variant } from '../variant';
import { freecell } from './freecell';
import { klondike } from './klondike';
import { spider } from './spider';

export type VariantId = 'klondike' | 'freecell' | 'spider';

export const VARIANTS: Record<VariantId, Variant> = {
  klondike,
  freecell,
  spider,
};

export const VARIANT_IDS = Object.keys(VARIANTS) as VariantId[];

export function getVariant(id: string): Variant {
  return VARIANTS[id as VariantId] ?? klondike;
}

export { freecell, klondike, spider };

import type { Variant } from '../variant';
import { freecell } from './freecell';
import { golf } from './golf';
import { klondike } from './klondike';
import { pyramid } from './pyramid';
import { spider } from './spider';
import { tripeaks } from './tripeaks';
import { yukon } from './yukon';

export type VariantId =
  | 'klondike'
  | 'freecell'
  | 'spider'
  | 'pyramid'
  | 'tripeaks'
  | 'yukon'
  | 'golf';

export const VARIANTS: Record<VariantId, Variant> = {
  klondike,
  freecell,
  spider,
  pyramid,
  tripeaks,
  yukon,
  golf,
};

export const VARIANT_IDS = Object.keys(VARIANTS) as VariantId[];

export function getVariant(id: string): Variant {
  return VARIANTS[id as VariantId] ?? klondike;
}

export { freecell, golf, klondike, pyramid, spider, tripeaks, yukon };

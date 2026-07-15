import type { GameState } from '@/engine/types';
import type { Variant } from '@/engine/variant';
import { getVariant } from '@/engine/variants';
import { topCard } from '@/engine/variants/klondike';

export interface PointerTarget {
  pileId: string;
  cardId: string | null;
}

const PILE_ATTR = 'data-pile-id';
const CARD_ATTR = 'data-card-id';

/** Walk DOM ancestors to find the nearest pile id. */
export function findPileId(element: Element | null): string | null {
  let node: Element | null = element;
  while (node) {
    const pileId = node.getAttribute(PILE_ATTR);
    if (pileId) return pileId;
    node = node.parentElement;
  }
  return null;
}

/** Walk DOM ancestors to find the nearest card id. */
export function findCardId(element: Element | null): string | null {
  let node: Element | null = element;
  while (node) {
    const cardId = node.getAttribute(CARD_ATTR);
    if (cardId) return cardId;
    node = node.parentElement;
  }
  return null;
}

/** Resolve pointer coordinates to a pile and optional card under the cursor. */
export function resolvePointerTarget(
  boardRoot: HTMLElement,
  clientX: number,
  clientY: number,
): PointerTarget | null {
  const hit = document.elementFromPoint(clientX, clientY);
  if (!hit || !boardRoot.contains(hit)) return null;

  const pileId = findPileId(hit);
  if (!pileId) return null;

  return {
    pileId,
    cardId: findCardId(hit),
  };
}

/** Resolve click/drop target including empty tableau/foundation pile areas. */
export function resolveTargetAtPoint(
  boardRoot: HTMLElement,
  game: GameState,
  clientX: number,
  clientY: number,
): PointerTarget | null {
  const direct = resolvePointerTarget(boardRoot, clientX, clientY);
  if (!direct) return null;

  if (direct.cardId) return direct;

  const pile = game.piles[direct.pileId];
  if (!pile) return direct;

  if (pile.type === 'tableau' && pile.cards.length > 0) {
    const pileEl = boardRoot.querySelector(`[data-pile-id="${direct.pileId}"]`);
    if (pileEl) {
      const cards = pileEl.querySelectorAll('[data-card-id]');
      for (const cardEl of cards) {
        const rect = cardEl.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) {
          return {
            pileId: direct.pileId,
            cardId: cardEl.getAttribute(CARD_ATTR),
          };
        }
      }
    }
  }

  return direct;
}

/** Card ids that may be picked up from a pile/card (tableau run or single top card). */
export function getMovableCardIds(
  state: GameState,
  pileId: string,
  cardId: string | null,
  variant: Variant = getVariant(state.variantId),
): string[] | null {
  const pile = state.piles[pileId];
  if (!pile) return null;

  if (pile.type === 'stock') return null;

  if (pile.type === 'waste' || pile.type === 'cell' || pile.type === 'foundation') {
    if (pile.type === 'foundation' && variant.foundationsLocked) return null;
    const top = topCard(pile);
    if (!top || !top.faceUp) return null;
    if (cardId && cardId !== top.id) return null;
    return [top.id];
  }

  if (pile.type === 'tableau') {
    if (!cardId) return null;
    const run = variant.getMovableRun(state, pile, cardId);
    if (run.length === 0) return null;
    return run.map((c) => c.id);
  }

  return null;
}

/** Pile ids that would accept a move from the given source. */
export function getValidDropTargets(
  state: GameState,
  from: string,
  cardIds: string[],
  variant: Variant = getVariant(state.variantId),
): string[] {
  if (cardIds.length === 0) return [];

  const targets: string[] = [];
  for (const pileId of Object.keys(state.piles)) {
    if (pileId === from) continue;
    if (variant.canDrop(state, cardIds, from, pileId)) {
      targets.push(pileId);
    }
  }
  return targets;
}

/** Whether a face-up card in a pile can initiate a drag or selection. */
export function isCardInteractive(
  state: GameState,
  pileId: string,
  cardId: string,
): boolean {
  return getMovableCardIds(state, pileId, cardId) !== null;
}

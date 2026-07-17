import { buildDeck } from '../deck';
import { createRng, shuffle } from '../rng';
import type { Card, GameState, Move, Pile } from '../types';
import type { Variant } from '../variant';
import {
  SLOT_COUNT_PYRAMID,
  dealSlots,
  emptyPile,
  enumerateStockMoves,
  isSlotFree,
  pyramidSumsTo13,
  slotId,
  slotIndex,
  topCard,
} from './slotLayout';

const SLOT_IDS = Array.from({ length: SLOT_COUNT_PYRAMID }, (_, i) => slotId(i));

export const PYRAMID_LAYOUT = {
  piles: [
    { id: 'stock', type: 'stock' as const, gridArea: 'stock' },
    { id: 'waste', type: 'waste' as const, gridArea: 'waste' },
    { id: 'foundation-0', type: 'foundation' as const, gridArea: 'foundation-0' },
    ...SLOT_IDS.map((id) => ({ id, type: 'slot' as const, gridArea: id })),
  ],
};

function freeCard(
  state: GameState,
  pileId: string,
): Card | undefined {
  if (pileId === 'waste') {
    const top = topCard(state.piles.waste);
    return top?.faceUp ? top : undefined;
  }
  if (!pileId.startsWith('slot-')) return undefined;
  const idx = slotIndex(pileId);
  if (!isSlotFree(state, idx, 'pyramid')) return undefined;
  return topCard(state.piles[pileId]);
}

function removalScore(mode: GameState['scoreMode'], cards: number): number {
  if (mode === 'none' || mode === 'vegas') return 0;
  return cards * 10;
}

function enumerateRemovals(state: GameState, skipScoring: boolean): Move[] {
  const moves: Move[] = [];
  const discard = 'foundation-0';
  const free: { pileId: string; card: Card }[] = [];

  const wasteTop = freeCard(state, 'waste');
  if (wasteTop) free.push({ pileId: 'waste', card: wasteTop });

  for (const id of SLOT_IDS) {
    const card = freeCard(state, id);
    if (card) free.push({ pileId: id, card });
  }

  for (let i = 0; i < free.length; i++) {
    const a = free[i];
    if (a.card.rank === 13) {
      const move: Move = {
        from: a.pileId,
        to: discard,
        cardIds: [a.card.id],
        scoreDelta: 0,
        ts: 0,
      };
      if (!skipScoring) move.scoreDelta = removalScore(state.scoreMode, 1);
      moves.push(move);
      continue;
    }

    for (let j = i + 1; j < free.length; j++) {
      const b = free[j];
      if (!pyramidSumsTo13(a.card.rank, b.card.rank)) continue;
      const move: Move = {
        from: a.pileId,
        to: discard,
        cardIds: [a.card.id],
        partner: { from: b.pileId, cardIds: [b.card.id] },
        scoreDelta: 0,
        ts: 0,
      };
      if (!skipScoring) move.scoreDelta = removalScore(state.scoreMode, 2);
      moves.push(move);
    }
  }

  return moves;
}

export const pyramid: Variant = {
  id: 'pyramid',
  name: 'Pyramid',
  layout: PYRAMID_LAYOUT,
  foundationsLocked: true,

  createDeck() {
    return buildDeck();
  },

  deal(deck, seed) {
    const shuffled = shuffle(deck, createRng(seed));
    return dealSlots(shuffled, SLOT_COUNT_PYRAMID, true);
  },

  getMovableRun(state, pile, cardId) {
    if (pile.type === 'slot') {
      const idx = slotIndex(pile.id);
      if (!isSlotFree(state, idx, 'pyramid')) return [];
      const top = topCard(pile);
      return top && top.id === cardId && top.faceUp ? [top] : [];
    }
    if (pile.type === 'waste') {
      const top = topCard(pile);
      return top && top.id === cardId && top.faceUp ? [top] : [];
    }
    return [];
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length !== 1 || from === to) return false;
    const card = freeCard(state, from);
    if (!card || card.id !== cardIds[0]) return false;

    // King → discard
    if (to === 'foundation-0' && card.rank === 13) return true;

    // Pair onto another free card (normalized to discard on apply)
    if (to.startsWith('slot-') || to === 'waste') {
      const other = freeCard(state, to);
      if (!other) return false;
      return pyramidSumsTo13(card.rank, other.rank);
    }

    return false;
  },

  normalizeMove(state, from, to, cardIds) {
    if (cardIds.length !== 1) return null;
    const card = freeCard(state, from);
    if (!card || card.id !== cardIds[0]) return null;

    if (to === 'foundation-0' && card.rank === 13) {
      return { from, to, cardIds };
    }

    if (to.startsWith('slot-') || to === 'waste') {
      const other = freeCard(state, to);
      if (!other || !pyramidSumsTo13(card.rank, other.rank)) return null;
      return {
        from,
        to: 'foundation-0',
        cardIds: [card.id],
        partner: { from: to, cardIds: [other.id] },
      };
    }

    return null;
  },

  getLegalMoves(state, options) {
    const skip = options?.skipScoring ?? false;
    return [...enumerateRemovals(state, skip), ...enumerateStockMoves(state)];
  },

  isWon(state) {
    return SLOT_IDS.every((id) => (state.piles[id]?.cards.length ?? 0) === 0);
  },

  autoMoveTarget(state, cardId) {
    for (const id of [...SLOT_IDS, 'waste']) {
      const pile = state.piles[id];
      const top = topCard(pile);
      if (top?.id !== cardId) continue;
      if (!freeCard(state, id)) return null;
      if (top.rank === 13) return 'foundation-0';

      // Prefer pairing with waste, then another free slot.
      for (const otherId of ['waste', ...SLOT_IDS]) {
        if (otherId === id) continue;
        if (pyramid.canDrop(state, [cardId], id, otherId)) return otherId;
      }
      return null;
    }
    return null;
  },

  autoMoveToFoundation(state, pileId, cardId) {
    const card = freeCard(state, pileId);
    if (!card || card.id !== cardId) return null;
    if (card.rank === 13) return 'foundation-0';
    return null;
  },

  score(move, mode) {
    if (mode === 'none' || mode === 'vegas') return 0;
    if (move.drew || move.recycled) return 0;
    if (move.to === 'foundation-0') {
      return removalScore(mode, move.cardIds.length + (move.partner?.cardIds.length ?? 0));
    }
    return 0;
  },
};

export { emptyPile as pyramidEmptyPile };

import { buildDeck } from '../deck';
import { createRng, shuffle } from '../rng';
import type { Card, GameState, Move } from '../types';
import type { Variant } from '../variant';
import {
  SLOT_COUNT_TRIPEAKS,
  dealSlots,
  enumerateStockMoves,
  isSlotFree,
  slotId,
  slotIndex,
  topCard,
  tripeaksAdjacent,
} from './slotLayout';

const SLOT_IDS = Array.from({ length: SLOT_COUNT_TRIPEAKS }, (_, i) => slotId(i));

export const TRIPEAKS_LAYOUT = {
  piles: [
    { id: 'stock', type: 'stock' as const, gridArea: 'stock' },
    { id: 'waste', type: 'waste' as const, gridArea: 'waste' },
    { id: 'foundation-0', type: 'foundation' as const, gridArea: 'foundation-0' },
    ...SLOT_IDS.map((id) => ({ id, type: 'slot' as const, gridArea: id })),
  ],
};

function freePeakCard(state: GameState, pileId: string): Card | undefined {
  if (!pileId.startsWith('slot-')) return undefined;
  const idx = slotIndex(pileId);
  if (!isSlotFree(state, idx, 'tripeaks')) return undefined;
  return topCard(state.piles[pileId]);
}

function wasteTop(state: GameState): Card | undefined {
  const top = topCard(state.piles.waste);
  return top?.faceUp ? top : undefined;
}

function streakBonus(state: GameState): number {
  // Count consecutive peak→waste plays at the end of history (no draws/recycles).
  let streak = 0;
  for (let i = state.history.length - 1; i >= 0; i--) {
    const m = state.history[i];
    if (m.drew || m.recycled) break;
    if (m.from.startsWith('slot-') && m.to === 'waste') streak += 1;
    else break;
  }
  return streak;
}

function playScore(state: GameState, mode: GameState['scoreMode']): number {
  if (mode === 'none' || mode === 'vegas') return 0;
  // Base 10 + escalating streak (matches casual TriPeaks feel).
  return 10 + streakBonus(state) * 5;
}

export const tripeaks: Variant = {
  id: 'tripeaks',
  name: 'TriPeaks',
  layout: TRIPEAKS_LAYOUT,
  foundationsLocked: true,

  createDeck() {
    return buildDeck();
  },

  deal(deck, seed) {
    const shuffled = shuffle(deck, createRng(seed));
    return dealSlots(shuffled, SLOT_COUNT_TRIPEAKS, true);
  },

  getMovableRun(state, pile, cardId) {
    if (pile.type !== 'slot') return [];
    const idx = slotIndex(pile.id);
    if (!isSlotFree(state, idx, 'tripeaks')) return [];
    const top = topCard(pile);
    return top && top.id === cardId && top.faceUp ? [top] : [];
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length !== 1 || to !== 'waste') return false;
    const card = freePeakCard(state, from);
    if (!card || card.id !== cardIds[0]) return false;
    const waste = wasteTop(state);
    if (!waste) return false;
    return tripeaksAdjacent(card.rank, waste.rank);
  },

  getLegalMoves(state, options) {
    const skip = options?.skipScoring ?? false;
    const moves: Move[] = [];
    const waste = wasteTop(state);

    if (waste) {
      for (const id of SLOT_IDS) {
        const card = freePeakCard(state, id);
        if (!card) continue;
        if (!tripeaksAdjacent(card.rank, waste.rank)) continue;
        const move: Move = {
          from: id,
          to: 'waste',
          cardIds: [card.id],
          scoreDelta: 0,
          ts: 0,
        };
        if (!skip) move.scoreDelta = playScore(state, state.scoreMode);
        moves.push(move);
      }
    }

    return [...moves, ...enumerateStockMoves(state)];
  },

  isWon(state) {
    return SLOT_IDS.every((id) => (state.piles[id]?.cards.length ?? 0) === 0);
  },

  autoMoveTarget(state, cardId) {
    for (const id of SLOT_IDS) {
      const top = topCard(state.piles[id]);
      if (top?.id !== cardId) continue;
      if (tripeaks.canDrop(state, [cardId], id, 'waste')) return 'waste';
      return null;
    }
    return null;
  },

  autoMoveToFoundation() {
    // TriPeaks plays onto waste, not foundations.
    return null;
  },

  score(move, mode, state) {
    if (mode === 'none' || mode === 'vegas') return 0;
    if (move.drew || move.recycled) return 0;
    if (move.from.startsWith('slot-') && move.to === 'waste') {
      if (state) return playScore(state, mode);
      return 10;
    }
    return 0;
  },
};

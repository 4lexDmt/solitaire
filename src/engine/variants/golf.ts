import { buildDeck } from '../deck';
import { createRng, shuffle } from '../rng';
import type { Card, GameState, Move, Pile, Rank } from '../types';
import type { Variant } from '../variant';
import { topCard } from './klondike';

const TABLEAU_IDS = Array.from({ length: 7 }, (_, i) => `tableau-${i}`);

export const GOLF_LAYOUT = {
  piles: [
    { id: 'stock', type: 'stock' as const, gridArea: 'stock' },
    { id: 'waste', type: 'waste' as const, gridArea: 'waste' },
    ...TABLEAU_IDS.map((id) => ({ id, type: 'tableau' as const, gridArea: id })),
  ],
};

function emptyPile(id: string, type: Pile['type']): Pile {
  return { id, type, cards: [] };
}

/** Classic Golf: adjacent ranks only — Ace↔2, Queen↔King; no A↔K wrap. */
export function golfAdjacent(a: Rank, b: Rank): boolean {
  return Math.abs(a - b) === 1;
}

/**
 * Deal: 7×5 face-up tableau (35), 1 starter on waste, 16 face-down stock.
 */
function dealGolf(deck: Card[], seed: string): Record<string, Pile> {
  const shuffled = shuffle(deck, createRng(seed));
  const piles: Record<string, Pile> = {
    stock: emptyPile('stock', 'stock'),
    waste: emptyPile('waste', 'waste'),
  };
  for (const id of TABLEAU_IDS) piles[id] = emptyPile(id, 'tableau');

  let cursor = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row < 5; row++) {
      piles[`tableau-${col}`].cards.push({ ...shuffled[cursor++], faceUp: true });
    }
  }

  piles.waste.cards.push({ ...shuffled[cursor++], faceUp: true });

  while (cursor < shuffled.length) {
    piles.stock.cards.push({ ...shuffled[cursor++], faceUp: false });
  }

  return piles;
}

function tableauTop(state: GameState, pileId: string): Card | undefined {
  const pile = state.piles[pileId];
  if (!pile || pile.type !== 'tableau' || pile.cards.length === 0) return undefined;
  const top = topCard(pile);
  return top?.faceUp ? top : undefined;
}

function wasteTop(state: GameState): Card | undefined {
  const top = topCard(state.piles.waste);
  return top?.faceUp ? top : undefined;
}

function playScore(mode: GameState['scoreMode']): number {
  if (mode === 'none' || mode === 'vegas') return 0;
  return 5;
}

export const golf: Variant = {
  id: 'golf',
  name: 'Golf',
  layout: GOLF_LAYOUT,
  foundationsLocked: true,
  /** No waste→stock recycle — classic Golf is a single pass through the stock. */
  stockRecycle: false,

  createDeck() {
    return buildDeck();
  },

  deal(deck, seed) {
    return dealGolf(deck, seed);
  },

  getMovableRun(_state, pile, cardId) {
    if (pile.type !== 'tableau') return [];
    const top = topCard(pile);
    return top && top.id === cardId && top.faceUp ? [top] : [];
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length !== 1 || to !== 'waste') return false;
    if (!from.startsWith('tableau-')) return false;
    const card = tableauTop(state, from);
    if (!card || card.id !== cardIds[0]) return false;
    const waste = wasteTop(state);
    if (!waste) return false;
    return golfAdjacent(card.rank, waste.rank);
  },

  getLegalMoves(state, options) {
    const skip = options?.skipScoring ?? false;
    const moves: Move[] = [];
    const waste = wasteTop(state);

    if (waste) {
      for (const id of TABLEAU_IDS) {
        const card = tableauTop(state, id);
        if (!card || !golfAdjacent(card.rank, waste.rank)) continue;
        const move: Move = {
          from: id,
          to: 'waste',
          cardIds: [card.id],
          scoreDelta: 0,
          ts: 0,
        };
        if (!skip) move.scoreDelta = playScore(state.scoreMode);
        moves.push(move);
      }
    }

    const stock = state.piles.stock;
    if (stock && stock.cards.length > 0) {
      moves.push({
        from: 'stock',
        to: 'waste',
        cardIds: [],
        drew: 1,
        scoreDelta: 0,
        ts: 0,
      });
    }

    return moves;
  },

  isWon(state) {
    return TABLEAU_IDS.every((id) => (state.piles[id]?.cards.length ?? 0) === 0);
  },

  autoMoveTarget(state, cardId) {
    for (const id of TABLEAU_IDS) {
      const top = tableauTop(state, id);
      if (top?.id !== cardId) continue;
      if (golf.canDrop(state, [cardId], id, 'waste')) return 'waste';
      return null;
    }
    return null;
  },

  autoMoveToFoundation(state, pileId, cardId) {
    if (golf.canDrop(state, [cardId], pileId, 'waste')) return 'waste';
    return null;
  },

  score(move, mode) {
    if (mode === 'none' || mode === 'vegas') return 0;
    if (move.drew || move.recycled) return 0;
    if (move.from.startsWith('tableau-') && move.to === 'waste') return 5;
    return 0;
  },
};

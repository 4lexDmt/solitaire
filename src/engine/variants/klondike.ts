import { createRng, shuffle } from '../rng';
import { scoreMove } from '../scoring';
import type { Card, GameState, Move, Pile } from '../types';
import type { Variant } from '../variant';

const TABLEAU_IDS = Array.from({ length: 7 }, (_, i) => `tableau-${i}`);
const FOUNDATION_IDS = Array.from({ length: 4 }, (_, i) => `foundation-${i}`);

export const KLONDIKE_LAYOUT = {
  piles: [
    { id: 'stock', type: 'stock' as const, gridArea: 'stock' },
    { id: 'waste', type: 'waste' as const, gridArea: 'waste' },
    ...FOUNDATION_IDS.map((id) => ({ id, type: 'foundation' as const, gridArea: id })),
    ...TABLEAU_IDS.map((id) => ({ id, type: 'tableau' as const, gridArea: id })),
  ],
};

function emptyPile(id: string, type: Pile['type']): Pile {
  return { id, type, cards: [] };
}

function getCard(state: GameState, pileId: string, cardId: string): Card | undefined {
  return state.piles[pileId]?.cards.find((c) => c.id === cardId);
}

function topCard(pile: Pile): Card | undefined {
  return pile.cards[pile.cards.length - 1];
}

function cardIndex(pile: Pile, cardId: string): number {
  return pile.cards.findIndex((c) => c.id === cardId);
}

function runFromCard(pile: Pile, cardId: string): Card[] {
  const idx = cardIndex(pile, cardId);
  if (idx < 0) return [];
  const run = pile.cards.slice(idx);
  if (!run.every((c) => c.faceUp)) return [];
  return run;
}

function isDescendingAlternating(run: Card[]): boolean {
  for (let i = 1; i < run.length; i++) {
    const prev = run[i - 1];
    const curr = run[i];
    if (prev.color === curr.color || prev.rank !== curr.rank + 1) {
      return false;
    }
  }
  return true;
}

function canPlaceOnTableau(card: Card, target: Pile): boolean {
  if (target.cards.length === 0) {
    return true;
  }
  const dest = topCard(target)!;
  return dest.color !== card.color && dest.rank === card.rank + 1;
}

function canPlaceOnFoundation(card: Card, target: Pile): boolean {
  if (target.cards.length === 0) {
    return card.rank === 1;
  }
  const dest = topCard(target)!;
  return dest.suit === card.suit && dest.rank === card.rank - 1;
}

function foundationForSuit(suit: Card['suit']): string {
  const order: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  return `foundation-${order.indexOf(suit)}`;
}

function dealKlondike(deck: Card[], seed: string): Record<string, Pile> {
  const rng = createRng(seed);
  const shuffled = shuffle(deck, rng);

  const piles: Record<string, Pile> = {
    stock: emptyPile('stock', 'stock'),
    waste: emptyPile('waste', 'waste'),
  };

  for (const id of FOUNDATION_IDS) {
    piles[id] = emptyPile(id, 'foundation');
  }
  for (const id of TABLEAU_IDS) {
    piles[id] = emptyPile(id, 'tableau');
  }

  let cursor = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...shuffled[cursor++] };
      card.faceUp = row === col;
      piles[`tableau-${col}`].cards.push(card);
    }
  }

  while (cursor < shuffled.length) {
    piles.stock.cards.push({ ...shuffled[cursor++], faceUp: false });
  }

  return piles;
}

function enumerateCardMoves(state: GameState, skipScoring = false): Move[] {
  const moves: Move[] = [];
  const ts = 0;

  const tryMove = (from: string, to: string, cardIds: string[]) => {
    if (klondike.canDrop(state, cardIds, from, to)) {
      const move: Move = { from, to, cardIds, scoreDelta: 0, ts };
      if (!skipScoring) {
        move.scoreDelta = klondike.score(move, state.scoreMode);
      }
      moves.push(move);
    }
  };

  // Waste top card
  const wasteTop = topCard(state.piles.waste);
  if (wasteTop) {
    for (const fid of FOUNDATION_IDS) {
      tryMove('waste', fid, [wasteTop.id]);
    }
    for (const tid of TABLEAU_IDS) {
      tryMove('waste', tid, [wasteTop.id]);
    }
  }

  // Foundation tops (worrying back)
  for (const fid of FOUNDATION_IDS) {
    const fTop = topCard(state.piles[fid]);
    if (!fTop) continue;
    for (const tid of TABLEAU_IDS) {
      tryMove(fid, tid, [fTop.id]);
    }
  }

  // Tableau runs
  for (const tid of TABLEAU_IDS) {
    const pile = state.piles[tid];
    for (const card of pile.cards) {
      if (!card.faceUp) continue;
      const run = runFromCard(pile, card.id);
      if (run.length === 0 || !isDescendingAlternating(run)) continue;
      const ids = run.map((c) => c.id);

      for (const fid of FOUNDATION_IDS) {
        if (run.length === 1) {
          tryMove(tid, fid, ids);
        }
      }

      for (const destId of TABLEAU_IDS) {
        if (destId === tid) continue;
        tryMove(tid, destId, ids);
      }
    }
  }

  return moves;
}

function enumerateDrawRecycle(state: GameState): Move[] {
  const moves: Move[] = [];
  const ts = 0;
  const stock = state.piles.stock;
  const waste = state.piles.waste;

  if (stock.cards.length > 0) {
    const drew = Math.min(state.drawCount, stock.cards.length) as 1 | 3;
    moves.push({
      from: 'stock',
      to: 'waste',
      cardIds: [],
      drew,
      scoreDelta: 0,
      ts,
    });
  } else if (waste.cards.length > 0) {
    const canRecycle =
      state.stockPassLimit === 'unlimited' ||
      state.stockRecycles < state.stockPassLimit;
    if (canRecycle) {
      moves.push({
        from: 'waste',
        to: 'stock',
        cardIds: [],
        recycled: true,
        scoreDelta: 0,
        ts,
      });
    }
  }

  return moves;
}

export const klondike: Variant = {
  id: 'klondike',
  name: 'Klondike',
  layout: KLONDIKE_LAYOUT,

  deal(deck, seed) {
    return dealKlondike(deck, seed);
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length === 0) return false;
    if (from === to) return false;

    const fromPile = state.piles[from];
    const toPile = state.piles[to];
    if (!fromPile || !toPile) return false;

    const run = runFromCard(fromPile, cardIds[0]);
    if (run.length !== cardIds.length) return false;
    if (run.map((c) => c.id).join(',') !== cardIds.join(',')) return false;

    const moving = run[0];

    if (from === 'waste') {
      if (cardIds.length !== 1 || topCard(fromPile)?.id !== moving.id) return false;
    }

    if (from.startsWith('foundation-')) {
      if (cardIds.length !== 1 || topCard(fromPile)?.id !== moving.id) return false;
    }

    if (to.startsWith('tableau-')) {
      if (!isDescendingAlternating(run)) return false;
      return canPlaceOnTableau(moving, toPile);
    }

    if (to.startsWith('foundation-')) {
      if (cardIds.length !== 1) return false;
      return canPlaceOnFoundation(moving, toPile);
    }

    return false;
  },

  getLegalMoves(state, options?: { skipScoring?: boolean }) {
    const skipScoring = options?.skipScoring ?? false;
    return [...enumerateCardMoves(state, skipScoring), ...enumerateDrawRecycle(state)];
  },

  isWon(state) {
    return FOUNDATION_IDS.every((id) => {
      const pile = state.piles[id];
      return pile.cards.length === 13 && topCard(pile)?.rank === 13;
    });
  },

  autoMoveToFoundation(state, pileId, cardId) {
    const fromPile = state.piles[pileId];
    if (!fromPile) return null;

    const run = runFromCard(fromPile, cardId);
    if (run.length !== 1) return null;

    const card = run[0];
    if (!card.faceUp) return null;

    const foundationId = foundationForSuit(card.suit);
    if (klondike.canDrop(state, [cardId], pileId, foundationId)) {
      return foundationId;
    }

    return null;
  },

  autoMoveTarget(state, cardId) {
    let sourcePile: string | null = null;
    let card: Card | undefined;

    for (const [pileId, pile] of Object.entries(state.piles)) {
      const found = pile.cards.find((c) => c.id === cardId);
      if (found) {
        sourcePile = pileId;
        card = found;
        break;
      }
    }

    if (!sourcePile || !card || !card.faceUp) return null;

    const fromPile = state.piles[sourcePile];
    const run = runFromCard(fromPile, cardId);
    if (run.length === 0) return null;

    if (run.length === 1) {
      const foundationId = foundationForSuit(card.suit);
      if (klondike.canDrop(state, [cardId], sourcePile, foundationId)) {
        return foundationId;
      }
    }

    for (const tid of TABLEAU_IDS) {
      if (tid === sourcePile) continue;
      const ids = run.map((c) => c.id);
      if (klondike.canDrop(state, ids, sourcePile, tid)) {
        return tid;
      }
    }

    return null;
  },

  score(move, mode) {
    return scoreMove(move, mode);
  },
};

export { getCard, topCard, runFromCard, isDescendingAlternating, canPlaceOnTableau, canPlaceOnFoundation };

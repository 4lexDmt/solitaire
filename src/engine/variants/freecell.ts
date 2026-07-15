import { buildDeck } from '../deck';
import { createRng, shuffle } from '../rng';
import { scoreMove } from '../scoring';
import type { Card, GameState, Move, Pile, Suit } from '../types';
import type { Variant } from '../variant';

const TABLEAU_IDS = Array.from({ length: 8 }, (_, i) => `tableau-${i}`);
const FOUNDATION_IDS = Array.from({ length: 4 }, (_, i) => `foundation-${i}`);
const CELL_IDS = Array.from({ length: 4 }, (_, i) => `cell-${i}`);

export const FREECELL_LAYOUT = {
  piles: [
    ...CELL_IDS.map((id) => ({ id, type: 'cell' as const, gridArea: id })),
    ...FOUNDATION_IDS.map((id) => ({ id, type: 'foundation' as const, gridArea: id })),
    ...TABLEAU_IDS.map((id) => ({ id, type: 'tableau' as const, gridArea: id })),
  ],
};

function emptyPile(id: string, type: Pile['type']): Pile {
  return { id, type, cards: [] };
}

function topCard(pile: Pile): Card | undefined {
  return pile.cards[pile.cards.length - 1];
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

function runFromCard(pile: Pile, cardId: string): Card[] {
  const idx = pile.cards.findIndex((c) => c.id === cardId);
  if (idx < 0) return [];
  const run = pile.cards.slice(idx);
  if (!isDescendingAlternating(run)) return [];
  return run;
}

function freeCellCount(state: GameState): number {
  return CELL_IDS.filter((id) => state.piles[id].cards.length === 0).length;
}

function emptyColumnCount(state: GameState, exclude?: string): number {
  return TABLEAU_IDS.filter(
    (id) => id !== exclude && state.piles[id].cards.length === 0,
  ).length;
}

/** Max run size = (1 + free cells) × 2^(empty columns), per standard FreeCell supermove rules. */
function maxRunSize(state: GameState, from: string, to?: string): number {
  const cells = freeCellCount(state);
  let empties = emptyColumnCount(state, from);
  if (to && state.piles[to]?.cards.length === 0) {
    empties = Math.max(0, empties - 1);
  }
  return (1 + cells) * 2 ** empties;
}

function canPlaceOnTableau(card: Card, target: Pile): boolean {
  if (target.cards.length === 0) return true;
  const dest = topCard(target)!;
  return dest.color !== card.color && dest.rank === card.rank + 1;
}

function canPlaceOnFoundation(card: Card, target: Pile): boolean {
  if (target.cards.length === 0) return card.rank === 1;
  const dest = topCard(target)!;
  return dest.suit === card.suit && dest.rank === card.rank - 1;
}

function foundationForSuit(suit: Suit): string {
  const order: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  return `foundation-${order.indexOf(suit)}`;
}

function dealFreeCell(deck: Card[], seed: string): Record<string, Pile> {
  const rng = createRng(seed);
  const shuffled = shuffle(deck, rng);

  const piles: Record<string, Pile> = {};
  for (const id of CELL_IDS) piles[id] = emptyPile(id, 'cell');
  for (const id of FOUNDATION_IDS) piles[id] = emptyPile(id, 'foundation');
  for (const id of TABLEAU_IDS) piles[id] = emptyPile(id, 'tableau');

  // Row-major: columns 0–3 receive 7 cards, columns 4–7 receive 6. All face-up.
  shuffled.forEach((card, i) => {
    piles[`tableau-${i % 8}`].cards.push({ ...card, faceUp: true });
  });

  return piles;
}

function enumerateMoves(state: GameState, skipScoring = false): Move[] {
  const moves: Move[] = [];
  const ts = 0;

  const tryMove = (from: string, to: string, cardIds: string[]) => {
    if (freecell.canDrop(state, cardIds, from, to)) {
      const move: Move = { from, to, cardIds, scoreDelta: 0, ts };
      if (!skipScoring) {
        move.scoreDelta = freecell.score(move, state.scoreMode);
      }
      moves.push(move);
    }
  };

  for (const from of CELL_IDS) {
    const top = topCard(state.piles[from]);
    if (!top) continue;
    for (const to of [...FOUNDATION_IDS, ...TABLEAU_IDS]) {
      tryMove(from, to, [top.id]);
    }
  }

  // Worrying back: foundation tops may return to the tableau only.
  for (const from of FOUNDATION_IDS) {
    const top = topCard(state.piles[from]);
    if (!top) continue;
    for (const to of TABLEAU_IDS) {
      tryMove(from, to, [top.id]);
    }
  }

  for (const tid of TABLEAU_IDS) {
    const pile = state.piles[tid];
    for (const card of pile.cards) {
      const run = runFromCard(pile, card.id);
      if (run.length === 0) continue;
      const ids = run.map((c) => c.id);

      if (run.length === 1) {
        for (const fid of FOUNDATION_IDS) tryMove(tid, fid, ids);
        for (const cid of CELL_IDS) tryMove(tid, cid, ids);
      }
      for (const destId of TABLEAU_IDS) {
        if (destId === tid) continue;
        tryMove(tid, destId, ids);
      }
    }
  }

  return moves;
}

export const freecell: Variant = {
  id: 'freecell',
  name: 'FreeCell',
  layout: FREECELL_LAYOUT,

  createDeck() {
    return buildDeck();
  },

  deal(deck, seed) {
    return dealFreeCell(deck, seed);
  },

  getMovableRun(state, pile, cardId) {
    if (pile.type === 'cell' || pile.type === 'foundation') {
      const top = topCard(pile);
      return top && top.id === cardId ? [top] : [];
    }
    if (pile.type !== 'tableau') return [];
    const run = runFromCard(pile, cardId);
    if (run.length === 0) return [];
    if (run.length > maxRunSize(state, pile.id)) return [];
    return run;
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length === 0) return false;
    if (from === to) return false;

    const fromPile = state.piles[from];
    const toPile = state.piles[to];
    if (!fromPile || !toPile) return false;

    const startIdx = fromPile.cards.findIndex((c) => c.id === cardIds[0]);
    if (startIdx < 0) return false;
    const run = fromPile.cards.slice(startIdx);
    if (run.length !== cardIds.length) return false;
    if (run.map((c) => c.id).join(',') !== cardIds.join(',')) return false;

    if (fromPile.type === 'cell' || fromPile.type === 'foundation') {
      if (run.length !== 1) return false;
    }
    if (fromPile.type === 'tableau' && run.length > 1 && !isDescendingAlternating(run)) {
      return false;
    }

    const moving = run[0];

    if (toPile.type === 'cell') {
      return run.length === 1 && toPile.cards.length === 0;
    }

    if (toPile.type === 'foundation') {
      return run.length === 1 && canPlaceOnFoundation(moving, toPile);
    }

    if (toPile.type === 'tableau') {
      if (run.length > 1 && !isDescendingAlternating(run)) return false;
      if (fromPile.type === 'tableau' && run.length > maxRunSize(state, from, to)) {
        return false;
      }
      return canPlaceOnTableau(moving, toPile);
    }

    return false;
  },

  getLegalMoves(state, options?: { skipScoring?: boolean }) {
    return enumerateMoves(state, options?.skipScoring ?? false);
  },

  isWon(state) {
    return FOUNDATION_IDS.every((id) => state.piles[id].cards.length === 13);
  },

  autoMoveToFoundation(state, pileId, cardId) {
    const fromPile = state.piles[pileId];
    if (!fromPile) return null;
    const top = topCard(fromPile);
    if (!top || top.id !== cardId) return null;

    const preferred = foundationForSuit(top.suit);
    if (freecell.canDrop(state, [cardId], pileId, preferred)) return preferred;

    for (const fid of FOUNDATION_IDS) {
      if (fid === preferred) continue;
      if (freecell.canDrop(state, [cardId], pileId, fid)) return fid;
    }
    return null;
  },

  autoMoveTarget(state, cardId) {
    let sourcePile: string | null = null;
    for (const [pileId, pile] of Object.entries(state.piles)) {
      if (pile.cards.some((c) => c.id === cardId)) {
        sourcePile = pileId;
        break;
      }
    }
    if (!sourcePile) return null;

    const run = freecell.getMovableRun(state, state.piles[sourcePile], cardId);
    if (run.length === 0) return null;
    const ids = run.map((c) => c.id);

    if (run.length === 1) {
      const foundationId = foundationForSuit(run[0].suit);
      if (freecell.canDrop(state, ids, sourcePile, foundationId)) {
        return foundationId;
      }
      for (const fid of FOUNDATION_IDS) {
        if (freecell.canDrop(state, ids, sourcePile, fid)) return fid;
      }
    }

    // Prefer landing on a card over an empty column, then fall back to a free cell.
    let emptyTableau: string | null = null;
    for (const tid of TABLEAU_IDS) {
      if (tid === sourcePile) continue;
      if (!freecell.canDrop(state, ids, sourcePile, tid)) continue;
      if (state.piles[tid].cards.length > 0) return tid;
      emptyTableau = emptyTableau ?? tid;
    }
    if (emptyTableau) return emptyTableau;

    if (run.length === 1 && state.piles[sourcePile].type === 'tableau') {
      for (const cid of CELL_IDS) {
        if (freecell.canDrop(state, ids, sourcePile, cid)) return cid;
      }
    }

    return null;
  },

  score(move, mode) {
    return scoreMove(move, mode);
  },
};

export { maxRunSize as freecellMaxRunSize };

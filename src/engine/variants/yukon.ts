import { buildDeck } from '../deck';
import { createRng, shuffle } from '../rng';
import { scoreMove } from '../scoring';
import type { Card, GameState, Move, Pile } from '../types';
import type { Variant } from '../variant';
import {
  canPlaceOnFoundation,
  canPlaceOnTableau,
  runFromCard,
  topCard,
} from './klondike';

const TABLEAU_IDS = Array.from({ length: 7 }, (_, i) => `tableau-${i}`);
const FOUNDATION_IDS = Array.from({ length: 4 }, (_, i) => `foundation-${i}`);

export const YUKON_LAYOUT = {
  piles: [
    ...FOUNDATION_IDS.map((id) => ({ id, type: 'foundation' as const, gridArea: id })),
    ...TABLEAU_IDS.map((id) => ({ id, type: 'tableau' as const, gridArea: id })),
  ],
};

function emptyPile(id: string, type: Pile['type']): Pile {
  return { id, type, cards: [] };
}

function foundationForSuit(suit: Card['suit']): string {
  const order: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  return `foundation-${order.indexOf(suit)}`;
}

/**
 * Classic Yukon deal (52 cards, no stock):
 *   col 0: 1 face-up
 *   col n (1–6): n face-down + 5 face-up
 */
function dealYukon(deck: Card[], seed: string): Record<string, Pile> {
  const shuffled = shuffle(deck, createRng(seed));
  const piles: Record<string, Pile> = {};

  for (const id of FOUNDATION_IDS) piles[id] = emptyPile(id, 'foundation');
  for (const id of TABLEAU_IDS) piles[id] = emptyPile(id, 'tableau');

  let cursor = 0;
  for (let col = 0; col < 7; col++) {
    const faceDown = col === 0 ? 0 : col;
    const faceUp = col === 0 ? 1 : 5;
    for (let i = 0; i < faceDown; i++) {
      piles[`tableau-${col}`].cards.push({ ...shuffled[cursor++], faceUp: false });
    }
    for (let i = 0; i < faceUp; i++) {
      piles[`tableau-${col}`].cards.push({ ...shuffled[cursor++], faceUp: true });
    }
  }

  return piles;
}

function enumerateCardMoves(state: GameState, skipScoring = false): Move[] {
  const moves: Move[] = [];
  const ts = 0;

  const tryMove = (from: string, to: string, cardIds: string[]) => {
    if (yukon.canDrop(state, cardIds, from, to)) {
      const move: Move = { from, to, cardIds, scoreDelta: 0, ts };
      if (!skipScoring) move.scoreDelta = yukon.score(move, state.scoreMode);
      moves.push(move);
    }
  };

  for (const fid of FOUNDATION_IDS) {
    const fTop = topCard(state.piles[fid]);
    if (!fTop) continue;
    for (const tid of TABLEAU_IDS) {
      tryMove(fid, tid, [fTop.id]);
    }
  }

  for (const tid of TABLEAU_IDS) {
    const pile = state.piles[tid];
    if (!pile) continue;
    for (const card of pile.cards) {
      if (!card.faceUp) continue;
      const run = runFromCard(pile, card.id);
      if (run.length === 0) continue;
      const ids = run.map((c) => c.id);

      if (run.length === 1) {
        for (const fid of FOUNDATION_IDS) {
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

export const yukon: Variant = {
  id: 'yukon',
  name: 'Yukon',
  layout: YUKON_LAYOUT,

  createDeck() {
    return buildDeck();
  },

  deal(deck, seed) {
    return dealYukon(deck, seed);
  },

  getMovableRun(_state, pile, cardId) {
    // Any face-up card may move with everything stacked on it — no build check.
    return runFromCard(pile, cardId);
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length === 0 || from === to) return false;

    const fromPile = state.piles[from];
    const toPile = state.piles[to];
    if (!fromPile || !toPile) return false;

    const run = runFromCard(fromPile, cardIds[0]);
    if (run.length !== cardIds.length) return false;
    if (run.map((c) => c.id).join(',') !== cardIds.join(',')) return false;

    const moving = run[0];

    if (from.startsWith('foundation-')) {
      if (cardIds.length !== 1 || topCard(fromPile)?.id !== moving.id) return false;
    }

    if (to.startsWith('tableau-')) {
      return canPlaceOnTableau(moving, toPile);
    }

    if (to.startsWith('foundation-')) {
      if (cardIds.length !== 1) return false;
      return canPlaceOnFoundation(moving, toPile);
    }

    return false;
  },

  getLegalMoves(state, options) {
    return enumerateCardMoves(state, options?.skipScoring ?? false);
  },

  isWon(state) {
    return FOUNDATION_IDS.every((id) => {
      const pile = state.piles[id];
      return pile?.cards.length === 13 && topCard(pile)?.rank === 13;
    });
  },

  autoMoveToFoundation(state, pileId, cardId) {
    const fromPile = state.piles[pileId];
    if (!fromPile) return null;

    const run = runFromCard(fromPile, cardId);
    if (run.length !== 1 || !run[0].faceUp) return null;

    const preferred = foundationForSuit(run[0].suit);
    if (yukon.canDrop(state, [cardId], pileId, preferred)) return preferred;

    for (const fid of FOUNDATION_IDS) {
      if (fid === preferred) continue;
      if (yukon.canDrop(state, [cardId], pileId, fid)) return fid;
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

    const run = runFromCard(state.piles[sourcePile], cardId);
    if (run.length === 0) return null;

    if (run.length === 1) {
      const foundationId = foundationForSuit(card.suit);
      if (yukon.canDrop(state, [cardId], sourcePile, foundationId)) {
        return foundationId;
      }
    }

    for (const tid of TABLEAU_IDS) {
      if (tid === sourcePile) continue;
      const ids = run.map((c) => c.id);
      if (yukon.canDrop(state, ids, sourcePile, tid)) return tid;
    }

    return null;
  },

  score(move, mode) {
    return scoreMove(move, mode);
  },
};

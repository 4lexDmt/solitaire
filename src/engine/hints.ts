import type { Card, GameState, Move } from './types';
import { getVariant } from './variants';

function findCard(state: GameState, cardId: string): { pileId: string; card: Card } | null {
  for (const [pileId, pile] of Object.entries(state.piles)) {
    const card = pile.cards.find((c) => c.id === cardId);
    if (card) return { pileId, card };
  }
  return null;
}

function tableauPiles(state: GameState) {
  return Object.values(state.piles).filter((p) => p.type === 'tableau');
}

/** True if moving this card to foundation would block a visible tableau build. */
function foundationWouldStrand(state: GameState, cardId: string): boolean {
  const found = findCard(state, cardId);
  if (!found || found.card.rank <= 2) return false;

  const { card } = found;
  for (const pile of tableauPiles(state)) {
    const top = pile.cards[pile.cards.length - 1];
    if (!top || !top.faceUp) continue;
    if (top.color !== card.color && top.rank === card.rank + 1) {
      return true;
    }
  }
  return false;
}

function wouldFlipTableau(state: GameState, move: Move): boolean {
  if (!move.from.startsWith('tableau-')) return false;
  const pile = state.piles[move.from];
  const idx = pile.cards.findIndex((c) => c.id === move.cardIds[0]);
  if (idx <= 0) return false;
  return !pile.cards[idx - 1].faceUp;
}

function emptiesColumn(state: GameState, move: Move): boolean {
  if (!move.from.startsWith('tableau-')) return false;
  const pile = state.piles[move.from];
  return pile.cards.length === move.cardIds.length;
}

function movesKing(state: GameState, move: Move): boolean {
  const found = findCard(state, move.cardIds[0]);
  return found?.card.rank === 13;
}

function scoreMoveHeuristic(state: GameState, move: Move): number {
  if (move.recycled) return -15;
  if (move.drew) return 3;

  let score = 0;

  if (wouldFlipTableau(state, move)) {
    score += 55;
  }

  if (move.to.startsWith('foundation-')) {
    score += 35;
    if (foundationWouldStrand(state, move.cardIds[0])) {
      score -= 45;
    }
  }

  if (move.from === 'waste' && move.to.startsWith('tableau-')) {
    score += 22;
  }

  if (move.from.startsWith('tableau-') && move.to.startsWith('tableau-')) {
    score += 12;
    if (emptiesColumn(state, move)) {
      score += 28;
    }
    // Same-suit joins keep Spider runs completable (no-op for alternating-color variants).
    const destTop = state.piles[move.to].cards[state.piles[move.to].cards.length - 1];
    const moving = findCard(state, move.cardIds[0]);
    if (destTop?.faceUp && moving && destTop.suit === moving.card.suit) {
      score += 10;
    }
  }

  if (move.to.startsWith('cell-')) {
    score -= 18; // parking a card in a free cell costs flexibility
  }

  if (move.from.startsWith('foundation-') && move.to.startsWith('tableau-')) {
    score -= 25;
  }

  if (movesKing(state, move) && move.to.startsWith('tableau-')) {
    const dest = state.piles[move.to];
    if (dest.cards.length === 0) {
      score += 18;
    }
  }

  return score;
}

/** Rank legal moves best-first using lightweight heuristics. */
export function rankMoves(state: GameState): Move[] {
  const moves = getVariant(state.variantId).getLegalMoves(state);
  return [...moves].sort((a, b) => scoreMoveHeuristic(state, b) - scoreMoveHeuristic(state, a));
}

/**
 * Return 1–2 card ids to highlight for the best hint move(s).
 * Draw/recycle hints return an empty list (UI highlights stock separately).
 */
export function getHintCardIds(state: GameState): string[] {
  const ranked = rankMoves(state);
  if (ranked.length === 0) return [];

  const best = ranked[0];
  const bestScore = scoreMoveHeuristic(state, best);
  const ids: string[] = [];

  if (best.cardIds.length > 0) {
    ids.push(best.cardIds[best.cardIds.length - 1]);
  }

  if (ranked.length > 1) {
    const second = ranked[1];
    if (second.cardIds.length > 0) {
      const secondId = second.cardIds[second.cardIds.length - 1];
      const secondScore = scoreMoveHeuristic(state, second);
      if (secondId !== ids[0] && secondScore >= bestScore - 8) {
        ids.push(secondId);
      }
    }
  }

  return ids.slice(0, 2);
}

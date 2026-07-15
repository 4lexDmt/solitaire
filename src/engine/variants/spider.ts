import { buildSpiderDeck } from '../deck';
import { createRng, shuffle } from '../rng';
import type { Card, CompletedRun, GameState, Move, Pile } from '../types';
import type { SpiderSuits, Variant, VariantDeckOptions } from '../variant';

const TABLEAU_IDS = Array.from({ length: 10 }, (_, i) => `tableau-${i}`);
const FOUNDATION_IDS = Array.from({ length: 8 }, (_, i) => `foundation-${i}`);

export const SPIDER_TABLEAU_IDS = TABLEAU_IDS;
export const SPIDER_LAYOUT = {
  piles: [
    { id: 'stock', type: 'stock' as const, gridArea: 'stock' },
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

function isDescendingSameSuit(run: Card[]): boolean {
  for (let i = 1; i < run.length; i++) {
    const prev = run[i - 1];
    const curr = run[i];
    if (prev.suit !== curr.suit || prev.rank !== curr.rank + 1) {
      return false;
    }
  }
  return true;
}

/** Face-up, same-suit descending run starting at cardId (movable unit). */
function runFromCard(pile: Pile, cardId: string): Card[] {
  const idx = pile.cards.findIndex((c) => c.id === cardId);
  if (idx < 0) return [];
  const run = pile.cards.slice(idx);
  if (!run.every((c) => c.faceUp)) return [];
  if (!isDescendingSameSuit(run)) return [];
  return run;
}

function dealSpider(deck: Card[], seed: string): Record<string, Pile> {
  const rng = createRng(seed);
  const shuffled = shuffle(deck, rng);

  const piles: Record<string, Pile> = {
    stock: emptyPile('stock', 'stock'),
  };
  for (const id of FOUNDATION_IDS) piles[id] = emptyPile(id, 'foundation');
  for (const id of TABLEAU_IDS) piles[id] = emptyPile(id, 'tableau');

  // Columns 0–3 receive 6 cards, 4–9 receive 5 (54 total); top card face-up.
  let cursor = 0;
  for (let col = 0; col < 10; col++) {
    const count = col < 4 ? 6 : 5;
    for (let row = 0; row < count; row++) {
      const card = { ...shuffled[cursor++] };
      card.faceUp = row === count - 1;
      piles[`tableau-${col}`].cards.push(card);
    }
  }

  while (cursor < shuffled.length) {
    piles.stock.cards.push({ ...shuffled[cursor++], faceUp: false });
  }

  return piles;
}

function canDealFromStock(state: GameState): boolean {
  const stock = state.piles.stock;
  if (!stock || stock.cards.length === 0) return false;
  return TABLEAU_IDS.every((id) => state.piles[id].cards.length > 0);
}

function spiderScore(move: Move, mode: GameState['scoreMode']): number {
  if (mode === 'none' || mode === 'vegas') return 0;

  let delta = 0;
  if (move.completed) delta += move.completed.length * 100;
  if (move.flipped) delta += 5;
  for (const run of move.completed ?? []) {
    if (run.flipped) delta += 5;
  }
  return delta;
}

function enumerateMoves(state: GameState, skipScoring = false): Move[] {
  const moves: Move[] = [];
  const ts = 0;

  for (const tid of TABLEAU_IDS) {
    const pile = state.piles[tid];
    for (const card of pile.cards) {
      if (!card.faceUp) continue;
      const run = runFromCard(pile, card.id);
      if (run.length === 0) continue;
      const ids = run.map((c) => c.id);

      for (const destId of TABLEAU_IDS) {
        if (destId === tid) continue;
        if (spider.canDrop(state, ids, tid, destId)) {
          const move: Move = { from: tid, to: destId, cardIds: ids, scoreDelta: 0, ts };
          if (!skipScoring) move.scoreDelta = spiderScore(move, state.scoreMode);
          moves.push(move);
        }
      }
    }
  }

  if (canDealFromStock(state)) {
    moves.push({
      from: 'stock',
      to: 'tableau',
      cardIds: [],
      drew: Math.min(TABLEAU_IDS.length, state.piles.stock.cards.length),
      scoreDelta: 0,
      ts,
    });
  }

  return moves;
}

export const spider: Variant = {
  id: 'spider',
  name: 'Spider',
  layout: SPIDER_LAYOUT,
  dealsToTableau: true,
  foundationsLocked: true,

  createDeck(options?: VariantDeckOptions) {
    return buildSpiderDeck((options?.spiderSuits ?? 1) as SpiderSuits);
  },

  deal(deck, seed) {
    return dealSpider(deck, seed);
  },

  getMovableRun(_state, pile, cardId) {
    if (pile.type !== 'tableau') return [];
    return runFromCard(pile, cardId);
  },

  canDrop(state, cardIds, from, to) {
    if (cardIds.length === 0) return false;
    if (from === to) return false;

    const fromPile = state.piles[from];
    const toPile = state.piles[to];
    if (!fromPile || !toPile) return false;
    if (fromPile.type !== 'tableau' || toPile.type !== 'tableau') return false;

    const run = runFromCard(fromPile, cardIds[0]);
    if (run.length !== cardIds.length) return false;
    if (run.map((c) => c.id).join(',') !== cardIds.join(',')) return false;

    if (toPile.cards.length === 0) return true;
    const dest = topCard(toPile)!;
    return dest.faceUp && dest.rank === run[0].rank + 1;
  },

  getLegalMoves(state, options?: { skipScoring?: boolean }) {
    return enumerateMoves(state, options?.skipScoring ?? false);
  },

  isWon(state) {
    return FOUNDATION_IDS.every((id) => state.piles[id].cards.length === 13);
  },

  settleCompletions(piles) {
    const completed: CompletedRun[] = [];

    for (const tid of TABLEAU_IDS) {
      const pile = piles[tid];
      if (!pile || pile.cards.length < 13) continue;

      const tail = pile.cards.slice(-13);
      if (!tail.every((c) => c.faceUp)) continue;
      if (tail[0].rank !== 13 || !isDescendingSameSuit(tail)) continue;

      const foundationId = FOUNDATION_IDS.find((fid) => piles[fid].cards.length === 0);
      if (!foundationId) continue;

      const moved = pile.cards.splice(pile.cards.length - 13, 13);
      piles[foundationId].cards.push(...moved);
      piles[foundationId].suit = moved[0].suit;

      let flipped: CompletedRun['flipped'];
      const newTop = topCard(pile);
      if (newTop && !newTop.faceUp) {
        newTop.faceUp = true;
        flipped = { pileId: tid, cardId: newTop.id };
      }

      completed.push({
        from: tid,
        to: foundationId,
        cardIds: moved.map((c) => c.id),
        flipped,
      });
    }

    return completed;
  },

  autoMoveToFoundation() {
    return null; // Spider foundations fill automatically on run completion.
  },

  autoMoveTarget(state, cardId) {
    let sourcePile: string | null = null;
    for (const [pileId, pile] of Object.entries(state.piles)) {
      if (pile.type === 'tableau' && pile.cards.some((c) => c.id === cardId)) {
        sourcePile = pileId;
        break;
      }
    }
    if (!sourcePile) return null;

    const run = runFromCard(state.piles[sourcePile], cardId);
    if (run.length === 0) return null;
    const ids = run.map((c) => c.id);

    let fallback: string | null = null;
    let emptyColumn: string | null = null;
    for (const tid of TABLEAU_IDS) {
      if (tid === sourcePile) continue;
      if (!spider.canDrop(state, ids, sourcePile, tid)) continue;

      const dest = state.piles[tid];
      if (dest.cards.length === 0) {
        emptyColumn = emptyColumn ?? tid;
        continue;
      }
      if (topCard(dest)!.suit === run[0].suit) return tid; // same-suit join first
      fallback = fallback ?? tid;
    }

    return fallback ?? emptyColumn;
  },

  score(move, mode) {
    return spiderScore(move, mode);
  },
};

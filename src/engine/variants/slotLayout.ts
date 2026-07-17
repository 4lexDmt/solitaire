import type { Card, GameState, Move, Pile, Rank } from '../types';

export const SLOT_COUNT_PYRAMID = 28;
export const SLOT_COUNT_TRIPEAKS = 28;

export function slotId(index: number): string {
  return `slot-${index}`;
}

export function slotIndex(id: string): number {
  return Number(id.split('-')[1] ?? -1);
}

export function emptyPile(id: string, type: Pile['type']): Pile {
  return { id, type, cards: [] };
}

export function topCard(pile: Pile | undefined): Card | undefined {
  if (!pile || pile.cards.length === 0) return undefined;
  return pile.cards[pile.cards.length - 1];
}

/** Children covered by pyramid card `i` (row-major 0…27). */
export function pyramidChildren(i: number): number[] {
  let row = 0;
  let start = 0;
  while (start + row + 1 <= i) {
    start += row + 1;
    row += 1;
  }
  if (row >= 6) return [];
  const pos = i - start;
  const nextStart = start + (row + 1);
  return [nextStart + pos, nextStart + pos + 1];
}

/**
 * TriPeaks covering graph (3 peaks → base of 10):
 *        0       1       2
 *      3   4   5   6   7   8
 *    9  10 11 12 13 14 15 16 17
 *  18 19 20 21 22 23 24 25 26 27
 */
export const TRIPEAKS_CHILDREN: readonly (readonly number[])[] = [
  [3, 4],
  [5, 6],
  [7, 8],
  [9, 10],
  [10, 11],
  [12, 13],
  [13, 14],
  [15, 16],
  [16, 17],
  [18, 19],
  [19, 20],
  [20, 21],
  [21, 22],
  [22, 23],
  [23, 24],
  [24, 25],
  [25, 26],
  [26, 27],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
];

export function isSlotFree(
  state: GameState,
  index: number,
  mode: 'pyramid' | 'tripeaks',
): boolean {
  const pile = state.piles[slotId(index)];
  if (!pile || pile.cards.length === 0) return false;
  // A card is free when every card covering it (its children below) is gone.
  const covering =
    mode === 'pyramid' ? pyramidChildren(index) : (TRIPEAKS_CHILDREN[index] ?? []);
  return covering.every((c) => (state.piles[slotId(c)]?.cards.length ?? 0) === 0);
}

export function pyramidSumsTo13(a: Rank, b: Rank): boolean {
  return a + b === 13;
}

/** Adjacent ranks for TriPeaks; Ace wraps with King. */
export function tripeaksAdjacent(a: Rank, b: Rank): boolean {
  if (a === b) return false;
  const diff = Math.abs(a - b);
  return diff === 1 || diff === 12; // A(1)↔K(13)
}

export function dealSlots(
  shuffled: Card[],
  count: number,
  faceUp = true,
): Record<string, Pile> {
  const piles: Record<string, Pile> = {
    stock: emptyPile('stock', 'stock'),
    waste: emptyPile('waste', 'waste'),
    'foundation-0': emptyPile('foundation-0', 'foundation'),
  };
  for (let i = 0; i < count; i++) {
    piles[slotId(i)] = emptyPile(slotId(i), 'slot');
  }

  let cursor = 0;
  for (let i = 0; i < count; i++) {
    piles[slotId(i)].cards.push({ ...shuffled[cursor++], faceUp });
  }
  while (cursor < shuffled.length) {
    piles.stock.cards.push({ ...shuffled[cursor++], faceUp: false });
  }
  return piles;
}

export function enumerateStockMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  const stock = state.piles.stock;
  const waste = state.piles.waste;
  if (!stock || !waste) return moves;

  if (stock.cards.length > 0) {
    moves.push({
      from: 'stock',
      to: 'waste',
      cardIds: [],
      drew: 1,
      scoreDelta: 0,
      ts: 0,
    });
  } else if (waste.cards.length > 0) {
    const can =
      state.stockPassLimit === 'unlimited' ||
      state.stockRecycles < state.stockPassLimit;
    if (can) {
      moves.push({
        from: 'waste',
        to: 'stock',
        cardIds: [],
        recycled: true,
        scoreDelta: 0,
        ts: 0,
      });
    }
  }
  return moves;
}

import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { applyMove, draw, newGame } from '../reducer';
import type { GameState, Pile } from '../types';
import { isSlotFree, slotId, tripeaksAdjacent } from '../variants/slotLayout';
import { tripeaks } from '../variants/tripeaks';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function emptySlots(): Record<string, Pile> {
  const piles: Record<string, Pile> = {
    stock: pile('stock', 'stock', []),
    waste: pile('waste', 'waste', []),
    'foundation-0': pile('foundation-0', 'foundation', []),
  };
  for (let i = 0; i < 28; i++) piles[slotId(i)] = pile(slotId(i), 'slot', []);
  return piles;
}

function stateWith(overrides: Record<string, Pile>): GameState {
  return {
    variantId: 'tripeaks',
    seed: 'test',
    drawCount: 1,
    scoreMode: 'standard',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: { ...emptySlots(), ...overrides },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('tripeaks adjacency', () => {
  it('treats neighboring ranks and A–K wrap as adjacent', () => {
    expect(tripeaksAdjacent(7, 8)).toBe(true);
    expect(tripeaksAdjacent(1, 13)).toBe(true);
    expect(tripeaksAdjacent(5, 5)).toBe(false);
    expect(tripeaksAdjacent(5, 7)).toBe(false);
  });
});

describe('tripeaks deal', () => {
  it('deals 28 face-up peak slots and 24 stock', () => {
    const game = newGame({ seed: 'tp-1', variant: tripeaks, drawCount: 1 });
    for (let i = 0; i < 28; i++) {
      expect(game.piles[slotId(i)].cards).toHaveLength(1);
      expect(game.piles[slotId(i)].cards[0].faceUp).toBe(true);
    }
    expect(game.piles.stock.cards).toHaveLength(24);
    expect(isSlotFree(game, 27, 'tripeaks')).toBe(true);
    expect(isSlotFree(game, 0, 'tripeaks')).toBe(false);
  });
});

describe('tripeaks rules', () => {
  it('plays a free peak card onto an adjacent waste top', () => {
    const peak = createCard('hearts', 8, true);
    const waste = createCard('clubs', 7, true);
    const state = stateWith({
      [slotId(27)]: pile(slotId(27), 'slot', [peak]),
      waste: pile('waste', 'waste', [waste]),
    });
    expect(tripeaks.canDrop(state, [peak.id], slotId(27), 'waste')).toBe(true);
    const next = applyMove(state, slotId(27), 'waste', [peak.id], 1, tripeaks);
    expect(next.piles[slotId(27)].cards).toHaveLength(0);
    expect(next.piles.waste.cards.map((c) => c.id)).toEqual([waste.id, peak.id]);
    expect(next.score).toBeGreaterThan(0);
  });

  it('rejects non-adjacent peak plays', () => {
    const peak = createCard('hearts', 8, true);
    const waste = createCard('clubs', 3, true);
    const state = stateWith({
      [slotId(27)]: pile(slotId(27), 'slot', [peak]),
      waste: pile('waste', 'waste', [waste]),
    });
    expect(tripeaks.canDrop(state, [peak.id], slotId(27), 'waste')).toBe(false);
  });

  it('draws to seed the waste', () => {
    const state = stateWith({
      stock: pile('stock', 'stock', [createCard('diamonds', 9, false)]),
    });
    const next = draw(state, 1, tripeaks);
    expect(next.piles.waste.cards).toHaveLength(1);
    expect(next.piles.waste.cards[0].faceUp).toBe(true);
  });

  it('wins when all peaks are cleared', () => {
    expect(tripeaks.isWon(stateWith({}))).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { applyMove, canRecycle, draw, newGame } from '../reducer';
import type { GameState, Pile } from '../types';
import { golf, golfAdjacent } from '../variants/golf';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function emptyGolf(): Record<string, Pile> {
  const piles: Record<string, Pile> = {
    stock: pile('stock', 'stock', []),
    waste: pile('waste', 'waste', []),
  };
  for (let i = 0; i < 7; i++) piles[`tableau-${i}`] = pile(`tableau-${i}`, 'tableau', []);
  return piles;
}

function stateWith(overrides: Record<string, Pile>): GameState {
  return {
    variantId: 'golf',
    seed: 'test',
    drawCount: 1,
    scoreMode: 'standard',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: { ...emptyGolf(), ...overrides },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('golf adjacency', () => {
  it('allows neighboring ranks but not A–K wrap', () => {
    expect(golfAdjacent(7, 8)).toBe(true);
    expect(golfAdjacent(1, 2)).toBe(true);
    expect(golfAdjacent(12, 13)).toBe(true);
    expect(golfAdjacent(1, 13)).toBe(false);
    expect(golfAdjacent(5, 5)).toBe(false);
    expect(golfAdjacent(5, 7)).toBe(false);
  });
});

describe('golf deal', () => {
  it('deals 7×5 tableau, one waste starter, and 16 stock', () => {
    const game = newGame({ seed: 'golf-1', variant: golf, drawCount: 1 });
    const ids = Object.values(game.piles).flatMap((p) => p.cards.map((c) => c.id));
    expect(ids).toHaveLength(52);
    expect(new Set(ids).size).toBe(52);

    for (let i = 0; i < 7; i++) {
      const cards = game.piles[`tableau-${i}`].cards;
      expect(cards).toHaveLength(5);
      expect(cards.every((c) => c.faceUp)).toBe(true);
    }
    expect(game.piles.waste.cards).toHaveLength(1);
    expect(game.piles.waste.cards[0].faceUp).toBe(true);
    expect(game.piles.stock.cards).toHaveLength(16);
    expect(game.piles.stock.cards.every((c) => !c.faceUp)).toBe(true);
  });
});

describe('golf rules', () => {
  it('plays a tableau top onto an adjacent waste card', () => {
    const top = createCard('hearts', 8, true);
    const waste = createCard('clubs', 7, true);
    const buried = createCard('spades', 3, true);
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [buried, top]),
      waste: pile('waste', 'waste', [waste]),
    });

    expect(golf.canDrop(state, [top.id], 'tableau-0', 'waste')).toBe(true);
    const next = applyMove(state, 'tableau-0', 'waste', [top.id], 1, golf);
    expect(next.piles['tableau-0'].cards.map((c) => c.id)).toEqual([buried.id]);
    expect(next.piles.waste.cards.map((c) => c.id)).toEqual([waste.id, top.id]);
    expect(next.score).toBe(5);
  });

  it('rejects non-adjacent and buried cards', () => {
    const top = createCard('hearts', 8, true);
    const buried = createCard('spades', 7, true);
    const waste = createCard('clubs', 3, true);
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [buried, top]),
      waste: pile('waste', 'waste', [waste]),
    });
    expect(golf.canDrop(state, [top.id], 'tableau-0', 'waste')).toBe(false);
    expect(golf.canDrop(state, [buried.id], 'tableau-0', 'waste')).toBe(false);
  });

  it('draws from stock and never recycles', () => {
    const game = newGame({ seed: 'golf-draw', variant: golf, drawCount: 1 });
    const before = game.piles.waste.cards.length;
    const after = draw(game, 1, golf);
    expect(after.piles.waste.cards.length).toBe(before + 1);
    expect(after.piles.stock.cards.length).toBe(15);

    const emptyStock = stateWith({
      stock: pile('stock', 'stock', []),
      waste: pile('waste', 'waste', [createCard('hearts', 5, true)]),
    });
    expect(canRecycle(emptyStock)).toBe(false);
    expect(golf.getLegalMoves(emptyStock).some((m) => m.recycled)).toBe(false);
  });

  it('wins when every tableau column is empty', () => {
    const state = stateWith({
      waste: pile('waste', 'waste', [createCard('hearts', 9, true)]),
    });
    expect(golf.isWon(state)).toBe(true);
  });
});

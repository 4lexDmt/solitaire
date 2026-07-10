import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { newGame } from '../reducer';
import type { GameState, Pile } from '../types';
import {
  canPlaceOnFoundation,
  canPlaceOnTableau,
  isDescendingAlternating,
  klondike,
} from '../variants/klondike';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function stateWith(piles: Record<string, Pile>): GameState {
  return {
    variantId: 'klondike',
    seed: 'test',
    drawCount: 3,
    scoreMode: 'none',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles,
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('klondike rules', () => {
  it('tableau build-down alternating color', () => {
    const red6 = createCard('hearts', 6, true);
    const black7 = createCard('spades', 7, true);
    expect(canPlaceOnTableau(red6, pile('tableau-0', 'tableau', [black7]))).toBe(true);
    expect(canPlaceOnTableau(createCard('hearts', 6, true), pile('tableau-0', 'tableau', [createCard('hearts', 7, true)]))).toBe(false);
    expect(canPlaceOnTableau(createCard('hearts', 6, true), pile('tableau-0', 'tableau', [createCard('clubs', 5, true)]))).toBe(false);
  });

  it('empty tableau accepts any card', () => {
    expect(canPlaceOnTableau(createCard('spades', 13, true), pile('tableau-0', 'tableau', []))).toBe(true);
    expect(canPlaceOnTableau(createCard('hearts', 6, true), pile('tableau-0', 'tableau', []))).toBe(true);
  });

  it('foundation build-up by suit from ace', () => {
    const empty = pile('foundation-0', 'foundation', []);
    expect(canPlaceOnFoundation(createCard('hearts', 1, true), empty)).toBe(true);
    expect(canPlaceOnFoundation(createCard('hearts', 2, true), empty)).toBe(false);

    const withAce = pile('foundation-0', 'foundation', [createCard('hearts', 1, true)]);
    expect(canPlaceOnFoundation(createCard('hearts', 2, true), withAce)).toBe(true);
    expect(canPlaceOnFoundation(createCard('diamonds', 2, true), withAce)).toBe(false);
  });

  it('validates descending alternating runs', () => {
    const run = [
      createCard('clubs', 9, true),
      createCard('hearts', 8, true),
      createCard('spades', 7, true),
    ];
    expect(isDescendingAlternating(run)).toBe(true);
    expect(isDescendingAlternating([createCard('clubs', 9, true), createCard('spades', 8, true)])).toBe(false);
  });

  it('canDrop rejects illegal tableau and foundation moves', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 6, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('spades', 7, true)]),
      'foundation-0': pile('foundation-0', 'foundation', []),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });

    expect(klondike.canDrop(state, ['H6'], 'tableau-0', 'tableau-1')).toBe(true);
    expect(klondike.canDrop(state, ['H6'], 'tableau-0', 'foundation-0')).toBe(false);
  });

  it('canDrop allows king run onto empty tableau', () => {
    const king = createCard('spades', 13, true);
    const queen = createCard('hearts', 12, true);
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [king, queen]),
      'tableau-1': pile('tableau-1', 'tableau', []),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.canDrop(state, ['SK', 'HQ'], 'tableau-0', 'tableau-1')).toBe(true);
  });

  it('canDrop allows worrying back from foundation to tableau', () => {
    const state = stateWith({
      'foundation-0': pile('foundation-0', 'foundation', [createCard('hearts', 3, true)]),
      'tableau-0': pile('tableau-0', 'tableau', [createCard('spades', 4, true)]),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.canDrop(state, ['H3'], 'foundation-0', 'tableau-0')).toBe(true);
  });

  it('canDrop rejects non-top waste card', () => {
    const state = stateWith({
      waste: pile('waste', 'waste', [createCard('clubs', 2, true), createCard('diamonds', 5, true)]),
      'tableau-0': pile('tableau-0', 'tableau', [createCard('spades', 6, true)]),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.canDrop(state, ['C2'], 'waste', 'tableau-0')).toBe(false);
    expect(klondike.canDrop(state, ['D5'], 'waste', 'tableau-0')).toBe(true);
  });

  it('autoMoveTarget prefers foundation then tableau', () => {
    const state = stateWith({
      waste: pile('waste', 'waste', [createCard('hearts', 1, true)]),
      'foundation-0': pile('foundation-0', 'foundation', []),
      'tableau-0': pile('tableau-0', 'tableau', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.autoMoveTarget(state, 'HA')).toBe('foundation-0');
  });

  it('autoMoveToFoundation only targets the matching foundation pile', () => {
    const state = stateWith({
      waste: pile('waste', 'waste', [createCard('hearts', 1, true)]),
      'foundation-0': pile('foundation-0', 'foundation', []),
      'tableau-0': pile('tableau-0', 'tableau', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.autoMoveToFoundation(state, 'waste', 'HA')).toBe('foundation-0');
  });

  it('autoMoveToFoundation can place an ace on any empty foundation', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('clubs', 1, true)]),
      'foundation-0': pile('foundation-0', 'foundation', [createCard('hearts', 1, true)]),
      'foundation-1': pile('foundation-1', 'foundation', []),
      'foundation-2': pile('foundation-2', 'foundation', []),
      'foundation-3': pile('foundation-3', 'foundation', []),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.autoMoveToFoundation(state, 'tableau-0', 'CA')).toBe('foundation-2');
  });

  it('autoMoveToFoundation rejects multi-card runs and illegal builds', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [
        createCard('spades', 7, true),
        createCard('hearts', 6, true),
      ]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('hearts', 6, true)]),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.autoMoveToFoundation(state, 'tableau-0', 'H6')).toBe(null);
    expect(klondike.autoMoveToFoundation(state, 'tableau-1', 'H6')).toBe(null);
  });

  it('autoMoveTarget falls back to tableau when foundation unavailable', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('spades', 7, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('hearts', 6, true)]),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.autoMoveTarget(state, 'H6')).toBe('tableau-0');
  });

  it('autoMoveTarget returns null for face-down or missing cards', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('clubs', 5, false)]),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.autoMoveTarget(state, 'C5')).toBe(null);
    expect(klondike.autoMoveTarget(state, 'XX')).toBe(null);
  });

  it('canDrop rejects same pile, missing piles, and invalid targets', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 6, true)]),
      waste: pile('waste', 'waste', []),
      stock: pile('stock', 'stock', []),
    });
    expect(klondike.canDrop(state, [], 'tableau-0', 'tableau-1')).toBe(false);
    expect(klondike.canDrop(state, ['H6'], 'tableau-0', 'tableau-0')).toBe(false);
    expect(klondike.canDrop(state, ['H6'], 'tableau-0', 'missing')).toBe(false);
    expect(klondike.canDrop(state, ['H6'], 'tableau-0', 'stock')).toBe(false);
  });

  it('getLegalMoves enumerates foundation worry-back and tableau runs', () => {
    const emptyFoundations = Object.fromEntries(
      Array.from({ length: 4 }, (_, i) => [`foundation-${i}`, pile(`foundation-${i}`, 'foundation', [])]),
    );
    const emptyTableau = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [`tableau-${i}`, pile(`tableau-${i}`, 'tableau', [])]),
    );

    const state = stateWith({
      ...emptyFoundations,
      ...emptyTableau,
      'foundation-0': pile('foundation-0', 'foundation', [createCard('hearts', 3, true)]),
      'tableau-0': pile('tableau-0', 'tableau', [createCard('spades', 4, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('hearts', 7, true)]),
      'tableau-2': pile('tableau-2', 'tableau', [createCard('clubs', 8, true)]),
      waste: pile('waste', 'waste', [createCard('diamonds', 2, true)]),
      stock: pile('stock', 'stock', []),
    });
    const moves = klondike.getLegalMoves(state);
    expect(moves.some((m) => m.from === 'foundation-0' && m.to === 'tableau-0')).toBe(true);
    expect(moves.some((m) => m.from === 'tableau-1' && m.to === 'tableau-2')).toBe(true);
    expect(moves.some((m) => m.from === 'waste')).toBe(true);
  });

  it('getLegalMoves includes draw and recycle', () => {
    const emptyFoundations = Object.fromEntries(
      Array.from({ length: 4 }, (_, i) => [`foundation-${i}`, pile(`foundation-${i}`, 'foundation', [])]),
    );
    const emptyTableau = Object.fromEntries(
      Array.from({ length: 7 }, (_, i) => [`tableau-${i}`, pile(`tableau-${i}`, 'tableau', [])]),
    );

    const withStock = stateWith({
      ...emptyFoundations,
      ...emptyTableau,
      stock: pile('stock', 'stock', [createCard('clubs', 2, false)]),
      waste: pile('waste', 'waste', []),
    });
    expect(klondike.getLegalMoves(withStock).some((m) => m.drew === 1)).toBe(true);

    const recycleState = stateWith({
      ...emptyFoundations,
      ...emptyTableau,
      stock: pile('stock', 'stock', []),
      waste: pile('waste', 'waste', [createCard('diamonds', 4, true)]),
    });
    expect(klondike.getLegalMoves(recycleState).some((m) => m.recycled)).toBe(true);
  });

  it('isWon when all foundations have kings', () => {
    const won = stateWith({
      'foundation-0': pile('foundation-0', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('hearts', (i + 1) as 1, true))),
      'foundation-1': pile('foundation-1', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('diamonds', (i + 1) as 1, true))),
      'foundation-2': pile('foundation-2', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('clubs', (i + 1) as 1, true))),
      'foundation-3': pile('foundation-3', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('spades', (i + 1) as 1, true))),
    });
    expect(klondike.isWon(won)).toBe(true);

    const notWon = stateWith({
      'foundation-0': pile('foundation-0', 'foundation', Array.from({ length: 12 }, (_, i) => createCard('hearts', (i + 1) as 1, true))),
    });
    expect(klondike.isWon(notWon)).toBe(false);
  });

  it('deal distributes 28 to tableau and 24 to stock', () => {
    const game = newGame({ seed: 'abc12345' });
    const tableauCards = Array.from({ length: 7 }, (_, i) => game.piles[`tableau-${i}`].cards.length).reduce((a, b) => a + b, 0);
    expect(tableauCards).toBe(28);
    expect(game.piles.stock.cards).toHaveLength(24);
  });
});

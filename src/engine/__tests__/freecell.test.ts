import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { applyMove, newGame, undo } from '../reducer';
import type { GameState, Pile } from '../types';
import { freecell } from '../variants/freecell';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function basePiles(): Record<string, Pile> {
  const piles: Record<string, Pile> = {};
  for (let i = 0; i < 4; i++) piles[`cell-${i}`] = pile(`cell-${i}`, 'cell', []);
  for (let i = 0; i < 4; i++) piles[`foundation-${i}`] = pile(`foundation-${i}`, 'foundation', []);
  for (let i = 0; i < 8; i++) piles[`tableau-${i}`] = pile(`tableau-${i}`, 'tableau', []);
  return piles;
}

function stateWith(overrides: Record<string, Pile>): GameState {
  return {
    variantId: 'freecell',
    seed: 'test',
    drawCount: 3,
    scoreMode: 'none',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: { ...basePiles(), ...overrides },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('freecell deal', () => {
  it('deals 52 face-up cards: 7 to the first four columns, 6 to the rest', () => {
    const game = newGame({ seed: 'abc12345', variant: freecell });
    for (let i = 0; i < 8; i++) {
      const cards = game.piles[`tableau-${i}`].cards;
      expect(cards).toHaveLength(i < 4 ? 7 : 6);
      expect(cards.every((c) => c.faceUp)).toBe(true);
    }
    expect(game.piles.stock).toBeUndefined();
    expect(game.piles.waste).toBeUndefined();
    for (let i = 0; i < 4; i++) {
      expect(game.piles[`cell-${i}`].cards).toHaveLength(0);
    }
  });

  it('is deterministic per seed', () => {
    const a = newGame({ seed: 'seed-x', variant: freecell });
    const b = newGame({ seed: 'seed-x', variant: freecell });
    expect(a.piles['tableau-0'].cards.map((c) => c.id)).toEqual(
      b.piles['tableau-0'].cards.map((c) => c.id),
    );
  });
});

describe('freecell rules', () => {
  it('allows a single card into an empty cell only', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [
        createCard('spades', 7, true),
        createCard('hearts', 6, true),
      ]),
      'cell-0': pile('cell-0', 'cell', [createCard('clubs', 2, true)]),
    });
    expect(freecell.canDrop(state, ['H6'], 'tableau-0', 'cell-1')).toBe(true);
    expect(freecell.canDrop(state, ['H6'], 'tableau-0', 'cell-0')).toBe(false);
    expect(freecell.canDrop(state, ['S7', 'H6'], 'tableau-0', 'cell-1')).toBe(false);
  });

  it('builds tableau down in alternating colors', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 6, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('spades', 7, true)]),
      'tableau-2': pile('tableau-2', 'tableau', [createCard('diamonds', 7, true)]),
    });
    expect(freecell.canDrop(state, ['H6'], 'tableau-0', 'tableau-1')).toBe(true);
    expect(freecell.canDrop(state, ['H6'], 'tableau-0', 'tableau-2')).toBe(false);
  });

  it('limits run size to (1 + free cells) × 2^(empty columns)', () => {
    const run = [
      createCard('spades', 9, true),
      createCard('hearts', 8, true),
      createCard('clubs', 7, true),
    ];
    const filledCells = Object.fromEntries(
      Array.from({ length: 4 }, (_, i) => [
        `cell-${i}`,
        pile(`cell-${i}`, 'cell', [createCard('diamonds', (10 + i) as 10, true)]),
      ]),
    );
    // No free cells, no empty columns → max run = 1.
    const fullTableaus = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        `tableau-${i}`,
        pile(`tableau-${i}`, 'tableau', [createCard('clubs', 2, true)]),
      ]),
    );
    const tight = stateWith({
      ...fullTableaus,
      ...filledCells,
      'tableau-0': pile('tableau-0', 'tableau', run),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('diamonds', 10, true)]),
    });
    expect(freecell.canDrop(tight, ['S9', 'H8', 'C7'], 'tableau-0', 'tableau-1')).toBe(false);

    // Two free cells → max run = 3.
    const loose = stateWith({
      ...fullTableaus,
      ...filledCells,
      'cell-0': pile('cell-0', 'cell', []),
      'cell-1': pile('cell-1', 'cell', []),
      'tableau-0': pile('tableau-0', 'tableau', run),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('diamonds', 10, true)]),
    });
    expect(freecell.canDrop(loose, ['S9', 'H8', 'C7'], 'tableau-0', 'tableau-1')).toBe(true);
  });

  it('halves supermove capacity when the target is the empty column', () => {
    // One free cell, one empty column (the target): (1+1) × 2^0 = 2, not 4.
    const filledCells = Object.fromEntries(
      Array.from({ length: 4 }, (_, i) => [
        `cell-${i}`,
        pile(`cell-${i}`, 'cell', [createCard('diamonds', (10 + i) as 10, true)]),
      ]),
    );
    const fullTableaus = Object.fromEntries(
      Array.from({ length: 8 }, (_, i) => [
        `tableau-${i}`,
        pile(`tableau-${i}`, 'tableau', [createCard('clubs', 2, true)]),
      ]),
    );
    const run = [
      createCard('spades', 9, true),
      createCard('hearts', 8, true),
      createCard('clubs', 7, true),
    ];
    const state = stateWith({
      ...fullTableaus,
      ...filledCells,
      'cell-0': pile('cell-0', 'cell', []),
      'tableau-0': pile('tableau-0', 'tableau', run),
      'tableau-1': pile('tableau-1', 'tableau', []),
    });
    expect(freecell.canDrop(state, ['S9', 'H8', 'C7'], 'tableau-0', 'tableau-1')).toBe(false);
    expect(freecell.canDrop(state, ['H8', 'C7'], 'tableau-0', 'tableau-1')).toBe(true);
  });

  it('builds foundations up by suit from the ace', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 1, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('hearts', 2, true)]),
      'foundation-0': pile('foundation-0', 'foundation', []),
    });
    expect(freecell.canDrop(state, ['HA'], 'tableau-0', 'foundation-0')).toBe(true);
    expect(freecell.canDrop(state, ['H2'], 'tableau-1', 'foundation-0')).toBe(false);
  });

  it('moves cards out of cells back to tableau and foundations', () => {
    const state = stateWith({
      'cell-0': pile('cell-0', 'cell', [createCard('hearts', 1, true)]),
      'cell-1': pile('cell-1', 'cell', [createCard('clubs', 6, true)]),
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 7, true)]),
    });
    expect(freecell.canDrop(state, ['HA'], 'cell-0', 'foundation-0')).toBe(true);
    expect(freecell.canDrop(state, ['C6'], 'cell-1', 'tableau-0')).toBe(true);
  });

  it('getLegalMoves covers cells, foundations, and tableau runs', () => {
    const state = stateWith({
      'cell-0': pile('cell-0', 'cell', [createCard('hearts', 1, true)]),
      'tableau-0': pile('tableau-0', 'tableau', [createCard('spades', 7, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('hearts', 8, true)]),
    });
    const moves = freecell.getLegalMoves(state);
    expect(moves.some((m) => m.from === 'cell-0' && m.to === 'foundation-0')).toBe(true);
    expect(moves.some((m) => m.from === 'tableau-0' && m.to === 'tableau-1')).toBe(true);
    expect(moves.some((m) => m.from === 'tableau-0' && m.to.startsWith('cell-'))).toBe(true);
  });

  it('autoMoveTarget prefers foundation, then occupied tableau, then cell', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 1, true)]),
      'tableau-1': pile('tableau-1', 'tableau', [
        createCard('spades', 9, true),
        createCard('hearts', 4, true),
      ]),
      'tableau-2': pile('tableau-2', 'tableau', [createCard('clubs', 5, true)]),
      'tableau-4': pile('tableau-4', 'tableau', [createCard('diamonds', 9, true)]),
    });
    expect(freecell.autoMoveTarget(state, 'HA')).toBe('foundation-0');
    expect(freecell.autoMoveTarget(state, 'H4')).toBe('tableau-2');
    // No occupied destination for D9 → first empty column.
    expect(freecell.autoMoveTarget(state, 'D9')).toBe('tableau-3');
  });

  it('isWon when all four foundations are complete', () => {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    const overrides: Record<string, Pile> = {};
    suits.forEach((suit, i) => {
      overrides[`foundation-${i}`] = pile(
        `foundation-${i}`,
        'foundation',
        Array.from({ length: 13 }, (_, r) => createCard(suit, (r + 1) as 1, true)),
      );
    });
    expect(freecell.isWon(stateWith(overrides))).toBe(true);
    expect(freecell.isWon(stateWith({}))).toBe(false);
  });

  it('applyMove + undo round-trips a cell move', () => {
    const game = newGame({ seed: 'abc12345', variant: freecell });
    const source = game.piles['tableau-0'];
    const top = source.cards[source.cards.length - 1];

    const next = applyMove(game, 'tableau-0', 'cell-0', [top.id], Date.now(), freecell);
    expect(next.piles['cell-0'].cards.map((c) => c.id)).toEqual([top.id]);
    expect(next.piles['tableau-0'].cards).toHaveLength(6);

    const reverted = undo(next);
    expect(reverted.piles['cell-0'].cards).toHaveLength(0);
    expect(reverted.piles['tableau-0'].cards).toHaveLength(7);
  });
});

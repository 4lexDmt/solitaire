import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import {
  applyMove,
  autoFlip,
  cloneState,
  draw,
  newGame,
  recycle,
  redo,
  resolveGameStatus,
  undo,
} from '../reducer';
import { klondike } from '../variants/klondike';
import type { GameState, Pile } from '../types';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function scriptedState(): GameState {
  return {
    variantId: 'klondike',
    seed: 'script',
    drawCount: 1,
    scoreMode: 'standard',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: {
      stock: pile('stock', 'stock', [createCard('clubs', 3, false), createCard('diamonds', 4, false)]),
      waste: pile('waste', 'waste', []),
      'foundation-0': pile('foundation-0', 'foundation', []),
      'foundation-1': pile('foundation-1', 'foundation', []),
      'foundation-2': pile('foundation-2', 'foundation', []),
      'foundation-3': pile('foundation-3', 'foundation', []),
      'tableau-0': pile('tableau-0', 'tableau', [
        createCard('spades', 2, false),
        createCard('hearts', 1, true),
      ]),
      'tableau-1': pile('tableau-1', 'tableau', [createCard('spades', 3, true)]),
      'tableau-2': pile('tableau-2', 'tableau', []),
      'tableau-3': pile('tableau-3', 'tableau', []),
      'tableau-4': pile('tableau-4', 'tableau', []),
      'tableau-5': pile('tableau-5', 'tableau', []),
      'tableau-6': pile('tableau-6', 'tableau', []),
    },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('reducer', () => {
  it('applyMove moves cards and flips exposed tableau card', () => {
    let state = scriptedState();
    state = applyMove(state, 'tableau-0', 'foundation-0', ['HA'], 1000);
    expect(state.piles['foundation-0'].cards.map((c) => c.id)).toEqual(['HA']);
    expect(state.piles['tableau-0'].cards.at(-1)?.faceUp).toBe(true);
    expect(state.piles['tableau-0'].cards.at(-1)?.id).toBe('S2');
    expect(state.history[0].flipped).toEqual({ pileId: 'tableau-0', cardId: 'S2' });
    expect(state.score).toBe(15); // +10 foundation +5 flip
  });

  it('autoFlip exposes face-down top card', () => {
    const piles = {
      'tableau-0': pile('tableau-0', 'tableau', [createCard('spades', 2, false)]),
    };
    const flipped = autoFlip(piles, 'tableau-0');
    expect(flipped).toEqual({ pileId: 'tableau-0', cardId: 'S2' });
    expect(piles['tableau-0'].cards.at(-1)?.faceUp).toBe(true);
  });

  it('draw moves cards from stock to waste face-up', () => {
    let state = scriptedState();
    state = draw(state, 2000);
    expect(state.piles.stock.cards).toHaveLength(1);
    expect(state.piles.waste.cards).toHaveLength(1);
    expect(state.piles.waste.cards[0].faceUp).toBe(true);
    expect(state.history[0].drew).toBe(1);
  });

  it('recycle moves waste to stock face-down reversed', () => {
    let state = scriptedState();
    state = draw(state, 1);
    state = draw(state, 2);
    expect(state.piles.stock.cards).toHaveLength(0);
    state = recycle(state, 3);
    expect(state.piles.waste.cards).toHaveLength(0);
    expect(state.piles.stock.cards).toHaveLength(2);
    expect(state.piles.stock.cards.every((c) => !c.faceUp)).toBe(true);
    expect(state.history.at(-1)?.recycled).toBe(true);
  });

  it('undo/redo round-trip restores card moves', () => {
    let state = scriptedState();
    const before = cloneState(state);
    state = applyMove(state, 'tableau-0', 'foundation-0', ['HA'], 100);
    const afterMove = cloneState(state);
    state = undo(state);
    expect(state.piles).toEqual(before.piles);
    expect(state.score).toBe(0);
    state = redo(state);
    expect(state.piles['foundation-0'].cards.map((c) => c.id)).toEqual(
      afterMove.piles['foundation-0'].cards.map((c) => c.id),
    );
    expect(state.score).toBe(afterMove.score);
  });

  it('undo/redo round-trip restores draw', () => {
    let state = scriptedState();
    const before = cloneState(state);
    state = draw(state, 50);
    state = undo(state);
    expect(state.piles.stock.cards.length).toBe(before.piles.stock.cards.length);
    expect(state.piles.waste.cards.length).toBe(0);
    state = redo(state);
    expect(state.piles.waste.cards).toHaveLength(1);
  });

  it('undo/redo round-trip restores recycle', () => {
    let state = scriptedState();
    state = draw(state, 1);
    state = draw(state, 2);
    state = recycle(state, 3);
    const afterRecycle = cloneState(state);
    state = undo(state);
    expect(state.piles.waste.cards.length).toBeGreaterThan(0);
    expect(state.piles.stock.cards).toHaveLength(0);
    state = redo(state);
    expect(state.piles.stock.cards.length).toBe(afterRecycle.piles.stock.cards.length);
    expect(state.piles.waste.cards).toHaveLength(0);
  });

  it('rejects illegal moves without mutation', () => {
    const state = scriptedState();
    // S3 onto HA is illegal (rank must be one lower than destination top)
    const next = applyMove(state, 'tableau-1', 'tableau-0', ['S3'], 1);
    expect(next).toEqual(state);
  });

  it('newGame applies vegas buy-in', () => {
    expect(newGame({ seed: 'x', scoreMode: 'vegas' }).score).toBe(-52);
  });

  it('marks game lost when no legal moves remain', () => {
    let state = scriptedState();
    state.piles.stock = pile('stock', 'stock', []);
    state.piles.waste = pile('waste', 'waste', []);
    for (let i = 0; i < 4; i++) {
      state.piles[`foundation-${i}`].cards = [];
    }
    state.piles['tableau-0'] = pile('tableau-0', 'tableau', [createCard('hearts', 13, true)]);
    state.piles['tableau-1'] = pile('tableau-1', 'tableau', [createCard('diamonds', 13, true)]);
    state.piles['tableau-2'] = pile('tableau-2', 'tableau', [createCard('clubs', 13, true)]);
    state.piles['tableau-3'] = pile('tableau-3', 'tableau', [createCard('spades', 13, true)]);
    state.piles['tableau-4'] = pile('tableau-4', 'tableau', [
      createCard('hearts', 12, false),
      createCard('spades', 13, true),
    ]);
    state.piles['tableau-5'] = pile('tableau-5', 'tableau', [
      createCard('diamonds', 12, false),
      createCard('clubs', 13, true),
    ]);
    state.piles['tableau-6'] = pile('tableau-6', 'tableau', [
      createCard('clubs', 12, false),
      createCard('diamonds', 13, true),
    ]);
    expect(klondike.getLegalMoves(state)).toHaveLength(0);
    state = resolveGameStatus(state);
    expect(state.status).toBe('lost');
  });

  it('blocks undo after win', () => {
    let state = scriptedState();
    state.status = 'won';
    state.history = [
      {
        from: 'tableau-0',
        to: 'foundation-0',
        cardIds: ['HA'],
        scoreDelta: 10,
        ts: 1,
      },
    ];
    const undone = undo(state);
    expect(undone).toBe(state);
  });
});

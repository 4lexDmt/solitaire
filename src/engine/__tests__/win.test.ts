import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { applyMove, newGame } from '../reducer';
import type { GameState, Pile } from '../types';
import { klondike } from '../variants/klondike';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

/** Minimal scripted board: move all aces then build up each suit to win. */
function nearWinState(): GameState {
  const foundations = {
    'foundation-0': pile('foundation-0', 'foundation', [
      createCard('hearts', 1, true),
      createCard('hearts', 2, true),
      createCard('hearts', 3, true),
      createCard('hearts', 4, true),
      createCard('hearts', 5, true),
      createCard('hearts', 6, true),
      createCard('hearts', 7, true),
      createCard('hearts', 8, true),
      createCard('hearts', 9, true),
      createCard('hearts', 10, true),
      createCard('hearts', 11, true),
      createCard('hearts', 12, true),
    ]),
    'foundation-1': pile('foundation-1', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('diamonds', (i + 1) as 1, true))),
    'foundation-2': pile('foundation-2', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('clubs', (i + 1) as 1, true))),
    'foundation-3': pile('foundation-3', 'foundation', Array.from({ length: 13 }, (_, i) => createCard('spades', (i + 1) as 1, true))),
  };

  return {
    variantId: 'klondike',
    seed: 'win-script',
    drawCount: 1,
    scoreMode: 'none',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: {
      stock: pile('stock', 'stock', []),
      waste: pile('waste', 'waste', []),
      ...foundations,
      'tableau-0': pile('tableau-0', 'tableau', [createCard('hearts', 13, true)]),
      'tableau-1': pile('tableau-1', 'tableau', []),
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

describe('scripted win', () => {
  it('detects win after final king to foundation', () => {
    let state = nearWinState();
    expect(klondike.isWon(state)).toBe(false);

    state = applyMove(state, 'tableau-0', 'foundation-0', ['HK'], 1);
    expect(klondike.isWon(state)).toBe(true);
    expect(state.status).toBe('won');
    expect(state.piles['foundation-0'].cards.at(-1)?.rank).toBe(13);
  });

  it('new game starts playable with correct pile ids', () => {
    const state = newGame({ seed: 'replay-me', drawCount: 3 });
    expect(state.variantId).toBe('klondike');
    expect(state.piles.stock.id).toBe('stock');
    expect(state.piles['tableau-6'].cards.length).toBe(7);
    expect(state.piles['tableau-6'].cards.at(-1)?.faceUp).toBe(true);
    expect(state.piles['tableau-6'].cards.slice(0, -1).every((c) => !c.faceUp)).toBe(true);
  });
});

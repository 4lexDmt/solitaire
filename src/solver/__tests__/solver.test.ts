import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCard } from '@/engine/deck';
import { newGame } from '@/engine/reducer';
import type { GameState } from '@/engine/types';
import { klondike } from '@/engine/variants/klondike';
import { exactStateKey, solve, visibleStateKey } from '@/solver/solver';

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const DATA_DIR = join(process.cwd(), 'public/data');

function readPoolSeed(drawCount: 1 | 3, index = 0): string {
  const raw = readFileSync(join(DATA_DIR, `winnable-draw${drawCount}.json`), 'utf8');
  const pool = JSON.parse(raw) as { seeds: string[] };
  return pool.seeds[index] ?? pool.seeds[0];
}

function readDeadSeed(drawCount: 1 | 3): string {
  try {
    const raw = readFileSync(join(DATA_DIR, `unwinnable-draw${drawCount}.json`), 'utf8');
    const data = JSON.parse(raw) as { seed: string };
    return data.seed;
  } catch {
    return 'pool-1-dead-0000';
  }
}

export const KNOWN_WINNABLE_DRAW1 = readPoolSeed(1);
export const KNOWN_WINNABLE_DRAW3 = readPoolSeed(3);
export const KNOWN_UNWINNABLE_DRAW1 = readDeadSeed(1);

function wonFixture(): GameState {
  const state = newGame({ seed: 'solver-won-fixture', drawCount: 1, scoreMode: 'none' });
  state.piles.stock.cards = [];
  state.piles.waste.cards = [];
  for (let i = 0; i < 7; i++) {
    state.piles[`tableau-${i}`].cards = [];
  }
  for (let f = 0; f < 4; f++) {
    const suit = SUITS[f];
    state.piles[`foundation-${f}`].cards = Array.from({ length: 13 }, (_, i) =>
      createCard(suit, (i + 1) as 1, true),
    );
  }
  state.status = 'won';
  return state;
}

/** No legal moves, aces unreachable — proven stalemate. */
function stalemateFixture(): GameState {
  const state = newGame({ seed: 'solver-stalemate', drawCount: 1, scoreMode: 'none' });
  state.piles.stock.cards = [];
  state.piles.waste.cards = [];
  for (let i = 0; i < 4; i++) {
    state.piles[`foundation-${i}`].cards = [];
  }
  for (let i = 0; i < 7; i++) {
    state.piles[`tableau-${i}`].cards = [];
  }

  state.piles['tableau-0'].cards = [createCard('hearts', 13, true)];
  state.piles['tableau-1'].cards = [createCard('diamonds', 13, true)];
  state.piles['tableau-2'].cards = [createCard('clubs', 13, true)];
  state.piles['tableau-3'].cards = [createCard('spades', 13, true)];
  state.piles['tableau-4'].cards = [createCard('hearts', 12, false), createCard('spades', 13, true)];
  state.piles['tableau-5'].cards = [createCard('diamonds', 12, false), createCard('clubs', 13, true)];
  state.piles['tableau-6'].cards = [createCard('clubs', 12, false), createCard('diamonds', 13, true)];

  return state;
}

describe('solver', () => {
  it('detects an already-won state', () => {
    const result = solve({ state: wonFixture(), maxNodes: 1000, maxTimeMs: 1000 });
    expect(result.solvable).toBe(true);
    expect(result.nodesVisited).toBe(0);
    expect(klondike.isWon(wonFixture())).toBe(true);
  });

  it('reports unwinnable for stalemate fixture', () => {
    const fixture = stalemateFixture();
    expect(klondike.getLegalMoves(fixture).filter((m) => !m.drew && !m.recycled)).toHaveLength(0);
    const result = solve({ state: fixture, maxNodes: 10_000, maxTimeMs: 3000 });
    expect(result.solvable).toBe(false);
    expect(result.timedOut).toBe(false);
    expect(result.reason).toBe('exhausted');
  });

  it('produces stable state keys', () => {
    const state = newGame({ seed: 'key-test', drawCount: 1, scoreMode: 'none' });
    expect(exactStateKey(state)).toBe(exactStateKey(state));
    expect(visibleStateKey(state)).toBe(visibleStateKey(state));
  });

  it('verifies known winnable pool seeds', () => {
    const draw1 = solve({
      seed: KNOWN_WINNABLE_DRAW1,
      drawCount: 1,
      maxNodes: 600_000,
      maxTimeMs: 20_000,
    });
    const draw3 = solve({
      seed: KNOWN_WINNABLE_DRAW3,
      drawCount: 3,
      maxNodes: 600_000,
      maxTimeMs: 20_000,
    });
    expect(draw1.solvable).toBe(true);
    expect(draw3.solvable).toBe(true);
  });

  it('verifies known unwinnable seed', () => {
    const result = solve({
      seed: KNOWN_UNWINNABLE_DRAW1,
      drawCount: 1,
      maxNodes: 600_000,
      maxTimeMs: 20_000,
    });
    expect(result.solvable).toBe(false);
    expect(result.timedOut).toBe(false);
  });
});

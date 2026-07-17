import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { applyMove, newGame } from '../reducer';
import type { GameState, Pile, Rank } from '../types';
import { yukon } from '../variants/yukon';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function stateWith(overrides: Record<string, Pile>): GameState {
  const bases: Record<string, Pile> = {};
  for (let i = 0; i < 4; i++) bases[`foundation-${i}`] = pile(`foundation-${i}`, 'foundation', []);
  for (let i = 0; i < 7; i++) bases[`tableau-${i}`] = pile(`tableau-${i}`, 'tableau', []);
  return {
    variantId: 'yukon',
    seed: 'test',
    drawCount: 1,
    scoreMode: 'standard',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: { ...bases, ...overrides },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('yukon deal', () => {
  it('deals all 52 cards with classic face-down / face-up counts and no stock', () => {
    const game = newGame({ seed: 'yukon-1', variant: yukon });
    const ids = Object.values(game.piles).flatMap((p) => p.cards.map((c) => c.id));
    expect(ids).toHaveLength(52);
    expect(new Set(ids).size).toBe(52);
    expect(game.piles.stock).toBeUndefined();
    expect(game.piles.waste).toBeUndefined();

    expect(game.piles['tableau-0'].cards).toHaveLength(1);
    expect(game.piles['tableau-0'].cards[0].faceUp).toBe(true);

    for (let col = 1; col < 7; col++) {
      const cards = game.piles[`tableau-${col}`].cards;
      expect(cards).toHaveLength(col + 5);
      expect(cards.slice(0, col).every((c) => !c.faceUp)).toBe(true);
      expect(cards.slice(col).every((c) => c.faceUp)).toBe(true);
    }
  });
});

describe('yukon rules', () => {
  it('moves a non-built face-up stack when the bottom card fits', () => {
    // Broken sequence 9♥-5♣-2♦ can still move onto 10♠
    const nine = createCard('hearts', 9, true);
    const five = createCard('clubs', 5, true);
    const two = createCard('diamonds', 2, true);
    const ten = createCard('spades', 10, true);
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [nine, five, two]),
      'tableau-1': pile('tableau-1', 'tableau', [ten]),
    });

    expect(yukon.getMovableRun(state, state.piles['tableau-0'], nine.id)).toHaveLength(3);
    expect(yukon.canDrop(state, [nine.id, five.id, two.id], 'tableau-0', 'tableau-1')).toBe(true);

    const next = applyMove(state, 'tableau-0', 'tableau-1', [nine.id, five.id, two.id], 1, yukon);
    expect(next.piles['tableau-0'].cards).toHaveLength(0);
    expect(next.piles['tableau-1'].cards.map((c) => c.id)).toEqual([
      ten.id,
      nine.id,
      five.id,
      two.id,
    ]);
  });

  it('rejects tableau drops that do not fit the moving card', () => {
    const nine = createCard('hearts', 9, true);
    const eight = createCard('hearts', 8, true);
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [nine]),
      'tableau-1': pile('tableau-1', 'tableau', [eight]),
    });
    expect(yukon.canDrop(state, [nine.id], 'tableau-0', 'tableau-1')).toBe(false);
  });

  it('builds foundations Ace→King by suit and detects a win', () => {
    const ace = createCard('hearts', 1, true);
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [ace]),
    });
    expect(yukon.canDrop(state, [ace.id], 'tableau-0', 'foundation-0')).toBe(true);

    const foundations: Record<string, Pile> = {};
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
    for (let i = 0; i < 4; i++) {
      foundations[`foundation-${i}`] = pile(
        `foundation-${i}`,
        'foundation',
        Array.from({ length: 13 }, (_, r) =>
          createCard(suits[i], (r + 1) as Rank, true),
        ),
      );
    }
    const won = stateWith(foundations);
    expect(yukon.isWon(won)).toBe(true);
  });
});

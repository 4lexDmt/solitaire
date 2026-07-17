import { describe, expect, it } from 'vitest';
import { buildDeck, buildSpiderDeck } from '../deck';
import { newGame } from '../reducer';
import { createRng, shuffle } from '../rng';
import { freecell } from '../variants/freecell';
import { klondike } from '../variants/klondike';
import { pyramid } from '../variants/pyramid';
import { slotId } from '../variants/slotLayout';
import { spider } from '../variants/spider';
import { tripeaks } from '../variants/tripeaks';

function allCardIds(piles: Record<string, { cards: { id: string }[] }>): string[] {
  return Object.values(piles).flatMap((p) => p.cards.map((c) => c.id));
}

describe('deal integrity — shuffle preserves the deck', () => {
  it('Fisher-Yates shuffle keeps every card exactly once', () => {
    const deck = buildDeck();
    const ids = deck.map((c) => c.id).sort();
    for (const seed of ['a', 'b', 'pool-1-0001', 'klondike-20240618', 'xxxxxxxx']) {
      const shuffled = shuffle(deck, createRng(seed)).map((c) => c.id).sort();
      expect(shuffled).toEqual(ids);
    }
  });

  it('different seeds almost always produce different orders', () => {
    const a = shuffle(buildDeck(), createRng('seed-one')).map((c) => c.id).join(',');
    const b = shuffle(buildDeck(), createRng('seed-two')).map((c) => c.id).join(',');
    expect(a).not.toEqual(b);
  });
});

describe('klondike deal integrity', () => {
  it('deals every card once with classic column sizes and face-up tops', () => {
    for (const seed of ['abc12345', 'klondike-20240618', 'zz9k2m1q', 'pool-1-0042']) {
      const game = newGame({ seed, variant: klondike });
      const ids = allCardIds(game.piles);
      expect(ids).toHaveLength(52);
      expect(new Set(ids).size).toBe(52);

      for (let col = 0; col < 7; col++) {
        const cards = game.piles[`tableau-${col}`].cards;
        expect(cards).toHaveLength(col + 1);
        expect(cards[cards.length - 1].faceUp).toBe(true);
        expect(cards.slice(0, -1).every((c) => !c.faceUp)).toBe(true);
      }

      expect(game.piles.stock.cards).toHaveLength(24);
      expect(game.piles.stock.cards.every((c) => !c.faceUp)).toBe(true);
      expect(game.piles.waste.cards).toHaveLength(0);
      for (let i = 0; i < 4; i++) {
        expect(game.piles[`foundation-${i}`].cards).toHaveLength(0);
      }
    }
  });

  it('same seed always produces the same deal', () => {
    const a = newGame({ seed: 'determinism-check', variant: klondike });
    const b = newGame({ seed: 'determinism-check', variant: klondike });
    expect(allCardIds(a.piles)).toEqual(allCardIds(b.piles));
    for (let i = 0; i < 7; i++) {
      expect(a.piles[`tableau-${i}`].cards.map((c) => `${c.id}:${c.faceUp}`)).toEqual(
        b.piles[`tableau-${i}`].cards.map((c) => `${c.id}:${c.faceUp}`),
      );
    }
  });
});

describe('freecell deal integrity', () => {
  it('deals every card once, all face-up, classic 7/7/7/7/6/6/6/6 layout', () => {
    const game = newGame({ seed: 'fc-deal-1', variant: freecell });
    const ids = allCardIds(game.piles);
    expect(ids).toHaveLength(52);
    expect(new Set(ids).size).toBe(52);
    for (let i = 0; i < 8; i++) {
      const cards = game.piles[`tableau-${i}`].cards;
      expect(cards).toHaveLength(i < 4 ? 7 : 6);
      expect(cards.every((c) => c.faceUp)).toBe(true);
    }
  });
});

describe('pyramid & tripeaks deal integrity', () => {
  it('pyramid deals 28 unique face-up slots + 24 stock', () => {
    const game = newGame({ seed: 'pyr-int', variant: pyramid, drawCount: 1 });
    const ids = allCardIds(game.piles);
    expect(ids).toHaveLength(52);
    expect(new Set(ids).size).toBe(52);
    for (let i = 0; i < 28; i++) {
      expect(game.piles[slotId(i)].cards).toHaveLength(1);
    }
    expect(game.piles.stock.cards).toHaveLength(24);
  });

  it('tripeaks deals 28 unique face-up slots + 24 stock', () => {
    const game = newGame({ seed: 'tp-int', variant: tripeaks, drawCount: 1 });
    const ids = allCardIds(game.piles);
    expect(ids).toHaveLength(52);
    expect(new Set(ids).size).toBe(52);
    expect(game.piles.stock.cards).toHaveLength(24);
  });
});

describe('spider deal integrity', () => {
  it('deals every card once for 1/2/4-suit decks', () => {
    for (const suits of [1, 2, 4] as const) {
      const game = newGame({ seed: `sp-${suits}`, variant: spider, spiderSuits: suits });
      const ids = allCardIds(game.piles);
      expect(ids).toHaveLength(104);
      expect(new Set(ids).size).toBe(104);
      expect(ids.sort()).toEqual(buildSpiderDeck(suits).map((c) => c.id).sort());

      let tableauTotal = 0;
      for (let i = 0; i < 10; i++) {
        const cards = game.piles[`tableau-${i}`].cards;
        expect(cards).toHaveLength(i < 4 ? 6 : 5);
        tableauTotal += cards.length;
        expect(cards[cards.length - 1].faceUp).toBe(true);
        expect(cards.slice(0, -1).every((c) => !c.faceUp)).toBe(true);
      }
      expect(tableauTotal).toBe(54);
      expect(game.piles.stock.cards).toHaveLength(50);
    }
  });
});

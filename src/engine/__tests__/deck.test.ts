import { describe, expect, it } from 'vitest';
import { buildDeck, cardId, createCard, suitColor } from '../deck';

describe('buildDeck', () => {
  it('creates exactly 52 unique cards', () => {
    const deck = buildDeck();
    expect(deck).toHaveLength(52);
    const ids = new Set(deck.map((c) => c.id));
    expect(ids.size).toBe(52);
  });

  it('assigns stable ids per spec examples', () => {
    expect(cardId('hearts', 7)).toBe('H7');
    expect(cardId('spades', 13)).toBe('SK');
    expect(cardId('diamonds', 1)).toBe('DA');
    expect(cardId('clubs', 11)).toBe('CJ');
  });

  it('derives color from suit', () => {
    expect(suitColor('hearts')).toBe('red');
    expect(suitColor('diamonds')).toBe('red');
    expect(suitColor('clubs')).toBe('black');
    expect(suitColor('spades')).toBe('black');
    expect(createCard('hearts', 1).color).toBe('red');
    expect(createCard('clubs', 13).color).toBe('black');
  });

  it('starts all cards face-down', () => {
    expect(buildDeck().every((c) => c.faceUp === false)).toBe(true);
  });

  it('contains every suit/rank combination once', () => {
    const deck = buildDeck();
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'] as const;
    for (const suit of suits) {
      for (let rank = 1; rank <= 13; rank++) {
        const matches = deck.filter((c) => c.suit === suit && c.rank === rank);
        expect(matches).toHaveLength(1);
      }
    }
  });
});

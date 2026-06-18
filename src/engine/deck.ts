import type { Card, Color, Rank, Suit } from './types';

const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

const SUIT_CODES: Record<Suit, string> = {
  clubs: 'C',
  diamonds: 'D',
  hearts: 'H',
  spades: 'S',
};

const RANK_CODES: Record<Rank, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export function suitColor(suit: Suit): Color {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function cardId(suit: Suit, rank: Rank): string {
  return `${SUIT_CODES[suit]}${RANK_CODES[rank]}`;
}

export function createCard(suit: Suit, rank: Rank, faceUp = false): Card {
  return {
    id: cardId(suit, rank),
    suit,
    rank,
    color: suitColor(suit),
    faceUp,
  };
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1 as Rank; rank <= 13; rank++) {
      deck.push(createCard(suit, rank as Rank, false));
    }
  }
  return deck;
}

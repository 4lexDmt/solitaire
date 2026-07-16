'use client';

import type { Card, Suit } from '@/engine/types';

const RANK_STR: Record<number, string> = {
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

const SUIT_CHAR: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

/** Classic Win9x-style face: corner index + center suit. */
export function ClassicCardFace({ card }: { card: Card }) {
  const color = isRed(card.suit)
    ? `var(--ink-suit-${card.suit})`
    : `var(--ink-suit-${card.suit})`;
  const rank = RANK_STR[card.rank] ?? String(card.rank);
  const suit = SUIT_CHAR[card.suit];

  return (
    <div className="classic-face" style={{ color }} aria-hidden>
      <span className="classic-face__corner classic-face__corner--tl">
        {rank}
        <br />
        {suit}
      </span>
      <span className="classic-face__center">{suit}</span>
      <span className="classic-face__corner classic-face__corner--br">
        {rank}
        <br />
        {suit}
      </span>
    </div>
  );
}

export function ClassicCardBack() {
  return <div className="classic-back" aria-hidden />;
}

export { RANK_STR, SUIT_CHAR, isRed };

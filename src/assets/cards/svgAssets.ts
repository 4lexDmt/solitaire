import type { Card } from '@/engine/types';

/** deck-of-cards SVG naming: {suitIndex}_{rank}.svg — 0♠ 1♥ 2♣ 3♦ */
const SUIT_INDEX: Record<Card['suit'], number> = {
  spades: 0,
  hearts: 1,
  clubs: 2,
  diamonds: 3,
};

export function cardSvgFilename(card: Card): string {
  return `${SUIT_INDEX[card.suit]}_${card.rank}.svg`;
}

export function cardSvgUrl(card: Card): string {
  return `/cards/${cardSvgFilename(card)}`;
}

/** Inline sprite sheet symbols for win cascade (§11.1 optional perf path). */
export function cardSpriteId(card: Card): string {
  return `card-${card.suit}-${card.rank}`;
}

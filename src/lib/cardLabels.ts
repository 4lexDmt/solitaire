import type { Card } from "@/engine/types";

const SUIT_NAMES: Record<Card["suit"], string> = {
  clubs: "Clubs",
  diamonds: "Diamonds",
  hearts: "Hearts",
  spades: "Spades",
};

const RANK_NAMES: Record<Card["rank"], string> = {
  1: "Ace",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Jack",
  12: "Queen",
  13: "King",
};

export function cardAriaLabel(card: Card): string {
  const rank = RANK_NAMES[card.rank];
  const suit = SUIT_NAMES[card.suit];
  const face = card.faceUp ? "face up" : "face down";
  return `${rank} of ${suit}, ${face}`;
}

export function rankGlyph(rank: Card["rank"]): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

import { GEOMETRY, Z } from "@/config/tokens";
import type { Card } from "@/engine/types";

/** Resolved card width from viewport — SPEC §6 formula. */
export function resolveCardWidth(
  viewportWidth: number,
  variantId = "klondike",
): number {
  const divisor =
    GEOMETRY.cardWidthDivisors[variantId] ?? GEOMETRY.cardWidthDivisor;
  const raw = viewportWidth / divisor;
  return Math.min(
    GEOMETRY.cardWidthMax,
    Math.max(GEOMETRY.cardWidthMin, raw),
  );
}

export function resolveCardHeight(cardWidth: number): number {
  return cardWidth * GEOMETRY.heightMultiplier;
}

export function resolveBoardPad(cardWidth: number): number {
  return cardWidth * GEOMETRY.boardPadRatio;
}

export function resolveGapX(cardWidth: number): number {
  return cardWidth * GEOMETRY.gapRatio;
}

export function resolveRowGap(cardHeight: number): number {
  return cardHeight * GEOMETRY.rowGapRatio;
}

/** Vertical offset between stacked tableau cards — SPEC §6. */
export function tableauOverlap(faceUp: boolean, cardHeight: number): number {
  const ratio = faceUp
    ? GEOMETRY.overlapFaceupRatio
    : GEOMETRY.overlapFacedownRatio;
  return cardHeight * ratio;
}

/** Horizontal fan offset for waste pile — SPEC §6. */
export function wasteFanOffset(cardWidth: number): number {
  return cardWidth * GEOMETRY.wasteFanRatio;
}

/** Resting card z-index: base layer + depth in pile — SPEC §7. */
export function cardZIndex(depthIndex: number): number {
  return Z.cardBase + depthIndex;
}

/** Total height of a tableau column given card stack. */
export function tableauColumnHeight(
  cards: { faceUp: boolean }[],
  cardHeight: number,
): number {
  if (cards.length === 0) return cardHeight;
  let height = cardHeight;
  for (let i = 1; i < cards.length; i++) {
    height += tableauOverlap(cards[i - 1].faceUp, cardHeight);
  }
  return height;
}

/** Waste pile container width for fanned visible cards. */
export function wastePileWidth(
  visibleCount: number,
  cardWidth: number,
): number {
  if (visibleCount <= 1) return cardWidth;
  const fan = wasteFanOffset(cardWidth);
  return cardWidth + fan * (Math.min(visibleCount, 3) - 1);
}

export const BOARD_GRID_AREAS = {
  stock: "stock",
  waste: "waste",
  foundations: [
    "foundation-0",
    "foundation-1",
    "foundation-2",
    "foundation-3",
  ] as const,
  tableau: [
    "tableau-0",
    "tableau-1",
    "tableau-2",
    "tableau-3",
    "tableau-4",
    "tableau-5",
    "tableau-6",
  ] as const,
} as const;

/** CSS calc offset for a tableau card using token vars §6 */
export function tableauCardTopStyle(cards: Card[], index: number): string {
  if (index === 0) return "0px";
  const parts: string[] = [];
  for (let i = 1; i <= index; i++) {
    parts.push(
      cards[i - 1].faceUp ? "var(--overlap-faceup)" : "var(--overlap-facedown)",
    );
  }
  return `calc(${parts.join(" + ")})`;
}

/** CSS calc column height for stacked tableau cards */
export function tableauColumnHeightStyle(cards: Card[]): string {
  if (cards.length === 0) return "var(--card-h)";
  const parts: string[] = ["var(--card-h)"];
  for (let i = 1; i < cards.length; i++) {
    parts.push(
      cards[i - 1].faceUp ? "var(--overlap-faceup)" : "var(--overlap-facedown)",
    );
  }
  return `calc(${parts.join(" + ")})`;
}

/** CSS calc horizontal fan for waste cards §6 */
export function wasteCardLeftStyle(visibleIndex: number): string {
  if (visibleIndex === 0) return "0px";
  return `calc(${visibleIndex} * var(--waste-fan))`;
}

export function rankLabel(rank: Card["rank"]): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function cardAriaLabel(card: Card): string {
  const suitNames: Record<Card["suit"], string> = {
    clubs: "Clubs",
    diamonds: "Diamonds",
    hearts: "Hearts",
    spades: "Spades",
  };
  const rankNames: Record<number, string> = {
    1: "Ace",
    11: "Jack",
    12: "Queen",
    13: "King",
  };
  const rank = rankNames[card.rank] ?? String(card.rank);
  const face = card.faceUp ? "face up" : "face down";
  return `${rank} of ${suitNames[card.suit]}, ${face}`;
}

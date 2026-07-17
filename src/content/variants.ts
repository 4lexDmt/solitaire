import type { VariantId } from '@/engine/variants';
import { BRAND } from '@/config/brand';
import { variantLabel } from '@/lib/variantLabel';

export interface VariantSeoContent {
  id: VariantId;
  path: `/${string}`;
  title: string;
  metaTitle: string;
  metaDescription: string;
  headline: string;
  intro: string;
  objective: string;
  setup: string[];
  rules: string[];
  strategy: string[];
  related: { href: string; label: string }[];
}

function relatedFor(id: VariantId): { href: string; label: string }[] {
  const order: VariantId[] = [
    'klondike',
    'freecell',
    'spider',
    'pyramid',
    'tripeaks',
    'yukon',
    'golf',
  ];
  return order
    .filter((v) => v !== id)
    .slice(0, 3)
    .map((v) => ({ href: `/${v === 'klondike' ? 'solitaire' : v}`, label: variantLabel(v) }));
}

export const VARIANT_SEO: Record<VariantId, VariantSeoContent> = {
  klondike: {
    id: 'klondike',
    path: '/solitaire',
    title: 'Solitaire (Klondike)',
    metaTitle: 'Solitaire — Play Free Online | Aevanor',
    metaDescription:
      'Play classic Solitaire free on Aevanor — Draw 1 or Draw 3, undo, hints, daily challenge, winnable deals, offline PWA. Calm, ad-free, Win9x desktop.',
    headline: 'Solitaire',
    intro: `${BRAND.name} is a calm, ad-free Klondike Solitaire: Draw 1 or Draw 3, optional winnable-only deals, and a shared daily challenge you can finish offline.`,
    objective:
      'Move all cards to the four foundations, building each suit from Ace to King.',
    setup: [
      'Deal seven tableau columns left to right: one card in the first column, up to seven in the last. Only the top card of each column starts face up.',
      'The remaining cards form the stock. Turning the stock fills the waste pile (one or three cards at a time).',
      'Four empty foundation piles sit at the top right.',
    ],
    rules: [
      'Build tableau piles down by alternating color (red on black, black on red).',
      'Build foundations up by suit from Ace through King.',
      'Only a King (or a valid King-led run) may fill an empty tableau column.',
      'You may move a face-up run as a unit when the move is legal.',
      'Recycle the waste back into the stock when it is empty (unless a pass limit is set).',
    ],
    strategy: [
      'Prefer moves that flip face-down tableau cards — information beats early foundation play.',
      'Empty a column when you can park a King that unlocks buried cards.',
      'Be careful sending mid-rank cards to the foundation if you still need them as bridges.',
      'Try Draw 1 when learning; switch to Draw 3 for a tougher classic challenge.',
      'Turn on Winnable deals only if you want every shuffle to be solvable with perfect play.',
    ],
    related: relatedFor('klondike'),
  },
  freecell: {
    id: 'freecell',
    path: '/freecell',
    title: 'FreeCell',
    metaTitle: 'FreeCell Solitaire — Play Free Online | Aevanor',
    metaDescription:
      'Play FreeCell free on Aevanor — all cards face up, four free cells, undo, hints, offline PWA. Calm, ad-free.',
    headline: 'FreeCell',
    intro: `FreeCell on ${BRAND.name} deals every card face up. Use the four free cells as temporary holding spots and plan deeper sequences than classic Solitaire.`,
    objective:
      'Build all four foundations by suit from Ace to King using the tableau and free cells.',
    setup: [
      'Deal the entire deck face up into eight tableau columns.',
      'Four free cells start empty — each holds a single card.',
      'Four foundations start empty.',
    ],
    rules: [
      'Build tableau piles down by alternating color.',
      'Move single cards into free cells; empty cells increase how large a sorted run you can move.',
      'Build foundations up by suit from Ace to King.',
      'Any card may fill an empty tableau column (unlike Solitaire’s King-only rule).',
    ],
    strategy: [
      'Keep at least one free cell open whenever you can — mobility is the whole game.',
      'Clear columns early to rearrange awkward stacks.',
      'Send Aces and Twos up quickly once free; delay other foundation moves if the card is still a useful bridge.',
      'Count available free cells before attempting a long cascade move.',
    ],
    related: relatedFor('freecell'),
  },
  spider: {
    id: 'spider',
    path: '/spider',
    title: 'Spider Solitaire',
    metaTitle: 'Spider Solitaire — 1, 2 & 4 Suits Free Online | Aevanor',
    metaDescription:
      'Play Spider Solitaire free on Aevanor — 1, 2, or 4 suits, undo, hints, offline PWA. Calm, ad-free.',
    headline: 'Spider',
    intro: `Spider on ${BRAND.name} uses two decks across ten tableau columns. Choose 1, 2, or 4 suits — easier with fewer suits, deeper planning with four.`,
    objective:
      'Assemble complete King-to-Ace same-suit runs; completed runs leave the tableau until the board is clear.',
    setup: [
      'Deal ten tableau columns (some cards face down).',
      'The remaining cards form the stock; each deal adds one card to every column.',
      'Completed same-suit sequences are removed from play.',
    ],
    rules: [
      'Build down by rank regardless of suit on the tableau.',
      'You may only move a run as a unit when every card in that run is the same suit.',
      'Empty columns may be filled by any card or movable run.',
      'You cannot deal from the stock while any tableau column is empty.',
    ],
    strategy: [
      'Start with 1 suit to learn the flow; move to 2 and 4 suits for more difficulty.',
      'Prefer same-suit builds — only same-suit runs are mobile.',
      'Protect empty columns; they are your main maneuvering space before a stock deal.',
      'Reveal face-down cards before dealing whenever possible.',
    ],
    related: relatedFor('spider'),
  },
  pyramid: {
    id: 'pyramid',
    path: '/pyramid',
    title: 'Pyramid Solitaire',
    metaTitle: 'Pyramid Solitaire — Play Free Online | Aevanor',
    metaDescription:
      'Play Pyramid Solitaire free on Aevanor — pair cards that sum to 13, undo, hints, offline PWA. Calm, ad-free.',
    headline: 'Pyramid',
    intro: `Pyramid on ${BRAND.name} is a pairing game: clear the pyramid by removing free cards that sum to 13. Kings remove alone.`,
    objective: 'Remove every card from the pyramid (and stock/waste as required by the deal rules).',
    setup: [
      'Deal a pyramid of face-up cards (rows of increasing width).',
      'A card is free when no card overlaps it from below.',
      'The remaining cards form a stock you can turn to the waste.',
    ],
    rules: [
      'Remove two free cards whose ranks sum to 13 (Ace=1 … Queen=12).',
      'Kings (13) remove alone when free.',
      'Jack=11, Queen=12 — pair with 2 and Ace respectively.',
      'Draw from the stock when the pyramid has no legal pair.',
    ],
    strategy: [
      'Clear lower cards that free multiple peaks above them.',
      'Save flexible mid-ranks when two pairing options exist.',
      'Watch the stock carefully — don’t bury a key Ace or King early.',
    ],
    related: relatedFor('pyramid'),
  },
  tripeaks: {
    id: 'tripeaks',
    path: '/tripeaks',
    title: 'TriPeaks Solitaire',
    metaTitle: 'TriPeaks Solitaire — Play Free Online | Aevanor',
    metaDescription:
      'Play TriPeaks Solitaire free on Aevanor — clear three peaks with adjacent ranks, undo, hints, offline PWA. Calm, ad-free.',
    headline: 'TriPeaks',
    intro: `TriPeaks on ${BRAND.name} clears three peaks by playing free cards of adjacent rank onto the waste.`,
    objective: 'Clear all three peaks by playing every tableau card onto the waste pile.',
    setup: [
      'Deal three overlapping peaks of cards; only unblocked cards are free.',
      'Turn the stock to start the waste pile.',
    ],
    rules: [
      'Play a free tableau card onto the waste if it is one rank higher or lower (Ace and King wrap in classic TriPeaks).',
      'A card becomes free when both cards covering it are removed.',
      'If you cannot play, turn the next stock card to the waste.',
    ],
    strategy: [
      'Open as many free cards as possible before burning stock cards.',
      'Prefer sequences that unlock a whole peak.',
      'Plan around wraparound Ace↔King when those cards are free.',
    ],
    related: relatedFor('tripeaks'),
  },
  yukon: {
    id: 'yukon',
    path: '/yukon',
    title: 'Yukon Solitaire',
    metaTitle: 'Yukon Solitaire — Play Free Online | Aevanor',
    metaDescription:
      'Play Yukon Solitaire free on Aevanor — move face-up groups freely, build alternating colors, undo, hints, offline PWA. Calm, ad-free.',
    headline: 'Yukon',
    intro: `Yukon on ${BRAND.name} is like Solitaire without a stock: you may move any face-up card (and the cards on it), even when the group is not a clean alternating run.`,
    objective: 'Build all four foundations by suit from Ace to King.',
    setup: [
      'Deal seven tableau columns with a mix of face-down and face-up cards; there is no stock.',
      'Four foundations start empty.',
    ],
    rules: [
      'Build tableau piles down by alternating color.',
      'You may pick up any face-up card together with everything stacked on it.',
      'Build foundations up by suit from Ace to King.',
      'Empty columns take Kings (or King-led groups), depending on house rules in this build.',
    ],
    strategy: [
      'Expose face-down cards early — information is everything without a stock.',
      'Use messy face-up stacks as temporary parking to unlock buried cards.',
      'Don’t rush foundations if a card still bridges the tableau.',
    ],
    related: relatedFor('yukon'),
  },
  golf: {
    id: 'golf',
    path: '/golf',
    title: 'Golf Solitaire',
    metaTitle: 'Golf Solitaire — Play Free Online | Aevanor',
    metaDescription:
      'Play Golf Solitaire free on Aevanor — play adjacent ranks from the tableau onto the waste, undo, hints, offline PWA. Calm, ad-free.',
    headline: 'Golf',
    intro: `Golf on ${BRAND.name} is a fast tableau clearer: play the top card of any column onto the waste when it is one rank away.`,
    objective: 'Clear as much of the tableau as possible by playing onto the waste (ideally remove every card).',
    setup: [
      'Deal a rectangular tableau of face-up cards in columns.',
      'The remaining cards form a stock; the first waste card starts the chain.',
    ],
    rules: [
      'Play a tableau top onto the waste if it is adjacent in rank (this build does not wrap Ace↔King).',
      'When stuck, turn the next stock card to the waste.',
      'Only the top card of each column is playable.',
    ],
    strategy: [
      'Scan all seven tops before each play — longer chains beat short greed.',
      'Avoid burying a column that holds a key bridge card.',
      'Save stock turns for when no tableau play exists.',
    ],
    related: relatedFor('golf'),
  },
};

export const VARIANT_SEO_LIST = Object.values(VARIANT_SEO);

/** URL path segment → variant id (klondike also served at /solitaire and /klondike). */
export function variantIdFromPath(segment: string): VariantId | null {
  if (segment === 'solitaire' || segment === 'klondike') return 'klondike';
  if (segment in VARIANT_SEO) return segment as VariantId;
  return null;
}

import type { Card, CompletedRun, GameState, Move, Pile, PileType, ScoreMode } from './types';

export interface BoardLayout {
  piles: { id: string; type: PileType; gridArea: string }[]; // CSS grid placement
  // responsive breakpoints handled in CSS via the tokens in §6
}

export type SpiderSuits = 1 | 2 | 4;

export interface VariantDeckOptions {
  spiderSuits?: SpiderSuits;
}

export interface Variant {
  id: string;
  name: string; // display, e.g. 'Klondike'
  layout: BoardLayout;
  /** Build the deck for this variant (52 cards, or 104 for Spider). */
  createDeck(options?: VariantDeckOptions): Card[];
  deal(deck: Card[], seed: string): Record<string, Pile>;
  getLegalMoves(state: GameState, options?: { skipScoring?: boolean }): Move[]; // used by hints & input validation
  canDrop(state: GameState, cardIds: string[], from: string, to: string): boolean;
  isWon(state: GameState): boolean;
  autoMoveTarget(state: GameState, cardId: string): string | null;
  autoMoveToFoundation(state: GameState, pileId: string, cardId: string): string | null;
  score(move: Move, mode: ScoreMode, state?: GameState): number;
  /** Face-up run starting at cardId that may be picked up as a unit ([] if not movable). */
  getMovableRun(state: GameState, pile: Pile, cardId: string): Card[];
  /** Stock deals one card to every tableau column instead of the waste (Spider). */
  dealsToTableau?: boolean;
  /** Foundations are auto-fill only; cards can never be picked up from them (Spider). */
  foundationsLocked?: boolean;
  /**
   * Rewrite a player move before apply (e.g. Pyramid: dropping onto a pairing
   * free card becomes a dual remove to the discard foundation).
   */
  normalizeMove?(
    state: GameState,
    from: string,
    to: string,
    cardIds: string[],
  ): { from: string; to: string; cardIds: string[]; partner?: Move['partner'] } | null;
  /** Remove any completed K→A same-suit runs to foundations; mutates piles (Spider). */
  settleCompletions?(piles: Record<string, Pile>): CompletedRun[];
}

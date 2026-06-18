import type { Card, GameState, Move, Pile, PileType, ScoreMode } from './types';

export interface BoardLayout {
  piles: { id: string; type: PileType; gridArea: string }[]; // CSS grid placement
  // responsive breakpoints handled in CSS via the tokens in §6
}

export interface Variant {
  id: string;
  name: string; // display, e.g. 'Klondike'
  layout: BoardLayout;
  deal(deck: Card[], seed: string): Record<string, Pile>;
  getLegalMoves(state: GameState, options?: { skipScoring?: boolean }): Move[]; // used by hints & input validation
  canDrop(state: GameState, cardIds: string[], from: string, to: string): boolean;
  isWon(state: GameState): boolean;
  autoMoveTarget(state: GameState, cardId: string): string | null; // double-click destination
  score(move: Move, mode: ScoreMode): number;
}

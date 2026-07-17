export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Color = 'red' | 'black';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; // A=1, J=11, Q=12, K=13

export interface Card {
  id: string; // stable per deck, e.g. 'H7' (hearts 7), 'SK' (spades king)
  suit: Suit;
  rank: Rank;
  color: Color; // derived from suit; cached for convenience
  faceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau' | 'cell' | 'slot';

export interface Pile {
  id: string; // e.g. 'stock' | 'waste' | 'foundation-0'.. | 'tableau-0'.. | 'cell-0'.. | 'slot-0'..
  type: PileType;
  cards: Card[]; // index 0 = bottom of pile
  suit?: Suit; // foundations may be locked to a suit once seeded
}

export type ScoreMode = 'none' | 'standard' | 'vegas';

/** A full K→A same-suit run removed to a foundation as a side effect (Spider). */
export interface CompletedRun {
  from: string; // tableau pile id
  to: string; // foundation pile id
  cardIds: string[]; // the 13 cards, bottom→top (K→A)
  flipped?: { pileId: string; cardId: string }; // card revealed by the removal
}

export interface Move {
  from: string; // pile id
  to: string; // pile id
  cardIds: string[]; // the moved cards, bottom→top (a run can be >1)
  /** Second source removed in the same action (Pyramid pair-to-13). */
  partner?: { from: string; cardIds: string[] };
  flipped?: { pileId: string; cardId: string }; // a card revealed/flipped as a result
  recycled?: boolean; // true for waste→stock recycle
  drew?: number; // for stock→waste draws (1 or 3) or spider tableau deals (10)
  completed?: CompletedRun[]; // spider run completions triggered by this move
  scoreDelta: number;
  ts: number; // epoch ms
}

export interface Selection {
  pileId: string;
  cardId: string;
} // click-to-select source

export type GameStatus = 'idle' | 'dealing' | 'playing' | 'won' | 'lost';

export type StockPassLimit = 'unlimited' | 1 | 3;

export interface GameState {
  variantId: string; // 'klondike' | 'freecell' | 'spider' | 'pyramid' | 'tripeaks'
  seed: string; // reproducible deal seed
  drawCount: 1 | 3;
  spiderSuits?: 1 | 2 | 4; // spider only: number of distinct suits in the 104-card deck
  scoreMode: ScoreMode;
  stockPassLimit: StockPassLimit;
  stockRecycles: number; // waste→stock recycle count this deal
  piles: Record<string, Pile>;
  selection: Selection | null;
  status: GameStatus;
  moves: number;
  score: number;
  elapsedMs: number;
  history: Move[]; // undo stack
  future: Move[]; // redo stack
  hintCardIds?: string[]; // currently highlighted hint
}

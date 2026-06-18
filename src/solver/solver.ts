import { newGame } from '@/engine/reducer';
import type { Card, GameState, Move } from '@/engine/types';
import { klondike } from '@/engine/variants/klondike';

export interface SolverOptions {
  seed?: string;
  state?: GameState;
  drawCount?: 1 | 3;
  maxNodes?: number;
  maxTimeMs?: number;
}

export interface SolverResult {
  solvable: boolean;
  nodesVisited: number;
  timedOut: boolean;
  reason?: 'won' | 'exhausted' | 'budget';
}

export interface SolverRequest {
  seed: string;
  drawCount: 1 | 3;
  maxNodes?: number;
  maxTimeMs?: number;
}

export type SolverResponse = SolverResult;

const DEFAULT_MAX_NODES = 250_000;
const DEFAULT_MAX_TIME_MS = 5_000;

type UndoFn = () => void;

function cloneInitialState(options: SolverOptions): GameState {
  if (options.state) {
    const piles: GameState['piles'] = {};
    for (const [id, pile] of Object.entries(options.state.piles)) {
      piles[id] = { ...pile, cards: pile.cards.map((c) => ({ ...c })) };
    }
    return {
      ...options.state,
      piles,
      history: [],
      future: [],
      selection: null,
      score: 0,
      scoreMode: 'none',
      moves: 0,
      elapsedMs: 0,
      hintCardIds: undefined,
    };
  }

  return newGame({
    seed: options.seed ?? '0',
    drawCount: options.drawCount ?? 3,
    scoreMode: 'none',
  });
}

function applyCardMove(state: GameState, move: Move): UndoFn {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  const startIdx = fromPile.cards.findIndex((c) => c.id === move.cardIds[0]);
  const moving = fromPile.cards.splice(startIdx);

  let flippedCard: Card | undefined;
  let hadFoundationSuit = toPile.suit;

  appendCards(toPile, moving);

  if (toPile.type === 'foundation' && toPile.cards.length === moving.length) {
    toPile.suit = moving[0].suit;
  }

  if (fromPile.type === 'tableau') {
    const top = fromPile.cards[fromPile.cards.length - 1];
    if (top && !top.faceUp) {
      flippedCard = top;
      top.faceUp = true;
    }
  }

  return () => {
    if (flippedCard) {
      flippedCard.faceUp = false;
    }

    const idx = toPile.cards.findIndex((c) => c.id === move.cardIds[0]);
    const cards = toPile.cards.splice(idx);
    fromPile.cards.push(...cards);

    if (toPile.type === 'foundation' && toPile.cards.length === 0) {
      if (hadFoundationSuit === undefined) {
        delete toPile.suit;
      } else {
        toPile.suit = hadFoundationSuit;
      }
    }
  };
}

function appendCards(pile: GameState['piles'][string], cards: Card[]): void {
  pile.cards.push(...cards);
}

function applyDraw(state: GameState, move: Move): UndoFn {
  const drew = move.drew ?? state.drawCount;
  const drawn = state.piles.stock.cards.splice(state.piles.stock.cards.length - drew, drew);
  for (const card of drawn) {
    card.faceUp = true;
  }
  appendCards(state.piles.waste, drawn);

  return () => {
    const removed = state.piles.waste.cards.splice(state.piles.waste.cards.length - drew, drew);
    for (const card of removed) {
      card.faceUp = false;
    }
    appendCards(state.piles.stock, removed);
  };
}

function applyRecycle(state: GameState): UndoFn {
  const wasteCards = state.piles.waste.cards.splice(0);
  wasteCards.reverse();
  for (const card of wasteCards) {
    card.faceUp = false;
  }
  appendCards(state.piles.stock, wasteCards);
  const count = wasteCards.length;

  return () => {
    const restored = state.piles.stock.cards.splice(state.piles.stock.cards.length - count, count);
    restored.reverse();
    for (const card of restored) {
      card.faceUp = true;
    }
    appendCards(state.piles.waste, restored);
  };
}

function applySolverMove(state: GameState, move: Move): UndoFn {
  if (move.recycled) return applyRecycle(state);
  if (move.drew) return applyDraw(state, move);
  return applyCardMove(state, move);
}

function cardRank(state: GameState, cardId: string): number {
  for (const pile of Object.values(state.piles)) {
    const card = pile.cards.find((c) => c.id === cardId);
    if (card) return card.rank;
  }
  return 0;
}

/** Compact key for exact position (includes stock order). */
export function exactStateKey(state: GameState): string {
  const parts: string[] = [`d${state.drawCount}`];

  for (let i = 0; i < 4; i++) {
    const pile = state.piles[`foundation-${i}`];
    const top = pile.cards[pile.cards.length - 1];
    parts.push(String(top?.rank ?? 0));
  }

  for (let i = 0; i < 7; i++) {
    const pile = state.piles[`tableau-${i}`];
    parts.push(`${pile.cards.filter((c) => !c.faceUp).length}:`);
    for (const card of pile.cards) {
      if (card.faceUp) parts.push(card.id);
    }
    parts.push('|');
  }

  parts.push(`S${state.piles.stock.cards.map((c) => c.id).join(',')}`);
  parts.push(`W${state.piles.waste.cards.map((c) => c.id).join(',')}`);
  return parts.join('');
}

/** Visible position key for dominance pruning (tableau + foundations + waste). */
export function visibleStateKey(state: GameState): string {
  const parts: string[] = [`d${state.drawCount}`];

  for (let i = 0; i < 4; i++) {
    const pile = state.piles[`foundation-${i}`];
    const top = pile.cards[pile.cards.length - 1];
    parts.push(String(top?.rank ?? 0));
  }

  for (let i = 0; i < 7; i++) {
    const pile = state.piles[`tableau-${i}`];
    parts.push(`${pile.cards.filter((c) => !c.faceUp).length}:`);
    for (const card of pile.cards) {
      if (card.faceUp) parts.push(card.id);
    }
    parts.push('|');
  }

  parts.push(`W${state.piles.waste.cards.map((c) => c.id).join(',')}`);
  return parts.join('');
}

function shouldDeprioritizeWorryBack(_state: GameState, move: Move): boolean {
  return move.from.startsWith('foundation-') && move.to.startsWith('tableau-');
}

function scoreMove(state: GameState, move: Move): number {
  if (move.to.startsWith('foundation-')) {
    const rank = cardRank(state, move.cardIds[0]);
    return 400 + (14 - rank);
  }

  if (move.from.startsWith('foundation-') && move.to.startsWith('tableau-')) {
    return 5;
  }

  if (move.from.startsWith('tableau-') && move.to.startsWith('tableau-')) {
    let score = 120;
    const fromPile = state.piles[move.from];
    const idx = fromPile.cards.findIndex((c) => c.id === move.cardIds[0]);
    if (idx > 0 && !fromPile.cards[idx - 1].faceUp) {
      score += 80;
    }
    if (state.piles[move.to].cards.length === 0) {
      score += 60;
    }
    score += move.cardIds.length;
    return score;
  }

  if (move.from === 'waste' && move.to.startsWith('foundation-')) {
    return 350;
  }

  if (move.from === 'waste') {
    return 90;
  }

  if (move.drew) {
    const stockLeft = state.piles.stock.cards.length;
    return 20 + Math.min(stockLeft, 10);
  }

  if (move.recycled) {
    return 1;
  }

  return 30;
}

function orderMoves(moves: Move[], state: GameState): Move[] {
  return [...moves].sort((a, b) => {
    const depA = shouldDeprioritizeWorryBack(state, a);
    const depB = shouldDeprioritizeWorryBack(state, b);
    if (depA !== depB) return depA ? 1 : -1;
    return scoreMove(state, b) - scoreMove(state, a);
  });
}

export function solve(options: SolverOptions = {}): SolverResult {
  const maxNodes = options.maxNodes ?? DEFAULT_MAX_NODES;
  const maxTimeMs = options.maxTimeMs ?? DEFAULT_MAX_TIME_MS;
  const start = Date.now();

  const state = cloneInitialState(options);
  if (klondike.isWon(state)) {
    return { solvable: true, nodesVisited: 0, timedOut: false, reason: 'won' };
  }

  const visitedExact = new Set<string>();
  let nodesVisited = 0;
  let timedOut = false;

  type Frame = { moves: Move[]; index: number; undo: UndoFn };
  const frames: Frame[] = [];
  let moves = orderMoves(klondike.getLegalMoves(state, { skipScoring: true }), state);
  let index = 0;

  search: while (true) {
    nodesVisited += 1;
    if (nodesVisited > maxNodes || Date.now() - start > maxTimeMs) {
      timedOut = true;
      break search;
    }

    if (klondike.isWon(state)) {
      return { solvable: true, nodesVisited, timedOut: false, reason: 'won' };
    }

    while (index < moves.length) {
      const move = moves[index];
      index += 1;
      const undo = applySolverMove(state, move);

      const exactKey = exactStateKey(state);
      if (visitedExact.has(exactKey)) {
        undo();
        continue;
      }

      visitedExact.add(exactKey);

      frames.push({ moves, index, undo });
      moves = orderMoves(klondike.getLegalMoves(state, { skipScoring: true }), state);
      index = 0;
      continue search;
    }

    if (frames.length === 0) {
      break search;
    }

    const frame = frames.pop()!;
    frame.undo();
    moves = frame.moves;
    index = frame.index;
  }

  return {
    solvable: false,
    nodesVisited,
    timedOut,
    reason: timedOut ? 'budget' : 'exhausted',
  };
}

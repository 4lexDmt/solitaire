import { buildDeck } from './deck';
import { vegasBuyIn } from './scoring';
import type { Card, GameState, Move, ScoreMode, StockPassLimit } from './types';
import type { Variant } from './variant';
import { klondike } from './variants/klondike';

export interface NewGameOptions {
  seed: string;
  drawCount?: 1 | 3;
  scoreMode?: ScoreMode;
  stockPassLimit?: StockPassLimit;
  startingScore?: number;
  variant?: Variant;
}

function cloneCard(card: Card): Card {
  return { ...card };
}

function clonePiles(piles: GameState['piles']): GameState['piles'] {
  const next: GameState['piles'] = {};
  for (const [id, pile] of Object.entries(piles)) {
    next[id] = {
      ...pile,
      cards: pile.cards.map(cloneCard),
    };
  }
  return next;
}

export function cloneState(state: GameState): GameState {
  return {
    ...state,
    piles: clonePiles(state.piles),
    history: [...state.history],
    future: [...state.future],
    hintCardIds: state.hintCardIds ? [...state.hintCardIds] : undefined,
  };
}

function removeCards(pile: GameState['piles'][string], count: number): Card[] {
  return pile.cards.splice(pile.cards.length - count, count);
}

function appendCards(pile: GameState['piles'][string], cards: Card[]): void {
  pile.cards.push(...cards);
}

/** Flip the newly exposed top face-down card in a tableau column, if any. */
export function autoFlip(
  piles: GameState['piles'],
  pileId: string,
): { pileId: string; cardId: string } | undefined {
  const pile = piles[pileId];
  if (!pile || pile.type !== 'tableau') return undefined;

  const top = pile.cards[pile.cards.length - 1];
  if (!top || top.faceUp) return undefined;

  top.faceUp = true;
  return { pileId, cardId: top.id };
}

function executeCardMove(
  state: GameState,
  move: Omit<Move, 'scoreDelta' | 'ts'>,
  ts: number,
  variant: Variant,
): { state: GameState; move: Move } {
  const next = cloneState(state);
  const fromPile = next.piles[move.from];
  const toPile = next.piles[move.to];

  const startIdx = fromPile.cards.findIndex((c) => c.id === move.cardIds[0]);
  const moving = fromPile.cards.splice(startIdx);
  appendCards(toPile, moving);

  if (toPile.type === 'foundation' && toPile.cards.length === 1) {
    toPile.suit = moving[0].suit;
  }

  let flipped: Move['flipped'];
  if (fromPile.type === 'tableau') {
    flipped = autoFlip(next.piles, move.from);
  }

  const fullMove: Move = {
    ...move,
    flipped,
    scoreDelta: 0,
    ts,
  };
  fullMove.scoreDelta = variant.score(fullMove, next.scoreMode);

  next.moves += 1;
  next.score += fullMove.scoreDelta;
  next.selection = null;

  if (variant.isWon(next)) {
    next.status = 'won';
  }

  return { state: next, move: fullMove };
}

function executeDraw(state: GameState, ts: number, variant: Variant): { state: GameState; move: Move } | null {
  const stock = state.piles.stock;
  if (stock.cards.length === 0) return null;

  const next = cloneState(state);
  const drew = Math.min(state.drawCount, stock.cards.length);
  const drawn = removeCards(next.piles.stock, drew).map((c) => ({ ...c, faceUp: true }));
  appendCards(next.piles.waste, drawn);

  const move: Move = {
    from: 'stock',
    to: 'waste',
    cardIds: drawn.map((c) => c.id),
    drew,
    scoreDelta: 0,
    ts,
  };
  move.scoreDelta = variant.score(move, next.scoreMode);

  next.moves += 1;
  next.score += move.scoreDelta;
  next.selection = null;

  return { state: next, move };
}

export function canRecycle(state: GameState): boolean {
  const waste = state.piles.waste;
  const stock = state.piles.stock;
  if (waste.cards.length === 0 || stock.cards.length > 0) return false;
  if (state.stockPassLimit === 'unlimited') return true;
  return state.stockRecycles < state.stockPassLimit;
}

function executeRecycle(state: GameState, ts: number, variant: Variant): { state: GameState; move: Move } | null {
  const waste = state.piles.waste;
  const stock = state.piles.stock;
  if (waste.cards.length === 0 || stock.cards.length > 0) return null;
  if (!canRecycle(state)) return null;

  const next = cloneState(state);
  const recycledCards = removeCards(next.piles.waste, waste.cards.length)
    .reverse()
    .map((c) => ({ ...c, faceUp: false }));
  appendCards(next.piles.stock, recycledCards);

  const move: Move = {
    from: 'waste',
    to: 'stock',
    cardIds: recycledCards.map((c) => c.id),
    recycled: true,
    scoreDelta: 0,
    ts,
  };
  move.scoreDelta = variant.score(move, next.scoreMode);

  next.moves += 1;
  next.score += move.scoreDelta;
  next.selection = null;
  next.stockRecycles += 1;

  return { state: next, move };
}

export function applyMove(
  state: GameState,
  from: string,
  to: string,
  cardIds: string[],
  ts: number,
  variant: Variant = klondike,
): GameState {
  if (!variant.canDrop(state, cardIds, from, to)) {
    return state;
  }

  const { state: next, move } = executeCardMove(state, { from, to, cardIds }, ts, variant);
  next.history = [...state.history, move];
  next.future = [];
  return next;
}

export function draw(state: GameState, ts: number, variant: Variant = klondike): GameState {
  const result = executeDraw(state, ts, variant);
  if (!result) return state;

  const { state: next, move } = result;
  next.history = [...state.history, move];
  next.future = [];
  return next;
}

export function recycle(state: GameState, ts: number, variant: Variant = klondike): GameState {
  const result = executeRecycle(state, ts, variant);
  if (!result) return state;

  const { state: next, move } = result;
  next.history = [...state.history, move];
  next.future = [];
  return next;
}

function reverseCardMove(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const fromPile = next.piles[move.to];
  const toPile = next.piles[move.from];

  if (move.flipped) {
    const pile = next.piles[move.flipped.pileId];
    const card = pile.cards.find((c) => c.id === move.flipped!.cardId);
    if (card) card.faceUp = false;
  }

  const startIdx = fromPile.cards.findIndex((c) => c.id === move.cardIds[0]);
  const moving = fromPile.cards.splice(startIdx);
  appendCards(toPile, moving);

  if (fromPile.type === 'foundation' && fromPile.cards.length === 0) {
    delete fromPile.suit;
  }

  if (toPile.type === 'foundation' && toPile.cards.length === 0) {
    delete toPile.suit;
  }

  next.moves -= 1;
  next.score -= move.scoreDelta;
  next.status = 'playing';
  next.stockRecycles = Math.max(0, next.stockRecycles - 1);

  return next;
}

function reverseDraw(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const drew = move.drew ?? move.cardIds.length;
  const drawn = removeCards(next.piles.waste, drew).map((c) => ({ ...c, faceUp: false }));
  appendCards(next.piles.stock, drawn);

  next.moves -= 1;
  next.score -= move.scoreDelta;
  next.status = 'playing';

  return next;
}

function reverseRecycle(state: GameState, move: Move): GameState {
  const next = cloneState(state);
  const recycled = removeCards(next.piles.stock, move.cardIds.length)
    .reverse()
    .map((c) => ({ ...c, faceUp: true }));
  appendCards(next.piles.waste, recycled);

  next.moves -= 1;
  next.score -= move.scoreDelta;
  next.status = 'playing';

  return next;
}

export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;

  const move = state.history[state.history.length - 1];
  let next: GameState;

  if (move.recycled) {
    next = reverseRecycle(state, move);
  } else if (move.drew) {
    next = reverseDraw(state, move);
  } else {
    next = reverseCardMove(state, move);
  }

  next.history = state.history.slice(0, -1);
  next.future = [...state.future, move];
  return next;
}

export function redo(state: GameState, variant: Variant = klondike): GameState {
  if (state.future.length === 0) return state;

  const move = state.future[state.future.length - 1];
  let next: GameState;

  if (move.recycled) {
    const result = executeRecycle(state, move.ts, variant);
    next = result ? result.state : state;
  } else if (move.drew) {
    const result = executeDraw(state, move.ts, variant);
    next = result ? result.state : state;
  } else {
    const result = executeCardMove(state, move, move.ts, variant);
    next = result.state;
  }

  next.history = [...state.history, move];
  next.future = state.future.slice(0, -1);
  return next;
}

export function newGame(options: NewGameOptions): GameState {
  const variant = options.variant ?? klondike;
  const drawCount = options.drawCount ?? 3;
  const scoreMode = options.scoreMode ?? 'standard';
  const stockPassLimit = options.stockPassLimit ?? 'unlimited';
  const deck = buildDeck();
  const piles = variant.deal(deck, options.seed);
  const baseScore =
    options.startingScore !== undefined
      ? options.startingScore
      : vegasBuyIn(scoreMode);

  return {
    variantId: variant.id,
    seed: options.seed,
    drawCount,
    scoreMode,
    stockPassLimit,
    stockRecycles: 0,
    piles,
    selection: null,
    status: 'playing',
    moves: 0,
    score: baseScore,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

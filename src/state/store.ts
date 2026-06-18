"use client";

import { type ThemeId, THEMES } from "@/config/tokens";
import {
  applyMove,
  canRecycle,
  draw as engineDraw,
  newGame as engineNewGame,
  recycle as engineRecycle,
  redo as engineRedo,
  undo as engineUndo,
} from "@/engine/reducer";
import type { GameState, ScoreMode, Selection, StockPassLimit } from "@/engine/types";
import { getHintCardIds } from "@/engine/hints";
import { klondike } from "@/engine/variants/klondike";
import { getMovableCardIds } from "@/lib/hitTest";
import { create } from "zustand";

function applyThemeToDom(theme: ThemeId): void {
  if (typeof document === "undefined") return;
  if (theme === "heritage") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

function randomSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

export interface GameStore {
  theme: ThemeId;
  game: GameState;
  newGame: (options?: {
    seed?: string;
    drawCount?: 1 | 3;
    scoreMode?: ScoreMode;
    stockPassLimit?: StockPassLimit;
    startingScore?: number;
  }) => void;
  move: (from: string, to: string, cardIds: string[]) => boolean;
  draw: () => void;
  recycle: () => void;
  drawOrRecycle: () => void;
  setSelection: (selection: Selection | null) => void;
  clearSelection: () => void;
  autoMoveCard: (pileId: string, cardId: string) => boolean;
  undo: () => void;
  redo: () => void;
  hint: () => void;
  setTheme: (theme: ThemeId) => void;
  tick: (deltaMs: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  theme: "heritage",
  game: engineNewGame({ seed: "preview", drawCount: 3 }),

  newGame: (options) => {
    set({
      game: engineNewGame({
        seed: options?.seed ?? randomSeed(),
        drawCount: options?.drawCount ?? 3,
        scoreMode: options?.scoreMode ?? 'standard',
        stockPassLimit: options?.stockPassLimit ?? 'unlimited',
        startingScore: options?.startingScore,
      }),
    });
  },

  move: (from, to, cardIds) => {
    const { game } = get();
    if (!klondike.canDrop(game, cardIds, from, to)) return false;
    set({
      game: applyMove(game, from, to, cardIds, Date.now()),
    });
    return true;
  },

  setSelection: (selection) => {
    const { game } = get();
    set({ game: { ...game, selection, hintCardIds: undefined } });
  },

  clearSelection: () => {
    const { game } = get();
    if (!game.selection) return;
    set({ game: { ...game, selection: null } });
  },

  autoMoveCard: (pileId, cardId) => {
    const { game } = get();
    const target = klondike.autoMoveTarget(game, cardId);
    if (!target) return false;
    const cardIds = getMovableCardIds(game, pileId, cardId);
    if (!cardIds || !klondike.canDrop(game, cardIds, pileId, target)) return false;
    set({ game: applyMove(game, pileId, target, cardIds, Date.now()) });
    return true;
  },

  drawOrRecycle: () => {
    const { game, draw, recycle } = get();
    if (game.piles.stock.cards.length > 0) {
      draw();
    } else if (game.piles.waste.cards.length > 0 && canRecycle(game)) {
      recycle();
    }
  },

  draw: () => {
    const { game } = get();
    set({ game: engineDraw(game, Date.now()) });
  },

  recycle: () => {
    const { game } = get();
    set({ game: engineRecycle(game, Date.now()) });
  },

  undo: () => {
    const { game } = get();
    set({ game: engineUndo(game) });
  },

  redo: () => {
    const { game } = get();
    set({ game: engineRedo(game) });
  },

  hint: () => {
    const { game } = get();
    const hintCardIds = getHintCardIds(game);
    set({ game: { ...game, hintCardIds: hintCardIds.length > 0 ? hintCardIds : undefined } });
  },

  setTheme: (theme) => {
    if (!THEMES.includes(theme)) return;
    applyThemeToDom(theme);
    set({ theme });
  },

  tick: (deltaMs) => {
    const { game } = get();
    if (game.status !== "playing") return;
    set({ game: { ...game, elapsedMs: game.elapsedMs + deltaMs } });
  },
}));

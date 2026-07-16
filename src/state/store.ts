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
import type { SpiderSuits } from "@/engine/variant";
import { getVariant, type VariantId } from "@/engine/variants";
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
  // Always 8 chars so short Math.random() strings never weaken the seed.
  const raw = Math.random().toString(36).slice(2);
  return (raw + 'xxxxxxxx').slice(0, 8);
}

export interface GameStore {
  theme: ThemeId;
  game: GameState;
  newGame: (options?: {
    seed?: string;
    variantId?: VariantId;
    drawCount?: 1 | 3;
    scoreMode?: ScoreMode;
    stockPassLimit?: StockPassLimit;
    startingScore?: number;
    spiderSuits?: SpiderSuits;
  }) => void;
  move: (from: string, to: string, cardIds: string[]) => boolean;
  draw: () => void;
  recycle: () => void;
  drawOrRecycle: () => void;
  setSelection: (selection: Selection | null) => void;
  clearSelection: () => void;
  autoMoveCard: (pileId: string, cardId: string) => boolean;
  autoMoveToFoundation: (pileId: string, cardId: string) => boolean;
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
        variant: getVariant(options?.variantId ?? 'klondike'),
        drawCount: options?.drawCount ?? 3,
        scoreMode: options?.scoreMode ?? 'standard',
        stockPassLimit: options?.stockPassLimit ?? 'unlimited',
        startingScore: options?.startingScore,
        spiderSuits: options?.spiderSuits,
      }),
    });
  },

  move: (from, to, cardIds) => {
    const { game } = get();
    if (game.status !== "playing") return false;
    const variant = getVariant(game.variantId);
    if (!variant.canDrop(game, cardIds, from, to)) return false;
    set({
      game: applyMove(game, from, to, cardIds, Date.now(), variant),
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
    const variant = getVariant(game.variantId);
    const target = variant.autoMoveTarget(game, cardId);
    if (!target) return false;
    const cardIds = getMovableCardIds(game, pileId, cardId);
    if (!cardIds || !variant.canDrop(game, cardIds, pileId, target)) return false;
    set({ game: applyMove(game, pileId, target, cardIds, Date.now(), variant) });
    return true;
  },

  autoMoveToFoundation: (pileId, cardId) => {
    const { game } = get();
    if (game.status !== 'playing') return false;
    const variant = getVariant(game.variantId);
    const target = variant.autoMoveToFoundation(game, pileId, cardId);
    if (target) {
      set({ game: applyMove(game, pileId, target, [cardId], Date.now(), variant) });
      return true;
    }
    // Variants without playable foundations (Spider) fall back to the best tableau move.
    if (variant.foundationsLocked) {
      return get().autoMoveCard(pileId, cardId);
    }
    return false;
  },

  drawOrRecycle: () => {
    const { game, draw, recycle } = get();
    if ((game.piles.stock?.cards.length ?? 0) > 0) {
      draw();
    } else if ((game.piles.waste?.cards.length ?? 0) > 0 && canRecycle(game)) {
      recycle();
    }
  },

  draw: () => {
    const { game } = get();
    if (game.status !== "playing") return;
    set({ game: engineDraw(game, Date.now(), getVariant(game.variantId)) });
  },

  recycle: () => {
    const { game } = get();
    if (game.status !== "playing") return;
    set({ game: engineRecycle(game, Date.now(), getVariant(game.variantId)) });
  },

  undo: () => {
    const { game } = get();
    if (game.status === "won") return;
    set({ game: engineUndo(game) });
  },

  redo: () => {
    const { game } = get();
    if (game.status === "won") return;
    set({ game: engineRedo(game, getVariant(game.variantId)) });
  },

  hint: () => {
    const { game } = get();
    if (game.status !== "playing") return;
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

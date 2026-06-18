'use client';

import { create } from 'zustand';
import type { ScoreMode } from '@/engine/types';

export interface ModeStats {
  played: number;
  won: number;
  bestTimeMs: number | null;
  fewestMoves: number | null;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  totalTimeMs: number;
  draw1: ModeStats;
  draw3: ModeStats;
  dailyCompleted: number;
  dailyCurrentStreak: number;
  dailyBestStreak: number;
  lastDailyDate: string | null;
  vegasBankroll: number;
}

export const EMPTY_MODE_STATS: ModeStats = {
  played: 0,
  won: 0,
  bestTimeMs: null,
  fewestMoves: null,
};

export const DEFAULT_STATS: PlayerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalTimeMs: 0,
  draw1: { ...EMPTY_MODE_STATS },
  draw3: { ...EMPTY_MODE_STATS },
  dailyCompleted: 0,
  dailyCurrentStreak: 0,
  dailyBestStreak: 0,
  lastDailyDate: null,
  vegasBankroll: 0,
};

export interface GameResult {
  won: boolean;
  drawCount: 1 | 3;
  elapsedMs: number;
  moves: number;
  isDaily?: boolean;
  dailyDate?: string;
  finalScore?: number;
  scoreMode?: ScoreMode;
}

export interface StatsStore extends PlayerStats {
  hydrate: (partial: Partial<PlayerStats>) => void;
  recordGame: (result: GameResult) => void;
  reset: () => void;
}

function updateModeStats(
  mode: ModeStats,
  won: boolean,
  elapsedMs: number,
  moves: number,
): ModeStats {
  const next: ModeStats = {
    played: mode.played + 1,
    won: mode.won + (won ? 1 : 0),
    bestTimeMs: mode.bestTimeMs,
    fewestMoves: mode.fewestMoves,
  };
  if (won) {
    if (mode.bestTimeMs === null || elapsedMs < mode.bestTimeMs) {
      next.bestTimeMs = elapsedMs;
    }
    if (mode.fewestMoves === null || moves < mode.fewestMoves) {
      next.fewestMoves = moves;
    }
  }
  return next;
}

function recordDailyStreak(
  stats: PlayerStats,
  dailyDate: string,
  won: boolean,
): Pick<
  PlayerStats,
  'dailyCompleted' | 'dailyCurrentStreak' | 'dailyBestStreak' | 'lastDailyDate'
> {
  if (!won) {
    return {
      dailyCompleted: stats.dailyCompleted,
      dailyCurrentStreak: 0,
      dailyBestStreak: stats.dailyBestStreak,
      lastDailyDate: dailyDate,
    };
  }

  const yesterday = previousUtcDate(dailyDate);
  const continued =
    stats.lastDailyDate === yesterday || stats.lastDailyDate === dailyDate;
  const dailyCurrentStreak = continued
    ? stats.dailyCurrentStreak + (stats.lastDailyDate === dailyDate ? 0 : 1)
    : 1;

  return {
    dailyCompleted: stats.dailyCompleted + (stats.lastDailyDate === dailyDate ? 0 : 1),
    dailyCurrentStreak,
    dailyBestStreak: Math.max(stats.dailyBestStreak, dailyCurrentStreak),
    lastDailyDate: dailyDate,
  };
}

function previousUtcDate(yyyyMmDd: string): string {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

export const useStatsStore = create<StatsStore>((set) => ({
  ...DEFAULT_STATS,

  hydrate: (partial) => set((state) => ({ ...state, ...partial })),

  recordGame: (result) => {
    set((stats) => {
      const modeKey = result.drawCount === 1 ? 'draw1' : 'draw3';
      const modeStats = updateModeStats(
        stats[modeKey],
        result.won,
        result.elapsedMs,
        result.moves,
      );

      const streakReset = !result.won;
      const currentStreak = result.won ? stats.currentStreak + 1 : 0;
      const bestStreak = result.won
        ? Math.max(stats.bestStreak, currentStreak)
        : stats.bestStreak;

      const daily = result.isDaily && result.dailyDate
        ? recordDailyStreak(stats, result.dailyDate, result.won)
        : {};

      let vegasBankroll = stats.vegasBankroll;
      if (result.scoreMode === 'vegas' && result.finalScore !== undefined) {
        vegasBankroll = result.finalScore;
      }

      return {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
        gamesWon: stats.gamesWon + (result.won ? 1 : 0),
        currentStreak: streakReset ? 0 : currentStreak,
        bestStreak,
        totalTimeMs: stats.totalTimeMs + result.elapsedMs,
        vegasBankroll,
        [modeKey]: modeStats,
        ...daily,
      };
    });
  },

  reset: () => set({ ...DEFAULT_STATS }),
}));

export function winRate(won: number, played: number): number {
  if (played === 0) return 0;
  return Math.round((won / played) * 100);
}

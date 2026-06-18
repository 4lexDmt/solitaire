'use client';

import { create } from 'zustand';

export type AchievementId =
  | 'first_win'
  | 'no_undo_win'
  | 'sub_two_minute'
  | 'daily_streak_7'
  | 'draw3_win'
  | 'comeback';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  description: string;
  icon: 'trophy' | 'flame' | 'check';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_win',
    title: 'First Win',
    description: 'Complete your first game.',
    icon: 'trophy',
  },
  {
    id: 'no_undo_win',
    title: 'Clean Run',
    description: 'Win without using undo.',
    icon: 'check',
  },
  {
    id: 'sub_two_minute',
    title: 'Quick Finish',
    description: 'Win in under two minutes.',
    icon: 'trophy',
  },
  {
    id: 'daily_streak_7',
    title: 'Week of Dailies',
    description: 'Complete seven daily challenges in a row.',
    icon: 'flame',
  },
  {
    id: 'draw3_win',
    title: 'Draw Three',
    description: 'Win a draw-three game.',
    icon: 'trophy',
  },
  {
    id: 'comeback',
    title: 'Comeback',
    description: 'Win after moving a card from foundation to tableau.',
    icon: 'check',
  },
];

export interface AchievementUnlockContext {
  won: boolean;
  drawCount: 1 | 3;
  elapsedMs: number;
  usedUndo: boolean;
  worryBack: boolean;
  dailyStreak: number;
  previouslyUnlocked: AchievementId[];
}

export interface AchievementsStore {
  unlocked: AchievementId[];
  unlockedAt: Partial<Record<AchievementId, number>>;
  hydrate: (unlocked: AchievementId[], unlockedAt?: Partial<Record<AchievementId, number>>) => void;
  checkAndUnlock: (ctx: AchievementUnlockContext) => AchievementId[];
  reset: () => void;
}

function evaluateUnlocks(ctx: AchievementUnlockContext): AchievementId[] {
  if (!ctx.won) return [];

  const candidates: AchievementId[] = [];

  if (!ctx.previouslyUnlocked.includes('first_win')) {
    candidates.push('first_win');
  }
  if (!ctx.usedUndo && !ctx.previouslyUnlocked.includes('no_undo_win')) {
    candidates.push('no_undo_win');
  }
  if (ctx.elapsedMs < 120_000 && !ctx.previouslyUnlocked.includes('sub_two_minute')) {
    candidates.push('sub_two_minute');
  }
  if (ctx.dailyStreak >= 7 && !ctx.previouslyUnlocked.includes('daily_streak_7')) {
    candidates.push('daily_streak_7');
  }
  if (ctx.drawCount === 3 && !ctx.previouslyUnlocked.includes('draw3_win')) {
    candidates.push('draw3_win');
  }
  if (ctx.worryBack && !ctx.previouslyUnlocked.includes('comeback')) {
    candidates.push('comeback');
  }

  return candidates;
}

export const useAchievementsStore = create<AchievementsStore>((set, get) => ({
  unlocked: [],
  unlockedAt: {},

  hydrate: (unlocked, unlockedAt = {}) => set({ unlocked, unlockedAt }),

  checkAndUnlock: (ctx) => {
    const newly = evaluateUnlocks(ctx).filter(
      (id) => !get().unlocked.includes(id),
    );
    if (newly.length === 0) return [];

    const now = Date.now();
    set((state) => ({
      unlocked: [...state.unlocked, ...newly],
      unlockedAt: {
        ...state.unlockedAt,
        ...Object.fromEntries(newly.map((id) => [id, now])),
      },
    }));
    return newly;
  },

  reset: () => set({ unlocked: [], unlockedAt: {} }),
}));

export function getAchievement(id: AchievementId): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

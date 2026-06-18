'use client';

import { create } from 'zustand';
import type { ThemeId } from '@/config/tokens';
import type { ScoreMode, StockPassLimit } from '@/engine/types';

export type { StockPassLimit };

export interface UserSettings {
  drawCount: 1 | 3;
  scoreMode: ScoreMode;
  stockPassLimit: StockPassLimit;
  leftHanded: boolean;
  winnableOnly: boolean;
  vegasCumulative: boolean;
  showTimer: boolean;
  soundEnabled: boolean;
  motionEnabled: boolean;
  hapticsEnabled: boolean;
  fourColorDeck: boolean;
  theme: ThemeId;
}

export const DEFAULT_SETTINGS: UserSettings = {
  drawCount: 3,
  scoreMode: 'standard',
  stockPassLimit: 'unlimited',
  leftHanded: false,
  winnableOnly: false,
  vegasCumulative: false,
  showTimer: true,
  soundEnabled: true,
  motionEnabled: true,
  hapticsEnabled: true,
  fourColorDeck: false,
  theme: 'heritage',
};

export interface SettingsStore extends UserSettings {
  hydrate: (partial: Partial<UserSettings>) => void;
  setDrawCount: (drawCount: 1 | 3) => void;
  setScoreMode: (scoreMode: ScoreMode) => void;
  setStockPassLimit: (limit: StockPassLimit) => void;
  setLeftHanded: (leftHanded: boolean) => void;
  setWinnableOnly: (winnableOnly: boolean) => void;
  setVegasCumulative: (vegasCumulative: boolean) => void;
  setShowTimer: (showTimer: boolean) => void;
  setSoundEnabled: (soundEnabled: boolean) => void;
  setMotionEnabled: (motionEnabled: boolean) => void;
  setHapticsEnabled: (hapticsEnabled: boolean) => void;
  setFourColorDeck: (fourColorDeck: boolean) => void;
  setTheme: (theme: ThemeId) => void;
  reset: () => void;
}

function applyThemeToDom(theme: ThemeId) {
  if (typeof document === 'undefined') return;
  if (theme === 'heritage') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

function applyFourColorToDom(fourColorDeck: boolean) {
  if (typeof document === 'undefined') return;
  if (fourColorDeck) {
    document.documentElement.dataset.fourColor = 'true';
  } else {
    document.documentElement.removeAttribute('data-four-color');
  }
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...DEFAULT_SETTINGS,

  hydrate: (partial) => {
    set((state) => {
      const next = { ...state, ...partial };
      if (partial.theme) applyThemeToDom(partial.theme);
      if (partial.fourColorDeck !== undefined) {
        applyFourColorToDom(partial.fourColorDeck);
      }
      return next;
    });
  },

  setDrawCount: (drawCount) => set({ drawCount }),
  setScoreMode: (scoreMode) => set({ scoreMode }),
  setStockPassLimit: (stockPassLimit) => set({ stockPassLimit }),
  setLeftHanded: (leftHanded) => set({ leftHanded }),
  setWinnableOnly: (winnableOnly) => set({ winnableOnly }),
  setVegasCumulative: (vegasCumulative) => set({ vegasCumulative }),
  setShowTimer: (showTimer) => set({ showTimer }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setMotionEnabled: (motionEnabled) => set({ motionEnabled }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setFourColorDeck: (fourColorDeck) => {
    applyFourColorToDom(fourColorDeck);
    set({ fourColorDeck });
  },
  setTheme: (theme) => {
    applyThemeToDom(theme);
    set({ theme });
  },
  reset: () => {
    applyThemeToDom(DEFAULT_SETTINGS.theme);
    applyFourColorToDom(DEFAULT_SETTINGS.fourColorDeck);
    set({ ...DEFAULT_SETTINGS });
  },
}));

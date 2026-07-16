'use client';

import dynamic from 'next/dynamic';
import { GameScreen } from '@/components/screens/GameScreen';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { dailyDateKey, isDailySeed } from '@/lib/daily';
import { dailyWinnableSeed, pickWinnableSeed, topUpWinnablePool } from '@/lib/winnablePool';
import {
  autosaveGame,
  clearSavedGame,
  loadAchievements,
  loadSavedGame,
  loadSettings,
  loadStats,
  saveAchievements,
  saveSettings,
  saveStats,
} from '@/persistence/db';
import { pullCloudStats, syncActiveSave, syncOnGameEnd } from '@/lib/supabase/sync';
import { HAPTIC, vibrate } from '@/lib/haptics';
import type { VariantId } from '@/engine/variants';
import { useAchievementsStore, type AchievementId } from '@/state/achievements';
import { type UserSettings, useSettingsStore } from '@/state/settings';
import { useStatsStore } from '@/state/stats';
import { useGameStore } from '@/state/store';
import { useCallback, useEffect, useRef, useState } from 'react';

const StatsPanel = dynamic(
  () => import('@/components/screens/StatsPanel').then((m) => m.StatsPanel),
  { ssr: false },
);

const SettingsPanel = dynamic(
  () => import('@/components/screens/SettingsPanel').then((m) => m.SettingsPanel),
  { ssr: false },
);

type Screen = 'home' | 'game';

function pickSettings(state: ReturnType<typeof useSettingsStore.getState>): UserSettings {
  return {
    variantId: state.variantId,
    spiderSuits: state.spiderSuits,
    drawCount: state.drawCount,
    scoreMode: state.scoreMode,
    stockPassLimit: state.stockPassLimit,
    leftHanded: state.leftHanded,
    winnableOnly: state.winnableOnly,
    vegasCumulative: state.vegasCumulative,
    showTimer: state.showTimer,
    soundEnabled: state.soundEnabled,
    motionEnabled: state.motionEnabled,
    hapticsEnabled: state.hapticsEnabled,
    fourColorDeck: state.fourColorDeck,
    theme: state.theme,
  };
}

export function AppShell() {
  const [screen, setScreen] = useState<Screen>('home');
  const [paused, setPaused] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winCelebrationActive, setWinCelebrationActive] = useState(false);
  const [winAchievements, setWinAchievements] = useState<AchievementId[]>([]);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isDaily, setIsDaily] = useState(false);

  const game = useGameStore((s) => s.game);
  const newGame = useGameStore((s) => s.newGame);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const hint = useGameStore((s) => s.hint);
  const tick = useGameStore((s) => s.tick);
  const setGameTheme = useGameStore((s) => s.setTheme);

  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const variantId = useSettingsStore((s) => s.variantId);
  const spiderSuits = useSettingsStore((s) => s.spiderSuits);
  const drawCount = useSettingsStore((s) => s.drawCount);
  const scoreMode = useSettingsStore((s) => s.scoreMode);
  const theme = useSettingsStore((s) => s.theme);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const winnableOnly = useSettingsStore((s) => s.winnableOnly);
  const stockPassLimit = useSettingsStore((s) => s.stockPassLimit);
  const vegasCumulative = useSettingsStore((s) => s.vegasCumulative);
  const vegasBankroll = useStatsStore((s) => s.vegasBankroll);
  const recordGame = useStatsStore((s) => s.recordGame);
  const checkAchievements = useAchievementsStore((s) => s.checkAndUnlock);
  const unlocked = useAchievementsStore((s) => s.unlocked);

  const usedUndoRef = useRef(false);
  const worryBackRef = useRef(false);
  const processedWinRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    void (async () => {
      const [savedSettings, savedStats, savedAchievements, savedGame] =
        await Promise.all([
          loadSettings(),
          loadStats(),
          loadAchievements(),
          loadSavedGame(),
        ]);

      if (savedSettings) hydrateSettings(savedSettings);
      if (savedStats) useStatsStore.getState().hydrate(savedStats);
      if (savedAchievements) {
        useAchievementsStore
          .getState()
          .hydrate(savedAchievements.unlocked, savedAchievements.unlockedAt);
      }

      const cloudStats = await pullCloudStats();
      if (cloudStats) useStatsStore.getState().hydrate(cloudStats);

      if (savedSettings?.theme) setGameTheme(savedSettings.theme);

      if (savedGame && savedGame.game.status === 'playing') {
        setHasSavedGame(true);
      }
    })();
  }, [hydrateSettings, setGameTheme]);

  useEffect(() => {
    if (screen !== 'game' || game.status !== 'playing' || paused) return;

    const id = window.setInterval(() => tick(1000), 1000);
    return () => window.clearInterval(id);
  }, [screen, game.status, paused, tick]);

  useEffect(() => {
    if (screen !== 'game' || game.status !== 'playing') return;

    const worryBack = game.history.some(
      (move) =>
        move.from.startsWith('foundation-') && move.to.startsWith('tableau-'),
    );
    worryBackRef.current = worryBack;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      void autosaveGame({
        game,
        savedAt: Date.now(),
        isDaily,
        usedUndo: usedUndoRef.current,
        worryBack: worryBackRef.current,
      });
      setHasSavedGame(true);
      void syncActiveSave(game, isDaily);
    }, 400);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [game, screen, isDaily]);

  useEffect(() => {
    const unsubSettings = useSettingsStore.subscribe((state) => {
      void saveSettings(pickSettings(state));
    });
    const unsubStats = useStatsStore.subscribe((state) => {
      void saveStats(state);
    });
    const unsubAchievements = useAchievementsStore.subscribe((state) => {
      void saveAchievements(state.unlocked, state.unlockedAt);
    });
    return () => {
      unsubSettings();
      unsubStats();
      unsubAchievements();
    };
  }, []);

  useEffect(() => {
    if (winnableOnly && variantId === 'klondike') {
      topUpWinnablePool(drawCount);
    }
  }, [winnableOnly, drawCount, variantId]);

  const finalizeWin = useCallback(async () => {
    const dailyDate = isDaily ? dailyDateKey() : undefined;
    recordGame({
      won: true,
      variantId: game.variantId,
      drawCount: game.drawCount,
      elapsedMs: game.elapsedMs,
      moves: game.moves,
      isDaily,
      dailyDate,
      finalScore: game.score,
      scoreMode: game.scoreMode,
    });

    const stats = useStatsStore.getState();
    const newlyUnlocked = checkAchievements({
      won: true,
      variantId: game.variantId,
      drawCount: game.drawCount,
      elapsedMs: game.elapsedMs,
      usedUndo: usedUndoRef.current,
      worryBack: worryBackRef.current,
      dailyStreak: stats.dailyCurrentStreak,
      previouslyUnlocked: unlocked,
    });
    setWinAchievements(newlyUnlocked);

    await syncOnGameEnd({ game, stats, isDaily, dailyDate });
    await clearSavedGame();
    setHasSavedGame(false);
  }, [
    unlocked,
    checkAchievements,
    game,
    isDaily,
    recordGame,
  ]);

  useEffect(() => {
    if (game.status !== 'won') return;
    const key = `${game.seed}-${game.moves}-${game.elapsedMs}`;
    if (processedWinRef.current === key) return;
    processedWinRef.current = key;
    vibrate(HAPTIC.win, hapticsEnabled);
    void finalizeWin();
    setWinCelebrationActive(true);
  }, [game.status, game.seed, game.moves, game.elapsedMs, finalizeWin, hapticsEnabled]);

  useEffect(() => {
    if (game.status !== 'lost') return;
    const key = `${game.seed}-${game.moves}-lost`;
    if (processedWinRef.current === key) return;
    processedWinRef.current = key;

    recordGame({
      won: false,
      variantId: game.variantId,
      drawCount: game.drawCount,
      elapsedMs: game.elapsedMs,
      moves: game.moves,
      isDaily,
      dailyDate: isDaily ? dailyDateKey() : undefined,
      finalScore: game.score,
      scoreMode: game.scoreMode,
    });

    void clearSavedGame();
    setHasSavedGame(false);
  }, [game.status, game.seed, game.moves, game.elapsedMs, game.variantId, game.drawCount, game.score, game.scoreMode, isDaily, recordGame]);

  const handleWinCelebrationComplete = useCallback(() => {
    setWinCelebrationActive(false);
    setShowWin(true);
  }, []);

  function startGame(options?: { seed?: string; daily?: boolean; variantId?: VariantId }) {
    void (async () => {
      usedUndoRef.current = false;
      worryBackRef.current = false;
      processedWinRef.current = null;
      setShowWin(false);
      setWinCelebrationActive(false);
      setWinAchievements([]);
      setPaused(false);
      setIsDaily(Boolean(options?.daily));

      // Daily challenge is always the Klondike deal of the day.
      const gameVariantId = options?.daily
        ? 'klondike'
        : (options?.variantId ?? variantId);

      let seed = options?.seed;
      if (options?.daily) {
        try {
          seed = await dailyWinnableSeed(drawCount);
        } catch {
          seed = options?.seed;
        }
      }

      if (!seed && winnableOnly && gameVariantId === 'klondike') {
        try {
          seed = await pickWinnableSeed(drawCount);
        } catch {
          seed = undefined;
        }
      }

      // Vegas scoring is a Klondike mode; other variants use standard scoring.
      const gameScoreMode =
        gameVariantId !== 'klondike' && scoreMode === 'vegas' ? 'standard' : scoreMode;

      const startingScore =
        gameScoreMode === 'vegas' && vegasCumulative
          ? vegasBankroll - 52
          : undefined;

      newGame({
        seed,
        variantId: gameVariantId,
        drawCount,
        scoreMode: gameScoreMode,
        stockPassLimit,
        startingScore,
        spiderSuits,
      });
      setScreen('game');
    })();
  }

  async function resumeGame() {
    const saved = await loadSavedGame();
    if (!saved) return;
    usedUndoRef.current = saved.usedUndo;
    worryBackRef.current = saved.worryBack;
    setIsDaily(saved.isDaily);
    useGameStore.setState({ game: saved.game, theme });
    setShowWin(false);
    setWinAchievements([]);
    setPaused(false);
    setScreen('game');
  }

  function handleUndo() {
    usedUndoRef.current = true;
    undo();
  }

  return (
    <div className="baize-surface flex min-h-full flex-1 flex-col">
      {screen === 'home' ? (
        <HomeScreen
          onNewGame={() => startGame()}
          onDailyChallenge={() => startGame({ daily: true })}
          onResume={() => void resumeGame()}
          hasSavedGame={hasSavedGame}
          onOpenStats={() => setStatsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <GameScreen
          game={game}
          paused={paused}
          showWin={showWin}
          winCelebrationActive={winCelebrationActive}
          newAchievements={winAchievements}
          onWinCelebrationComplete={handleWinCelebrationComplete}
          isDaily={isDaily || isDailySeed(game.seed)}
          onMenu={() => setPaused(true)}
          onUndo={handleUndo}
          onRedo={redo}
          onHint={hint}
          onRestart={() =>
            startGame({
              seed: game.seed,
              daily: isDaily,
              variantId: game.variantId as VariantId,
            })
          }
          onResume={() => setPaused(false)}
          onNewGame={() => startGame()}
          onHome={() => {
            setPaused(false);
            setShowWin(false);
            setWinCelebrationActive(false);
            setWinAchievements([]);
            setScreen('home');
          }}
          onOpenSettings={() => {
            setPaused(false);
            setSettingsOpen(true);
          }}
          onOpenStats={() => {
            setPaused(false);
            setStatsOpen(true);
          }}
        />
      )}

      <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        gameInProgress={screen === 'game' && game.status === 'playing'}
        onConfirmNewDeal={() => startGame({ seed: game.seed, daily: isDaily })}
      />
    </div>
  );
}

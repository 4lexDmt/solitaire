'use client';

import dynamic from 'next/dynamic';
import { GameScreen } from '@/components/screens/GameScreen';
import { DesktopShell } from '@/components/win95/DesktopShell';
import { Win95Button, Win95Dialog } from '@/components/win95/primitives';
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
import { getAutoCompleteMoves } from '@/lib/autoComplete';
import { HAPTIC, vibrate } from '@/lib/haptics';
import { playSound } from '@/lib/sound';
import { flashStatus } from '@/lib/statusFlash';
import { variantLabel } from '@/lib/variantLabel';
import type { VariantId } from '@/engine/variants';
import { useAchievementsStore, type AchievementId } from '@/state/achievements';
import { type UserSettings, useSettingsStore } from '@/state/settings';
import { useStatsStore } from '@/state/stats';
import { useGameStore } from '@/state/store';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const StatsPanel = dynamic(
  () => import('@/components/screens/StatsPanel').then((m) => m.StatsPanel),
  { ssr: false },
);

const SettingsPanel = dynamic(
  () => import('@/components/screens/SettingsPanel').then((m) => m.SettingsPanel),
  { ssr: false },
);

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

type Dialog = 'help' | 'about' | 'daily' | null;

type ConfirmState = {
  message: string;
  onYes: () => void;
} | null;

const WIN_DIALOG_DELAY_MS = 2800;

export function AppShell() {
  const [booting, setBooting] = useState(true);
  const [bootPct, setBootPct] = useState(0);
  const [dealReady, setDealReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [winCelebrationActive, setWinCelebrationActive] = useState(false);
  const [winAchievements, setWinAchievements] = useState<AchievementId[]>([]);
  const [statsOpen, setStatsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [isDaily, setIsDaily] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { reducedMotion } = useReducedMotion();
  const motionEnabled = useSettingsStore((s) => s.motionEnabled);

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
  const stockPassLimit = useSettingsStore((s) => s.stockPassLimit);
  const winnableOnly = useSettingsStore((s) => s.winnableOnly);
  const vegasCumulative = useSettingsStore((s) => s.vegasCumulative);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setVariantId = useSettingsStore((s) => s.setVariantId);
  const theme = useSettingsStore((s) => s.theme);

  const hydrateStats = useStatsStore((s) => s.hydrate);
  const recordGame = useStatsStore((s) => s.recordGame);
  const vegasBankroll = useStatsStore((s) => s.vegasBankroll);
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const dailyBest = useStatsStore((s) => s.dailyBestStreak);

  const hydrateAchievements = useAchievementsStore((s) => s.hydrate);
  const checkAchievements = useAchievementsStore((s) => s.checkAndUnlock);
  const unlocked = useAchievementsStore((s) => s.unlocked);

  const usedUndoRef = useRef(false);
  const worryBackRef = useRef(false);
  const processedWinRef = useRef<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    try {
      const felt = localStorage.getItem('aevanor.felt') || 'green';
      const back = localStorage.getItem('aevanor.cardBack') || 'weave';
      document.documentElement.setAttribute('data-felt', felt);
      document.documentElement.setAttribute('data-card-back', back);
    } catch {
      document.documentElement.setAttribute('data-felt', 'green');
      document.documentElement.setAttribute('data-card-back', 'weave');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [settings, stats, achievements, saved] = await Promise.all([
        loadSettings(),
        loadStats(),
        loadAchievements(),
        loadSavedGame(),
      ]);
      if (cancelled) return;
      if (settings) hydrateSettings(settings);
      if (stats) hydrateStats(stats);
      if (achievements) {
        hydrateAchievements(achievements.unlocked, achievements.unlockedAt);
      }
      setHasSavedGame(Boolean(saved));
      setGameTheme(settings?.theme ?? theme);
      setHydrated(true);
      void pullCloudStats().then((cloud) => {
        if (cloud && !cancelled) hydrateStats(cloud);
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateAchievements, hydrateSettings, hydrateStats, setGameTheme, theme]);

  useEffect(() => {
    if (!hydrated) return;
    const unsubSettings = useSettingsStore.subscribe((state) => {
      void saveSettings(pickSettings(state));
    });
    const unsubStats = useStatsStore.subscribe((state) => {
      const {
        hydrate: _h,
        recordGame: _r,
        reset: _reset,
        ...rest
      } = state;
      void saveStats(rest);
    });
    const unsubAchievements = useAchievementsStore.subscribe((state) => {
      void saveAchievements(state.unlocked, state.unlockedAt);
    });
    return () => {
      unsubSettings();
      unsubStats();
      unsubAchievements();
    };
  }, [hydrated]);

  useEffect(() => {
    if (winnableOnly && variantId === 'klondike') {
      topUpWinnablePool(drawCount);
    }
  }, [winnableOnly, drawCount, variantId]);

  // Boot splash progress — stay until the first deal is ready (no preview-deal flash).
  useEffect(() => {
    if (!booting) return;
    const id = window.setInterval(() => {
      setBootPct((p) => Math.min(100, p + Math.random() * 16 + 7));
    }, 120);
    return () => window.clearInterval(id);
  }, [booting]);

  useEffect(() => {
    if (!booting || !dealReady || bootPct < 100) return;
    const id = window.setTimeout(() => setBooting(false), 200);
    return () => window.clearTimeout(id);
  }, [booting, dealReady, bootPct]);

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
  }, [unlocked, checkAchievements, game, isDaily, recordGame]);

  useEffect(() => {
    if (game.status !== 'won') return;
    const key = `${game.seed}-${game.moves}-${game.elapsedMs}`;
    if (processedWinRef.current === key) return;
    processedWinRef.current = key;
    vibrate(HAPTIC.win, hapticsEnabled);
    void finalizeWin();

    const animate = motionEnabled && !reducedMotion;
    if (animate) {
      setWinCelebrationActive(true);
      const id = window.setTimeout(() => setShowWin(true), WIN_DIALOG_DELAY_MS);
      return () => window.clearTimeout(id);
    }
    setWinCelebrationActive(false);
    setShowWin(true);
  }, [
    game.status,
    game.seed,
    game.moves,
    game.elapsedMs,
    finalizeWin,
    hapticsEnabled,
    motionEnabled,
    reducedMotion,
  ]);

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
  }, [
    game.status,
    game.seed,
    game.moves,
    game.elapsedMs,
    game.variantId,
    game.drawCount,
    game.score,
    game.scoreMode,
    isDaily,
    recordGame,
  ]);

  const handleWinCelebrationComplete = useCallback(() => {
    setWinCelebrationActive(false);
    setShowWin(true);
  }, []);

  const startGame = useCallback(
    async (options?: { seed?: string; daily?: boolean; variantId?: VariantId }) => {
      usedUndoRef.current = false;
      worryBackRef.current = false;
      processedWinRef.current = null;
      setShowWin(false);
      setWinCelebrationActive(false);
      setWinAchievements([]);
      setPaused(false);
      setConfirm(null);

      const wantDaily = Boolean(options?.daily);
      const gameVariantId = wantDaily
        ? 'klondike'
        : (options?.variantId ?? useSettingsStore.getState().variantId);

      if (options?.variantId) setVariantId(options.variantId);
      if (wantDaily) {
        setVariantId('klondike');
        useSettingsStore.getState().setDrawCount(1);
      }

      const settings = useSettingsStore.getState();
      const drawForGame = wantDaily ? 1 : settings.drawCount;
      let seed = options?.seed;
      let dailyOk = false;

      if (wantDaily) {
        try {
          seed = await dailyWinnableSeed(1);
          dailyOk = true;
        } catch {
          if (options?.seed) {
            // Restart / redraw offline — keep the already-dealt daily seed.
            seed = options.seed;
            dailyOk = true;
          } else {
            // Never label a fresh random deal as today's challenge.
            seed = undefined;
            dailyOk = false;
          }
        }
      }

      setIsDaily(dailyOk);

      if (!seed && settings.winnableOnly && gameVariantId === 'klondike') {
        try {
          seed = await pickWinnableSeed(drawForGame);
        } catch {
          seed = undefined;
        }
      }

      const gameScoreMode =
        gameVariantId !== 'klondike' && settings.scoreMode === 'vegas'
          ? 'standard'
          : settings.scoreMode;

      const startingScore =
        gameScoreMode === 'vegas' && settings.vegasCumulative
          ? useStatsStore.getState().vegasBankroll - 52
          : undefined;

      newGame({
        seed,
        variantId: gameVariantId,
        drawCount: drawForGame,
        scoreMode: gameScoreMode,
        stockPassLimit: settings.stockPassLimit,
        startingScore,
        spiderSuits: settings.spiderSuits,
      });
      setHasSavedGame(true);
    },
    [newGame, setVariantId],
  );

  const recordCurrentAsLoss = useCallback(() => {
    if (game.status === 'won' || game.status === 'lost' || game.moves === 0) return;
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
  }, [
    game.drawCount,
    game.elapsedMs,
    game.moves,
    game.score,
    game.scoreMode,
    game.status,
    game.variantId,
    isDaily,
    recordGame,
  ]);

  const requestNewGame = useCallback(
    (options?: { seed?: string; daily?: boolean; variantId?: VariantId }) => {
      const switchingVariant =
        Boolean(options?.variantId) && options?.variantId !== game.variantId;
      const midGame =
        game.status === 'playing' &&
        game.moves > 0 &&
        !options?.seed &&
        !options?.daily &&
        !switchingVariant;
      if (midGame) {
        setConfirm({
          message: 'Start a new game? Your current game will be recorded as a loss.',
          onYes: () => {
            recordCurrentAsLoss();
            startGame(options);
          },
        });
        return;
      }
      startGame(options);
    },
    [game.moves, game.status, game.variantId, recordCurrentAsLoss, startGame],
  );

  const requestExit = useCallback(() => {
    setConfirm({
      message: 'Exit to desktop? This will restart Aevanor Solitaire.',
      onYes: () => {
        setConfirm(null);
        setPaused(false);
        setShowWin(false);
        setWinCelebrationActive(false);
        setWinAchievements([]);
        setDealReady(false);
        setBooting(true);
        setBootPct(0);
        startedRef.current = true;
        void (async () => {
          await startGame();
          setDealReady(true);
        })();
      },
    });
  }, [startGame]);

  const handleHint = useCallback(() => {
    if (game.status !== 'playing') return;
    hint();
    const ids = useGameStore.getState().game.hintCardIds;
    if (ids && ids.length > 0) {
      playSound('drop');
      window.setTimeout(() => {
        const current = useGameStore.getState().game;
        if (current.hintCardIds) {
          useGameStore.setState({ game: { ...current, hintCardIds: undefined } });
        }
      }, 1400);
    } else {
      playSound('invalid');
      flashStatus(
        game.variantId === 'klondike'
          ? 'No moves — draw from the stock.'
          : 'No available moves.',
      );
    }
  }, [game.status, game.variantId, hint]);

  const handleAuto = useCallback(() => {
    if (game.variantId === 'spider') {
      flashStatus('Auto-complete is available in Solitaire & FreeCell.');
      return;
    }
    if (game.status !== 'playing') return;

    let movedAny = false;

    const step = () => {
      const state = useGameStore.getState().game;
      if (state.status !== 'playing') return;

      const moves = getAutoCompleteMoves(state);
      if (moves.length === 0) {
        if (!movedAny) {
          flashStatus('No cards can be sent to the foundations right now.');
          playSound('invalid');
        }
        return;
      }

      const m = moves[0];
      if (!useGameStore.getState().move(m.from, m.to, m.cardIds)) {
        if (!movedAny) {
          flashStatus('No cards can be sent to the foundations right now.');
          playSound('invalid');
        }
        return;
      }

      movedAny = true;
      window.setTimeout(step, 110);
    };

    step();
  }, [game.status, game.variantId]);

  const handleDrawCountChange = useCallback(
    (_n: 1 | 3) => {
      if (game.variantId === 'klondike') {
        startGame({ seed: game.seed, daily: isDaily, variantId: 'klondike' });
      }
    },
    [game.seed, game.variantId, isDaily, startGame],
  );

  // Prepare the first deal during boot so the desktop never shows the preview seed.
  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    startedRef.current = true;
    void (async () => {
      const saved = await loadSavedGame();
      if (saved) {
        usedUndoRef.current = saved.usedUndo;
        worryBackRef.current = saved.worryBack;
        setIsDaily(saved.isDaily);
        useGameStore.setState({ game: saved.game, theme });
        setHasSavedGame(true);
        setDealReady(true);
        return;
      }
      await startGame();
      setDealReady(true);
    })();
  }, [hydrated, startGame, theme]);

  useEffect(() => {
    if (paused || game.status !== 'playing') return;
    const id = window.setInterval(() => tick(1000), 1000);
    return () => window.clearInterval(id);
  }, [paused, game.status, tick]);

  useEffect(() => {
    if (game.status !== 'playing') return;
    const id = window.setTimeout(() => {
      void autosaveGame({
        game,
        savedAt: Date.now(),
        usedUndo: usedUndoRef.current,
        worryBack: worryBackRef.current,
        isDaily,
      });
      void syncActiveSave(game, isDaily);
    }, 800);
    return () => window.clearTimeout(id);
  }, [game, isDaily]);

  function handleUndo() {
    usedUndoRef.current = true;
    undo();
  }

  const helpLines =
    game.variantId === 'freecell'
      ? [
          'FreeCell deals all 52 cards face-up across eight columns.',
          'Build down by alternating colors on the tableau.',
          'Use the four free cells to park single cards.',
          'Foundations build up by suit from Ace to King.',
        ]
      : game.variantId === 'spider'
        ? [
            'Spider uses two decks across ten columns.',
            'Build down by rank; only same-suit runs can move together.',
            'Deal from the stock to every column when none are empty.',
            'Complete a King-to-Ace same-suit run to clear it.',
          ]
        : [
            'Solitaire builds foundations Ace to King by suit.',
            'Tableau builds down by alternating colors.',
            'Only Kings may fill empty columns.',
            'Draw from the stock when you need more cards.',
          ];

  if (booting || !dealReady) {
    return (
      <div className="desktop">
        <div
          className="win95-boot"
          onClick={() => {
            if (dealReady) setBooting(false);
            else setBootPct(100);
          }}
          role="presentation"
        >
          <div className="win95-boot__panel">
            <div className="win95-titlebar" style={{ height: 'auto', padding: '4px 8px' }}>
              <span className="win95-titlebar__icon">♠</span>
              <span className="win95-titlebar__label">Aevanor Solitaire</span>
            </div>
            <div style={{ padding: '26px 24px 22px', textAlign: 'center', background: '#c0c0c0' }}>
              <div
                className="win95-pixel"
                style={{
                  fontSize: 30,
                  letterSpacing: 1,
                  color: '#0a3a3a',
                  textShadow: '2px 2px 0 #8fa',
                  marginBottom: 4,
                }}
              >
                AEVANOR
              </div>
              <div style={{ display: 'flex', gap: 5, justifyContent: 'center', margin: '10px 0 18px', fontSize: 26 }}>
                <span>♠</span>
                <span style={{ color: '#c22' }}>♥</span>
                <span style={{ color: '#c22' }}>♦</span>
                <span>♣</span>
              </div>
              <div style={{ fontSize: 11, color: '#333', marginBottom: 6 }}>
                Solitaire, beautifully restored — v3.1
              </div>
              <div className="win95-boot__bar">
                <div className="win95-boot__fill" style={{ width: `${bootPct}%` }} />
              </div>
              <div
                className="win95-pixel"
                style={{ fontSize: 10, color: '#555', marginTop: 8 }}
              >
                loading assets… click to skip
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopShell
        game={game}
        paused={paused}
        isDaily={isDaily || isDailySeed(game.seed)}
        onNewGame={() => requestNewGame()}
        onRestart={() =>
          startGame({
            seed: game.seed,
            daily: isDaily,
            variantId: game.variantId as VariantId,
          })
        }
        onUndo={handleUndo}
        onRedo={redo}
        onHint={handleHint}
        onAuto={handleAuto}
        onResume={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onOpenStats={() => setStatsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHelp={() => setDialog('help')}
        onOpenAbout={() => setDialog('about')}
        onOpenDaily={() => setDialog('daily')}
        onSelectVariant={(id) => requestNewGame({ variantId: id })}
        onHome={requestExit}
        onDrawCountChange={handleDrawCountChange}
      >
        <GameScreen
          game={game}
          paused={paused}
          showWin={showWin}
          winCelebrationActive={winCelebrationActive}
          newAchievements={winAchievements}
          onWinCelebrationComplete={handleWinCelebrationComplete}
          isDaily={isDaily || isDailySeed(game.seed)}
          onRestart={() =>
            startGame({
              seed: game.seed,
              daily: isDaily,
              variantId: game.variantId as VariantId,
            })
          }
          onResume={() => setPaused(false)}
          onNewGame={() => requestNewGame()}
          onHome={requestExit}
        />
      </DesktopShell>

      <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} />
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfirmNewDeal={() => startGame({ seed: game.seed, daily: isDaily })}
      />

      {confirm ? (
        <div className="win95-scrim" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Win95Dialog title="Aevanor Solitaire" onClose={() => setConfirm(null)} size="sm">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.4 }}>
                <span style={{ fontSize: 28 }}>❓</span>
                <span>{confirm.message}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Win95Button
                  className="win95-btn--primary"
                  onClick={() => {
                    const yes = confirm.onYes;
                    setConfirm(null);
                    yes();
                  }}
                >
                  Yes
                </Win95Button>
                <Win95Button onClick={() => setConfirm(null)}>No</Win95Button>
              </div>
            </Win95Dialog>
          </div>
        </div>
      ) : null}

      {dialog === 'help' ? (
        <div className="win95-scrim" onClick={() => setDialog(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Win95Dialog
              title={`How to Play — ${variantLabel(game.variantId)}`}
              onClose={() => setDialog(null)}
              size="lg"
            >
              <div className="win95-inset" style={{ maxHeight: 300, overflow: 'auto', fontSize: 13, lineHeight: 1.55 }}>
                {helpLines.map((line) => (
                  <p key={line} style={{ margin: '0 0 8px' }}>
                    {line}
                  </p>
                ))}
              </div>
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <Win95Button className="win95-btn--primary" onClick={() => setDialog(null)}>
                  OK
                </Win95Button>
              </div>
            </Win95Dialog>
          </div>
        </div>
      ) : null}

      {dialog === 'about' ? (
        <div className="win95-scrim" onClick={() => setDialog(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Win95Dialog title="About Aevanor Solitaire" onClose={() => setDialog(null)} size="sm">
              <div style={{ textAlign: 'center' }}>
                <div
                  className="win95-pixel"
                  style={{ fontSize: 24, color: '#0a3a3a', textShadow: '2px 2px 0 #8fa' }}
                >
                  AEVANOR
                </div>
                <div style={{ fontSize: 12, margin: '6px 0 14px' }}>
                  Solitaire Collection — Version 3.1
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14, fontSize: 22 }}>
                  <span>♠</span>
                  <span style={{ color: '#c22' }}>♥</span>
                  <span style={{ color: '#c22' }}>♦</span>
                  <span>♣</span>
                </div>
                <div className="win95-inset" style={{ textAlign: 'left', fontSize: 12, lineHeight: 1.5 }}>
                  Solitaire · FreeCell · Spider
                  <br />
                  Calm, ad-free, offline-first.
                  <br />
                  <br />
                  A nostalgic restoration of the desktop solitaire everyone remembers.
                </div>
                <div style={{ marginTop: 16 }}>
                  <Win95Button className="win95-btn--primary" onClick={() => setDialog(null)}>
                    OK
                  </Win95Button>
                </div>
              </div>
            </Win95Dialog>
          </div>
        </div>
      ) : null}

      {dialog === 'daily' ? (
        <div className="win95-scrim" onClick={() => setDialog(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Win95Dialog title="Daily Challenge" onClose={() => setDialog(null)} size="sm">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 34, marginBottom: 2 }}>📅</div>
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{dailyDateKey()}</div>
                <div style={{ fontSize: 11, color: '#555', marginBottom: 14 }}>
                  Deal · Solitaire (Draw 1)
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                  <div className="win95-inset" style={{ flex: 1, padding: 8 }}>
                    <div className="win95-pixel" style={{ fontSize: 20, color: '#c9520a' }}>
                      {dailyStreak}
                    </div>
                    <div style={{ fontSize: 10, color: '#555' }}>CURRENT STREAK</div>
                  </div>
                  <div className="win95-inset" style={{ flex: 1, padding: 8 }}>
                    <div className="win95-pixel" style={{ fontSize: 20, color: '#04057a' }}>
                      {dailyBest}
                    </div>
                    <div style={{ fontSize: 10, color: '#555' }}>LONGEST</div>
                  </div>
                </div>
                <Win95Button
                  className="win95-btn--primary"
                  onClick={() => {
                    setDialog(null);
                    startGame({ daily: true });
                  }}
                >
                  ▶ Play Today&apos;s Deal
                </Win95Button>
                {hasSavedGame ? (
                  <div style={{ marginTop: 10, fontSize: 11, color: '#555' }}>
                    Starting daily replaces your current deal.
                  </div>
                ) : null}
              </div>
            </Win95Dialog>
          </div>
        </div>
      ) : null}
    </>
  );
}

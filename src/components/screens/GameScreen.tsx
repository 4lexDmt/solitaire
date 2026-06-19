'use client';

import { Board } from '@/components/board/Board';
import { ReducedMotionWinOverlay } from '@/components/board/ReducedMotionWinOverlay';
import { WinCascadeCanvas } from '@/components/board/WinCascadeCanvas';
import { HUD } from '@/components/hud/HUD';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PausedScreen } from '@/components/screens/PausedScreen';
import { WinScreen } from '@/components/screens/WinScreen';
import type { GameState } from '@/engine/types';
import '@/components/board/board.css';

interface GameScreenProps {
  game: GameState;
  paused: boolean;
  showWin: boolean;
  winCelebrationActive: boolean;
  onWinCelebrationComplete: () => void;
  onMenu: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onRestart: () => void;
  onResume: () => void;
  onNewGame: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  isDaily?: boolean;
}

export function GameScreen({
  game,
  paused,
  showWin,
  winCelebrationActive,
  onWinCelebrationComplete,
  onMenu,
  onUndo,
  onRedo,
  onHint,
  onRestart,
  onResume,
  onNewGame,
  onHome,
  onOpenSettings,
  onOpenStats,
  isDaily,
}: GameScreenProps) {
  const { reducedMotion } = useReducedMotion();

  return (
    <div className="game-screen flex min-h-full flex-1 flex-col">
      <HUD
        game={game}
        onMenu={onMenu}
        onUndo={onUndo}
        onRedo={onRedo}
        onHint={onHint}
        onRestart={onRestart}
      />

      <main className="game-screen__table relative flex flex-1 flex-col overflow-x-auto">
        <Board game={game} />
      </main>

      {winCelebrationActive && !reducedMotion ? (
        <WinCascadeCanvas
          active
          game={game}
          onComplete={onWinCelebrationComplete}
        />
      ) : null}

      {winCelebrationActive && reducedMotion ? (
        <ReducedMotionWinOverlay
          active
          game={game}
          onDismiss={onWinCelebrationComplete}
        />
      ) : null}

      <PausedScreen
        open={paused}
        onResume={onResume}
        onRestart={onRestart}
        onHome={onHome}
        onOpenSettings={onOpenSettings}
        onOpenStats={onOpenStats}
      />

      <WinScreen
        open={showWin}
        game={game}
        isDaily={isDaily}
        onNewGame={onNewGame}
        onHome={onHome}
      />
    </div>
  );
}

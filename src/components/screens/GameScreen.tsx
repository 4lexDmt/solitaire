'use client';

import { LiveRegion } from '@/components/a11y/LiveRegion';
import { Board } from '@/components/board/Board';
import { ReducedMotionWinOverlay } from '@/components/board/ReducedMotionWinOverlay';
import { WinCascadeCanvas } from '@/components/board/WinCascadeCanvas';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { LostScreen } from '@/components/screens/LostScreen';
import { WinScreen } from '@/components/screens/WinScreen';
import type { AchievementId } from '@/state/achievements';
import { useSettingsStore } from '@/state/settings';
import type { GameState } from '@/engine/types';
import '@/components/board/board.css';

interface GameScreenProps {
  game: GameState;
  paused: boolean;
  showWin: boolean;
  winCelebrationActive: boolean;
  onWinCelebrationComplete: () => void;
  onRestart: () => void;
  onResume: () => void;
  onNewGame: () => void;
  onHome: () => void;
  isDaily?: boolean;
  newAchievements?: AchievementId[];
}

/** Board + overlays rendered inside the Win9x felt well. */
export function GameScreen({
  game,
  paused,
  showWin,
  winCelebrationActive,
  onWinCelebrationComplete,
  onRestart,
  onNewGame,
  onHome,
  isDaily,
  newAchievements = [],
}: GameScreenProps) {
  const { reducedMotion } = useReducedMotion();
  const motionEnabled = useSettingsStore((s) => s.motionEnabled);
  const showCascade = winCelebrationActive && motionEnabled && !reducedMotion;
  const showReducedWin = winCelebrationActive && (!motionEnabled || reducedMotion) && !showWin;

  return (
    <div className="game-screen" style={{ height: '100%' }}>
      <LiveRegion
        message={game.status === 'won' ? 'Game won' : game.status === 'lost' ? 'No moves left' : ''}
        politeness="assertive"
      />
      <main className="game-screen__table">
        <Board game={game} />
      </main>

      {showCascade ? (
        <WinCascadeCanvas active game={game} onComplete={onWinCelebrationComplete} />
      ) : null}
      {showReducedWin ? (
        <ReducedMotionWinOverlay
          active
          game={game}
          onDismiss={onWinCelebrationComplete}
        />
      ) : null}

      <WinScreen
        open={showWin}
        game={game}
        isDaily={isDaily}
        newAchievements={newAchievements}
        onNewGame={onNewGame}
        onReplayDeal={onRestart}
        onHome={onHome}
      />

      <LostScreen
        open={game.status === 'lost' && !paused && !showWin && !winCelebrationActive}
        elapsedMs={game.elapsedMs}
        moves={game.moves}
        onNewGame={onNewGame}
        onHome={onHome}
        onRestart={onRestart}
      />
    </div>
  );
}

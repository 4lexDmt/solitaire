'use client';

import { HintButton } from '@/components/hud/HintButton';
import { MenuButton } from '@/components/hud/MenuButton';
import { MoveCounter } from '@/components/hud/MoveCounter';
import { RedoButton } from '@/components/hud/RedoButton';
import { RestartButton } from '@/components/hud/RestartButton';
import { ScoreDisplay } from '@/components/hud/ScoreDisplay';
import { TimerDisplay } from '@/components/hud/TimerDisplay';
import { UndoButton } from '@/components/hud/UndoButton';
import { useSettingsStore } from '@/state/settings';
import type { GameState } from '@/engine/types';

interface HUDProps {
  game: GameState;
  onMenu: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onRestart: () => void;
}

export function HUD({
  game,
  onMenu,
  onUndo,
  onRedo,
  onHint,
  onRestart,
}: HUDProps) {
  const showTimer = useSettingsStore((s) => s.showTimer);
  const scoreMode = useSettingsStore((s) => s.scoreMode);

  return (
    <header className="game-screen__hud">
      <div className="flex items-center gap-2">
        <MenuButton onClick={onMenu} />
        <RestartButton onClick={onRestart} />
      </div>

      <div className="game-screen__stats">
        <TimerDisplay elapsedMs={game.elapsedMs} visible={showTimer} />
        <MoveCounter moves={game.moves} />
        <ScoreDisplay
          score={game.score}
          scoreMode={scoreMode}
          visible={scoreMode !== 'none'}
        />
      </div>

      <div className="flex items-center gap-2">
        <UndoButton onClick={onUndo} disabled={game.history.length === 0} />
        <RedoButton onClick={onRedo} disabled={game.future.length === 0} />
        <HintButton onClick={onHint} disabled={game.status !== 'playing'} />
      </div>
    </header>
  );
}

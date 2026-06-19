'use client';

import { HintButton } from '@/components/hud/HintButton';
import { MenuButton } from '@/components/hud/MenuButton';
import { MoveCounter } from '@/components/hud/MoveCounter';
import { RedoButton } from '@/components/hud/RedoButton';
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
}

export function HUD({
  game,
  onMenu,
  onUndo,
  onRedo,
  onHint,
}: HUDProps) {
  const showTimer = useSettingsStore((s) => s.showTimer);
  const scoreMode = useSettingsStore((s) => s.scoreMode);

  return (
    <header className="hud-bar">
      <div className="hud-bar__group">
        <MenuButton onClick={onMenu} />
      </div>

      <div className="hud-bar__stats">
        <TimerDisplay elapsedMs={game.elapsedMs} visible={showTimer} />
        <MoveCounter moves={game.moves} />
        <ScoreDisplay
          score={game.score}
          scoreMode={scoreMode}
          visible={scoreMode !== 'none'}
        />
      </div>

      <div className="hud-bar__group">
        <UndoButton onClick={onUndo} disabled={game.history.length === 0} />
        <RedoButton onClick={onRedo} disabled={game.future.length === 0} />
        <HintButton onClick={onHint} disabled={game.status !== 'playing'} />
      </div>
    </header>
  );
}

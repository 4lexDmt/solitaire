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
  disabled?: boolean;
}

export function HUD({
  game,
  onMenu,
  onUndo,
  onRedo,
  onHint,
  disabled = false,
}: HUDProps) {
  const showTimer = useSettingsStore((s) => s.showTimer);
  const scoreMode = game.scoreMode;
  const controlsLocked =
    disabled || game.status === 'won' || game.status === 'lost';

  return (
    <header className="hud-bar" aria-hidden={controlsLocked || undefined}>
      <div className="hud-bar__group">
        <MenuButton onClick={onMenu} disabled={controlsLocked} />
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
        <UndoButton
          onClick={onUndo}
          disabled={controlsLocked || game.history.length === 0}
        />
        <RedoButton
          onClick={onRedo}
          disabled={controlsLocked || game.future.length === 0}
        />
        <HintButton onClick={onHint} disabled={controlsLocked || game.status !== 'playing'} />
      </div>
    </header>
  );
}

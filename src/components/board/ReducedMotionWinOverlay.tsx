'use client';

import { Z } from '@/config/tokens';
import { formatDuration, formatNumber } from '@/lib/format';
import type { GameState } from '@/engine/types';
import { TrophyIcon } from '@/components/ui/icons';
import { motion } from 'motion/react';

interface ReducedMotionWinOverlayProps {
  active: boolean;
  game: GameState;
  onDismiss: () => void;
}

/** Static celebratory overlay replacing canvas cascade — SPEC §8.7 */
export function ReducedMotionWinOverlay({
  active,
  game,
  onDismiss,
}: ReducedMotionWinOverlayProps) {
  if (!active) return null;

  return (
    <motion.button
      type="button"
      className="reduced-win-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z.cascade,
        border: 'none',
        cursor: 'pointer',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onDismiss}
      aria-label="You won. Tap to continue."
    >
      <div className="reduced-win-overlay__panel">
        <div className="reduced-win-overlay__icon">
          <TrophyIcon size={40} />
        </div>
        <h2 className="reduced-win-overlay__title">You won</h2>
        <p className="reduced-win-overlay__stats">
          {formatDuration(game.elapsedMs)} · {formatNumber(game.moves)} moves
        </p>
        <p className="reduced-win-overlay__hint">Tap to continue</p>
      </div>
    </motion.button>
  );
}

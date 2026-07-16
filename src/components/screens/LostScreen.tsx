'use client';

import { Win95Button, Win95Dialog } from '@/components/win95/primitives';
import { formatDuration, formatNumber } from '@/lib/format';

interface LostScreenProps {
  open: boolean;
  elapsedMs?: number;
  moves?: number;
  onRestart: () => void;
  onNewGame: () => void;
  onHome: () => void;
}

export function LostScreen({
  open,
  elapsedMs = 0,
  moves = 0,
  onRestart,
  onNewGame,
  onHome,
}: LostScreenProps) {
  if (!open) return null;

  return (
    <div className="win95-scrim">
      <Win95Dialog title="Aevanor Solitaire" onClose={onRestart} size="sm">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, lineHeight: 1.4 }}>
          <span style={{ fontSize: 28 }}>❓</span>
          <span>
            No moves left. Timer {formatDuration(elapsedMs)} · {formatNumber(moves)} moves.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
          <Win95Button className="win95-btn--primary" onClick={onRestart}>
            Restart
          </Win95Button>
          <Win95Button onClick={onNewGame}>New Game</Win95Button>
          <Win95Button onClick={onHome}>Close</Win95Button>
        </div>
      </Win95Dialog>
    </div>
  );
}

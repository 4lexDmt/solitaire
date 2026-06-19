'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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
  return (
    <Modal open={open} onClose={onRestart} title="No moves left" variant="celebration">
      <p className="modal-subtitle mb-[18px]">
        The deal is stuck. Timer {formatDuration(elapsedMs)} · {formatNumber(moves)} moves
      </p>
      <div className="flex flex-col gap-2">
        <Button fullWidth onClick={onRestart}>
          Restart deal
        </Button>
        <Button fullWidth variant="ghost" onClick={onNewGame}>
          New game
        </Button>
        <Button fullWidth variant="ghost" onClick={onHome}>
          Home
        </Button>
      </div>
    </Modal>
  );
}

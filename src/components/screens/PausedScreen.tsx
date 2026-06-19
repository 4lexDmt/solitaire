'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDuration, formatNumber } from '@/lib/format';

interface PausedScreenProps {
  open: boolean;
  elapsedMs?: number;
  moves?: number;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

export function PausedScreen({
  open,
  elapsedMs = 0,
  moves = 0,
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
}: PausedScreenProps) {
  return (
    <Modal open={open} onClose={onResume} title="Paused" variant="celebration">
      <p className="modal-subtitle mb-[18px]">
        Timer {formatDuration(elapsedMs)} · {formatNumber(moves)} moves
      </p>
      <div className="flex flex-col gap-2">
        <Button fullWidth onClick={onResume}>
          Resume
        </Button>
        <Button fullWidth variant="ghost" onClick={onRestart}>
          Restart deal
        </Button>
        <Button fullWidth variant="ghost" onClick={onOpenSettings}>
          Settings
        </Button>
        <Button fullWidth variant="ghost" onClick={onHome}>
          Home
        </Button>
      </div>
    </Modal>
  );
}

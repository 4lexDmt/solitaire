'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface PausedScreenProps {
  open: boolean;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
}

export function PausedScreen({
  open,
  onResume,
  onRestart,
  onHome,
  onOpenSettings,
  onOpenStats,
}: PausedScreenProps) {
  return (
    <Modal open={open} onClose={onResume} title="Paused">
      <p className="mb-4 font-ui text-hud text-ui-text-muted">
        Take your time — your game is saved automatically.
      </p>
      <div className="flex flex-col gap-2">
        <Button fullWidth onClick={onResume}>
          Resume
        </Button>
        <Button fullWidth variant="secondary" onClick={onOpenStats}>
          Statistics
        </Button>
        <Button fullWidth variant="secondary" onClick={onOpenSettings}>
          Settings
        </Button>
        <Button fullWidth variant="secondary" onClick={onRestart}>
          Restart
        </Button>
        <Button fullWidth variant="ghost" onClick={onHome}>
          Home
        </Button>
      </div>
    </Modal>
  );
}

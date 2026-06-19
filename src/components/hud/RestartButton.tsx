'use client';

import { IconButton } from '@/components/ui/IconButton';
import { NewGameIcon } from '@/components/ui/icons';

interface RestartButtonProps {
  onClick: () => void;
}

export function RestartButton({ onClick }: RestartButtonProps) {
  return (
    <IconButton label="Restart game" tone="hud" onClick={onClick}>
      <NewGameIcon size={21} />
    </IconButton>
  );
}

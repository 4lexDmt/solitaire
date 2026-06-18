'use client';

import { IconButton } from '@/components/ui/IconButton';
import { RestartIcon } from '@/components/ui/icons';

interface RestartButtonProps {
  onClick: () => void;
}

export function RestartButton({ onClick }: RestartButtonProps) {
  return (
    <IconButton label="Restart game" onClick={onClick}>
      <RestartIcon size={20} />
    </IconButton>
  );
}

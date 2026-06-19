'use client';

import { IconButton } from '@/components/ui/IconButton';
import { RedoIcon } from '@/components/ui/icons';

interface RedoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function RedoButton({ onClick, disabled }: RedoButtonProps) {
  return (
    <IconButton label="Redo" tone="hud" onClick={onClick} disabled={disabled}>
      <RedoIcon size={21} />
    </IconButton>
  );
}

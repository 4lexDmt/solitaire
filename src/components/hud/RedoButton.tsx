'use client';

import { IconButton } from '@/components/ui/IconButton';
import { RedoIcon } from '@/components/ui/icons';

interface RedoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function RedoButton({ onClick, disabled }: RedoButtonProps) {
  return (
    <IconButton label="Redo" onClick={onClick} disabled={disabled}>
      <RedoIcon size={20} />
    </IconButton>
  );
}

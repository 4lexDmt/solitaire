'use client';

import { IconButton } from '@/components/ui/IconButton';
import { UndoIcon } from '@/components/ui/icons';

interface UndoButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function UndoButton({ onClick, disabled }: UndoButtonProps) {
  return (
    <IconButton label="Undo" tone="hud" onClick={onClick} disabled={disabled}>
      <UndoIcon size={21} />
    </IconButton>
  );
}

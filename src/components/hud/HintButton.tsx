'use client';

import { IconButton } from '@/components/ui/IconButton';
import { HintIcon } from '@/components/ui/icons';

interface HintButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function HintButton({ onClick, disabled }: HintButtonProps) {
  return (
    <IconButton label="Hint" onClick={onClick} disabled={disabled}>
      <HintIcon size={20} />
    </IconButton>
  );
}

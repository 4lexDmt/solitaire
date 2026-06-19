'use client';

import { IconButton } from '@/components/ui/IconButton';
import { HintIcon } from '@/components/ui/icons';

interface HintButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function HintButton({ onClick, disabled }: HintButtonProps) {
  return (
    <IconButton label="Hint" tone="hud" onClick={onClick} disabled={disabled}>
      <HintIcon size={21} />
    </IconButton>
  );
}

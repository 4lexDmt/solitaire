'use client';

import { IconButton } from '@/components/ui/IconButton';
import { MenuIcon } from '@/components/ui/icons';

interface MenuButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function MenuButton({ onClick, disabled }: MenuButtonProps) {
  return (
    <IconButton label="Open menu" tone="hud" onClick={onClick} disabled={disabled}>
      <MenuIcon size={21} />
    </IconButton>
  );
}

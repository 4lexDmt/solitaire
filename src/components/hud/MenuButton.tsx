'use client';

import { IconButton } from '@/components/ui/IconButton';
import { MenuIcon } from '@/components/ui/icons';

interface MenuButtonProps {
  onClick: () => void;
}

export function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <IconButton label="Open menu" tone="hud" onClick={onClick}>
      <MenuIcon size={21} />
    </IconButton>
  );
}

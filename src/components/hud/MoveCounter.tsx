'use client';

import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

interface MoveCounterProps {
  moves: number;
  className?: string;
}

export function MoveCounter({ moves, className }: MoveCounterProps) {
  return (
    <div
      className={cn(
        'font-ui text-hud font-medium tabular-nums text-ui-text',
        className,
      )}
      aria-label={`${moves} moves`}
    >
      {formatNumber(moves)} moves
    </div>
  );
}

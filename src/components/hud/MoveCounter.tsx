'use client';

import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

interface MoveCounterProps {
  moves: number;
  className?: string;
}

export function MoveCounter({ moves, className }: MoveCounterProps) {
  return (
    <div className={cn('hud-stat', className)} aria-label={`${moves} moves`}>
      <div className="hud-stat__value">{formatNumber(moves)}</div>
      <div className="hud-stat__label">Moves</div>
    </div>
  );
}

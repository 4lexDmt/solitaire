'use client';

import { formatDuration } from '@/lib/format';
import { cn } from '@/lib/cn';

interface TimerDisplayProps {
  elapsedMs: number;
  visible?: boolean;
  className?: string;
}

export function TimerDisplay({ elapsedMs, visible = true, className }: TimerDisplayProps) {
  if (!visible) return null;

  return (
    <div
      className={cn('hud-stat', className)}
      aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
    >
      <div className="hud-stat__value">{formatDuration(elapsedMs)}</div>
      <div className="hud-stat__label">Time</div>
    </div>
  );
}

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
      className={cn(
        'font-ui text-hud font-medium tabular-nums text-accent-text drop-shadow-sm',
        className,
      )}
      aria-label={`Elapsed time ${formatDuration(elapsedMs)}`}
    >
      {formatDuration(elapsedMs)}
    </div>
  );
}

'use client';

import type { ScoreMode } from '@/engine/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/cn';

interface ScoreDisplayProps {
  score: number;
  scoreMode?: ScoreMode;
  visible?: boolean;
  className?: string;
}

function formatScore(score: number, scoreMode: ScoreMode): string {
  if (scoreMode === 'vegas') {
    const prefix = score < 0 ? '-$' : '$';
    return `${prefix}${formatNumber(Math.abs(score))}`;
  }
  return formatNumber(score);
}

export function ScoreDisplay({
  score,
  scoreMode = 'standard',
  visible = true,
  className,
}: ScoreDisplayProps) {
  if (!visible) return null;

  const label = scoreMode === 'vegas' ? 'Bankroll' : 'Score';

  return (
    <div
      className={cn(
        'font-ui text-hud font-medium tabular-nums text-ui-text',
        className,
      )}
      aria-label={`${label} ${score}`}
    >
      {formatScore(score, scoreMode)}
    </div>
  );
}

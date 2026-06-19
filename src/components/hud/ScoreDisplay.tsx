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
      className={cn('hud-stat', className)}
      aria-label={`${label} ${score}`}
    >
      <div className="hud-stat__value">{formatScore(score, scoreMode)}</div>
      <div className="hud-stat__label">{label}</div>
    </div>
  );
}

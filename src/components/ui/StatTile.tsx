'use client';

import { cn } from '@/lib/cn';

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export function StatTile({ label, value, hint, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-ui bg-ui-surface-2 px-3 py-3.5',
        className,
      )}
    >
      <div className="font-ui text-[22px] font-bold tabular-nums tracking-[-0.02em] text-ui-text">
        {value}
      </div>
      <div className="mt-0.5 font-ui text-[10px] font-medium uppercase tracking-[0.05em] text-ui-text-muted">
        {label}
      </div>
      {hint ? (
        <div className="mt-1 font-ui text-xs text-ui-text-muted">{hint}</div>
      ) : null}
    </div>
  );
}

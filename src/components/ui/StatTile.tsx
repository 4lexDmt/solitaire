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
        'rounded-ui bg-ui-surface-2 px-4 py-3',
        className,
      )}
    >
      <div className="font-ui text-sm text-ui-text-muted">{label}</div>
      <div className="mt-1 font-ui text-xl font-semibold tabular-nums text-ui-text">
        {value}
      </div>
      {hint ? (
        <div className="mt-1 font-ui text-sm text-ui-text-muted">{hint}</div>
      ) : null}
    </div>
  );
}

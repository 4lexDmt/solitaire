'use client';

import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: ToggleProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start justify-between gap-4 rounded-ui px-1 py-2',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-ui text-hud text-ui-text">{label}</span>
        {description ? (
          <span className="font-ui text-sm text-ui-text-muted">{description}</span>
        ) : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition-colors duration-press',
          checked ? 'bg-accent' : 'bg-ui-surface-2',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-card-resting transition-transform duration-press',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  );
}

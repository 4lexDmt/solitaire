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
        'flex cursor-pointer items-center justify-between gap-4 py-[13px]',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="font-ui text-sm font-medium text-ui-text">{label}</span>
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
          'relative h-[25px] w-[42px] shrink-0 rounded-full transition-colors duration-press',
          checked ? 'bg-accent' : 'bg-[color-mix(in_srgb,var(--ui-text)_16%,transparent)]',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        )}
      >
        <span
          className={cn(
            'absolute top-[2.5px] left-[2.5px] h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-press',
            checked && 'translate-x-[17px]',
          )}
        />
      </button>
    </label>
  );
}

'use client';

import { cn } from '@/lib/cn';

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string | number> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string;
}

export function SegmentedControl<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label}>
      <div className="flex gap-[3px] rounded-[11px] bg-ui-surface-2 p-[3px]">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              disabled={option.disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                'min-h-10 flex-1 rounded-[9px] px-1.5 font-ui text-xs font-semibold transition duration-press',
                selected
                  ? 'bg-ui-surface text-ui-text shadow-[0_1px_2px_rgba(0,0,0,0.12)]'
                  : 'text-ui-text-muted hover:text-ui-text',
                option.disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

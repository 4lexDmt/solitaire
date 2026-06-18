'use client';

import { cn } from '@/lib/cn';

interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
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
      <div className="flex rounded-ui bg-ui-surface-2 p-1">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                'min-h-10 flex-1 rounded-[10px] px-3 font-ui text-sm font-semibold transition duration-press',
                selected
                  ? 'bg-ui-surface text-ui-text shadow-card-resting'
                  : 'text-ui-text-muted hover:text-ui-text',
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

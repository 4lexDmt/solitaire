'use client';

import { cn } from '@/lib/cn';
import type { ThemeId } from '@/config/tokens';

const THEME_SWATCHES: Record<
  ThemeId,
  { center: string; edge: string; label: string; description: string }
> = {
  heritage: {
    center: '#1C7A52',
    edge: '#0C4A30',
    label: 'Heritage',
    description: 'Warm felt · default',
  },
  midnight: {
    center: '#15323B',
    edge: '#0A1A1F',
    label: 'Midnight',
    description: 'Low-light dark',
  },
  studio: {
    center: '#2E9E86',
    edge: '#26876F',
    label: 'Studio',
    description: 'Modern bright',
  },
};

interface ThemeSwatchProps {
  theme: ThemeId;
  selected?: boolean;
  onSelect?: () => void;
  layout?: 'grid' | 'row';
}

export function ThemeSwatch({
  theme,
  selected,
  onSelect,
  layout = 'grid',
}: ThemeSwatchProps) {
  const swatch = THEME_SWATCHES[theme];

  if (layout === 'row') {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${swatch.label} theme`}
        className={cn(
          'flex w-full items-center gap-3.5 rounded-[14px] p-2.5 text-left transition duration-press',
          selected
            ? 'border-2 border-accent bg-ui-surface-2'
            : 'border-2 border-transparent bg-ui-surface-2 hover:bg-ui-surface',
        )}
      >
        <span
          className="relative h-[54px] w-[76px] shrink-0 overflow-hidden rounded-[10px]"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${swatch.center}, ${swatch.edge})`,
          }}
        >
          <span
            className="absolute left-3.5 top-4 h-[31px] w-[22px] rounded-[3px] bg-[#FBF8F1] shadow-card-resting"
            aria-hidden
          />
          <span
            className="absolute left-10 top-4 h-[31px] w-[22px] rounded-[3px] bg-[#FBF8F1] shadow-card-resting"
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-ui text-[15px] font-semibold text-ui-text">
            {swatch.label}
          </span>
          <span className="mt-0.5 block font-ui text-[11.5px] text-ui-text-muted">
            {swatch.description}
          </span>
        </span>
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
            selected ? 'border-accent' : 'border-ui-text-muted',
          )}
        >
          {selected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          ) : null}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${swatch.label} theme`}
      className={cn(
        'flex min-h-11 flex-col items-center gap-2 rounded-ui p-2 transition duration-press',
        selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-ui-surface' : 'hover:bg-ui-surface-2',
      )}
    >
      <span
        className="h-12 w-full rounded-[10px] shadow-card-resting"
        style={{
          background: `radial-gradient(circle at 50% 35%, ${swatch.center}, ${swatch.edge})`,
        }}
      />
      <span className="font-ui text-sm font-medium text-ui-text">{swatch.label}</span>
    </button>
  );
}

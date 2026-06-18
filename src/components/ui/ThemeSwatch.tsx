'use client';

import { cn } from '@/lib/cn';
import type { ThemeId } from '@/config/tokens';

const THEME_SWATCHES: Record<ThemeId, { center: string; edge: string; label: string }> = {
  heritage: { center: '#1C7A52', edge: '#0C4A30', label: 'Heritage' },
  midnight: { center: '#15323B', edge: '#0A1A1F', label: 'Midnight' },
  studio: { center: '#2E9E86', edge: '#26876F', label: 'Studio' },
};

interface ThemeSwatchProps {
  theme: ThemeId;
  selected?: boolean;
  onSelect?: () => void;
}

export function ThemeSwatch({ theme, selected, onSelect }: ThemeSwatchProps) {
  const swatch = THEME_SWATCHES[theme];

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

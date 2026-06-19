'use client';

import { ThemeSwatch } from '@/components/ui/ThemeSwatch';
import { THEMES, type ThemeId } from '@/config/tokens';
import { useSettingsStore } from '@/state/settings';
import { useGameStore } from '@/state/store';
import { cn } from '@/lib/cn';

interface ThemePickerProps {
  compact?: boolean;
  layout?: 'grid' | 'list';
}

export function ThemePicker({ compact, layout = 'grid' }: ThemePickerProps) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setGameTheme = useGameStore((s) => s.setTheme);

  function selectTheme(next: ThemeId) {
    setTheme(next);
    setGameTheme(next);
  }

  if (layout === 'list') {
    return (
      <div className="flex flex-col gap-2.5">
        {THEMES.map((id) => (
          <ThemeSwatch
            key={id}
            theme={id}
            selected={theme === id}
            onSelect={() => selectTheme(id)}
            layout="row"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'panel-card p-4',
        compact && 'p-3',
      )}
    >
      {!compact ? (
        <h3 className="mb-4 font-ui text-[19px] font-bold tracking-[-0.01em] text-ui-text">
          Theme
        </h3>
      ) : null}
      <div className="grid grid-cols-3 gap-2">
        {THEMES.map((id) => (
          <ThemeSwatch
            key={id}
            theme={id}
            selected={theme === id}
            onSelect={() => selectTheme(id)}
          />
        ))}
      </div>
    </div>
  );
}

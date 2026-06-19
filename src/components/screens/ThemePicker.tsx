'use client';

import { ThemeSwatch } from '@/components/ui/ThemeSwatch';
import { THEMES, type ThemeId } from '@/config/tokens';
import { useSettingsStore } from '@/state/settings';
import { useGameStore } from '@/state/store';
import { cn } from '@/lib/cn';

interface ThemePickerProps {
  compact?: boolean;
}

export function ThemePicker({ compact }: ThemePickerProps) {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setGameTheme = useGameStore((s) => s.setTheme);

  function selectTheme(next: ThemeId) {
    setTheme(next);
    setGameTheme(next);
  }

  return (
    <div
      className={cn(
        'surface-panel p-4',
        compact && 'p-3',
      )}
    >
      {!compact ? (
        <h3 className="mb-3 font-ui text-hud font-semibold text-ui-text">Table theme</h3>
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

"use client";

import { THEMES, type ThemeId } from "@/config/tokens";

const THEME_LABELS: Record<ThemeId, string> = {
  heritage: "Heritage",
  midnight: "Midnight",
  studio: "Studio",
};

type ThemeToggleProps = {
  theme?: ThemeId;
  onThemeChange?: (theme: ThemeId) => void;
};

export function ThemeToggle({
  theme: controlledTheme,
  onThemeChange,
}: ThemeToggleProps) {
  const theme = controlledTheme ?? "heritage";

  function cycleTheme() {
    const index = THEMES.indexOf(theme);
    const next = THEMES[(index + 1) % THEMES.length];
    onThemeChange?.(next);
  }

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="min-h-11 min-w-11 rounded-ui bg-ui-surface px-4 py-2 text-button text-ui-text shadow-card-resting transition-colors duration-press ease-standard hover:bg-ui-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label={`Current theme: ${THEME_LABELS[theme]}. Click to change theme.`}
    >
      {THEME_LABELS[theme]}
    </button>
  );
}

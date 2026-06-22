'use client';

import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CalendarIcon, FlameIcon, StatsIcon, SettingsIcon } from '@/components/ui/icons';
import { SuitGlyph } from '@/assets/cards/suits';
import { BRAND } from '@/config/brand';
import { useClientDailyLabel } from '@/hooks/useClientDailyDate';
import { dailyStreakMessage } from '@/lib/stats-copy';
import { useStatsStore } from '@/state/stats';

interface HomeScreenProps {
  onNewGame: () => void;
  onDailyChallenge: () => void;
  onResume?: () => void;
  hasSavedGame?: boolean;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export function HomeScreen({
  onNewGame,
  onDailyChallenge,
  onResume,
  hasSavedGame,
  onOpenStats,
  onOpenSettings,
}: HomeScreenProps) {
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const label = useClientDailyLabel();

  return (
    <div className="home-screen">
      <header className="home-screen__toolbar">
        <button
          type="button"
          className="home-screen__toolbar-btn"
          onClick={onOpenStats}
          aria-label="Statistics"
        >
          <StatsIcon size={28} />
        </button>
        <button
          type="button"
          className="home-screen__toolbar-btn"
          onClick={onOpenSettings}
          aria-label="Settings"
        >
          <SettingsIcon size={28} />
        </button>
      </header>

      <div className="home-screen__hero">
        <div
          className="mb-1"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}
        >
          <SuitGlyph suit="spades" size={62} className="text-[#FBF8F1]" />
        </div>
        <h1 className="home-screen__wordmark">{BRAND.gameName}</h1>
        <p className="home-screen__tagline">{BRAND.tagline}</p>
      </div>

      <div className="panel-card home-screen__actions">
        <Button fullWidth onClick={onNewGame}>
          New Game
        </Button>
        {hasSavedGame && onResume ? (
          <Button fullWidth variant="ghost" onClick={onResume}>
            Resume
          </Button>
        ) : null}

        <SegmentedControl
          label="Game variant"
          value="klondike"
          onChange={() => {}}
          options={[
            { value: 'klondike', label: 'Klondike' },
            { value: 'freecell', label: 'FreeCell', disabled: true },
            { value: 'spider', label: 'Spider', disabled: true },
          ]}
        />

        <button
          type="button"
          className="home-screen__daily-row w-full text-left"
          onClick={onDailyChallenge}
        >
          <CalendarIcon size={19} className="shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <div className="home-screen__daily-label">Daily Challenge</div>
            <div className="font-ui text-[12.5px] font-semibold text-ui-text">
              {label}
            </div>
            <div className="font-ui text-[11px] text-ui-text-muted">
              {dailyStreakMessage(dailyStreak).toLowerCase()}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 font-ui text-[13px] font-semibold text-accent">
            <FlameIcon size={14} />
            {dailyStreak}
          </div>
        </button>
      </div>
    </div>
  );
}

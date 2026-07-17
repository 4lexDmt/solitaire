'use client';

import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { CalendarIcon, FlameIcon, StatsIcon, SettingsIcon } from '@/components/ui/icons';
import { SuitGlyph } from '@/assets/cards/suits';
import { BRAND } from '@/config/brand';
import type { SpiderSuits } from '@/engine/variant';
import type { VariantId } from '@/engine/variants';
import { useClientDailyLabel } from '@/hooks/useClientDailyDate';
import { dailyStreakMessage } from '@/lib/stats-copy';
import { useSettingsStore } from '@/state/settings';
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
  const variantId = useSettingsStore((s) => s.variantId);
  const setVariantId = useSettingsStore((s) => s.setVariantId);
  const scoreMode = useSettingsStore((s) => s.scoreMode);
  const setScoreMode = useSettingsStore((s) => s.setScoreMode);
  const spiderSuits = useSettingsStore((s) => s.spiderSuits);
  const setSpiderSuits = useSettingsStore((s) => s.setSpiderSuits);

  const onVariantChange = (next: VariantId) => {
    setVariantId(next);
    if (next !== 'klondike' && scoreMode === 'vegas') {
      setScoreMode('standard');
    }
  };

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

        <SegmentedControl<VariantId>
          label="Game variant"
          value={variantId}
          onChange={onVariantChange}
          options={[
            { value: 'klondike', label: 'Solitaire' },
            { value: 'freecell', label: 'FreeCell' },
            { value: 'spider', label: 'Spider' },
            { value: 'pyramid', label: 'Pyramid' },
            { value: 'tripeaks', label: 'TriPeaks' },
            { value: 'yukon', label: 'Yukon' },
            { value: 'golf', label: 'Golf' },
          ]}
        />

        {variantId === 'spider' ? (
          <SegmentedControl<SpiderSuits>
            label="Spider suits"
            value={spiderSuits}
            onChange={setSpiderSuits}
            options={[
              { value: 1, label: '1 Suit' },
              { value: 2, label: '2 Suits' },
              { value: 4, label: '4 Suits' },
            ]}
          />
        ) : null}

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

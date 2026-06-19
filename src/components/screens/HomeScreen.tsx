'use client';

import { Button } from '@/components/ui/Button';
import { CalendarIcon, PlayIcon, StatsIcon, SettingsIcon } from '@/components/ui/icons';
import { DailyChallengeBanner } from '@/components/screens/DailyChallengeBanner';
import { ThemePicker } from '@/components/screens/ThemePicker';
import { PwaInstallPrompt } from '@/components/PwaInstallPrompt';
import { BRAND } from '@/config/brand';
import { useStatsStore, winRate } from '@/state/stats';
import { winRateMessage } from '@/lib/stats-copy';

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
  const stats = useStatsStore();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-board-pad py-4">
        <div>
          <h1 className="on-baize-title font-ui text-title font-semibold">
            {BRAND.name}
          </h1>
          <p className="mt-0.5 font-ui text-sm text-baize-text-muted">
            {BRAND.product}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onOpenStats} aria-label="Statistics">
            <StatsIcon size={18} />
          </Button>
          <Button variant="ghost" onClick={onOpenSettings} aria-label="Settings">
            <SettingsIcon size={18} />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center gap-6 px-board-pad pb-10">
        <div className="w-full max-w-md space-y-4">
          <PwaInstallPrompt />
          <DailyChallengeBanner onPlay={onDailyChallenge} />

          <div className="surface-panel p-5">
            <p className="font-ui text-hud text-ui-text-muted">
              {winRateMessage(winRate(stats.gamesWon, stats.gamesPlayed), stats.gamesPlayed)}
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <Button fullWidth onClick={onNewGame}>
                <PlayIcon size={18} />
                New Game
              </Button>
              {hasSavedGame && onResume ? (
                <Button fullWidth variant="secondary" onClick={onResume}>
                  Resume Game
                </Button>
              ) : null}
              <Button fullWidth variant="secondary" onClick={onDailyChallenge}>
                <CalendarIcon size={18} />
                Daily Challenge
              </Button>
            </div>
          </div>

          <ThemePicker compact />
        </div>
      </main>
    </div>
  );
}

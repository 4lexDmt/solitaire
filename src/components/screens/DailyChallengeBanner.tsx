'use client';

import { DailyLeaderboard } from '@/components/auth/DailyLeaderboard';
import { Button } from '@/components/ui/Button';
import { CalendarIcon, FlameIcon } from '@/components/ui/icons';
import { useClientDailyDateKey, useClientDailyLabel } from '@/hooks/useClientDailyDate';
import { useStatsStore } from '@/state/stats';

interface DailyChallengeBannerProps {
  onPlay: () => void;
}

export function DailyChallengeBanner({ onPlay }: DailyChallengeBannerProps) {
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const label = useClientDailyLabel();
  const dateKey = useClientDailyDateKey();

  return (
    <div className="daily-banner">
      <div className="daily-banner__icon" aria-hidden>
        <CalendarIcon size={18} />
      </div>

      <div className="daily-banner__content min-w-0 flex-1">
        <div className="daily-banner__label">Daily Challenge</div>
        <div className="daily-banner__date">{label}</div>
        <div className="daily-banner__subtitle">
          A solvable deal, the same for everyone today.
        </div>
      </div>

      <div className="daily-banner__streak" aria-label={`${dailyStreak} day streak`}>
        <FlameIcon size={14} />
        <span>{dailyStreak}</span>
      </div>

      <Button className="daily-banner__play shrink-0" onClick={onPlay}>
        Play
      </Button>

      <div className="w-full basis-full">
        {dateKey ? <DailyLeaderboard date={dateKey} /> : null}
      </div>
    </div>
  );
}

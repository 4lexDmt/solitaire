'use client';

import { Button } from '@/components/ui/Button';
import { CalendarIcon } from '@/components/ui/icons';
import { dailyDateKey, formatDailyLabel } from '@/lib/daily';
import { dailyStreakMessage } from '@/lib/stats-copy';
import { DailyLeaderboard } from '@/components/auth/DailyLeaderboard';
import { useStatsStore } from '@/state/stats';

interface DailyChallengeBannerProps {
  onPlay: () => void;
}

export function DailyChallengeBanner({ onPlay }: DailyChallengeBannerProps) {
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const label = formatDailyLabel();

  return (
    <div className="rounded-ui bg-ui-surface/95 p-5 shadow-modal backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-text">
          <CalendarIcon size={18} />
        </div>
        <div className="flex-1">
          <h2 className="font-ui text-hud font-semibold text-ui-text">Daily Challenge</h2>
          <p className="mt-1 font-ui text-sm text-ui-text-muted">{label} (UTC)</p>
          <p className="mt-1 font-ui text-sm text-ui-text-muted">
            {dailyStreakMessage(dailyStreak)}
          </p>
          <p className="mt-1 font-ui text-xs text-accent">
            Verified winnable deal from the offline pool
          </p>
        </div>
      </div>

      <Button fullWidth className="mt-4" onClick={onPlay}>
        Play today&apos;s deal
      </Button>

      <DailyLeaderboard date={dailyDateKey()} />
    </div>
  );
}

'use client';

import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { StatTile } from '@/components/ui/StatTile';
import { formatDuration, formatNumber, formatPercent } from '@/lib/format';
import {
  dailyStreakMessage,
  streakMessage,
} from '@/lib/stats-copy';
import { ACHIEVEMENTS, useAchievementsStore } from '@/state/achievements';
import { useSettingsStore } from '@/state/settings';
import { useStatsStore, winRate } from '@/state/stats';

interface StatsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function StatsPanel({ open, onClose }: StatsPanelProps) {
  const stats = useStatsStore();
  const vegasCumulative = useSettingsStore((s) => s.vegasCumulative);
  const scoreMode = useSettingsStore((s) => s.scoreMode);
  const achievements = useAchievementsStore();
  const overallRate = winRate(stats.gamesWon, stats.gamesPlayed);
  const draw1Rate = winRate(stats.draw1.won, stats.draw1.played);
  const draw3Rate = winRate(stats.draw3.won, stats.draw3.played);

  return (
    <Sheet open={open} onClose={onClose} title="Statistics">
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Games played" value={formatNumber(stats.gamesPlayed)} />
        <StatTile label="Games won" value={formatNumber(stats.gamesWon)} />
        <StatTile label="Win rate" value={formatPercent(overallRate)} />
        <StatTile label="Current streak" value={formatNumber(stats.currentStreak)} hint={streakMessage(stats.currentStreak)} />
        <StatTile label="Best streak" value={formatNumber(stats.bestStreak)} />
        <StatTile label="Total time" value={formatDuration(stats.totalTimeMs)} />
        <StatTile label="Draw-1 win rate" value={formatPercent(draw1Rate)} />
        <StatTile label="Draw-3 win rate" value={formatPercent(draw3Rate)} />
        <StatTile
          label="Daily streak"
          value={formatNumber(stats.dailyCurrentStreak)}
          hint={dailyStreakMessage(stats.dailyCurrentStreak)}
          className="col-span-2"
        />
        {scoreMode === 'vegas' && vegasCumulative ? (
          <StatTile
            label="Vegas bankroll"
            value={`$${formatNumber(stats.vegasBankroll)}`}
            hint="Cumulative balance across Vegas games."
            className="col-span-2"
          />
        ) : null}
      </div>

      <h3 className="section-label mb-3 mt-6">
        Achievements
      </h3>
      <div className="flex gap-2.5">
        {ACHIEVEMENTS.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            unlocked={achievements.unlocked.includes(achievement.id)}
            unlockedAt={achievements.unlockedAt[achievement.id]}
            compact
          />
        ))}
      </div>

      <div className="mt-6">
        <Button fullWidth variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </Sheet>
  );
}

'use client';

import { CheckIcon, FlameIcon, TrophyIcon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import type { AchievementDef } from '@/state/achievements';

interface AchievementBadgeProps {
  achievement: AchievementDef;
  unlocked: boolean;
  unlockedAt?: number;
  compact?: boolean;
}

const iconMap = {
  trophy: TrophyIcon,
  flame: FlameIcon,
  check: CheckIcon,
} as const;

export function AchievementBadge({
  achievement,
  unlocked,
  unlockedAt,
  compact,
}: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon];

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-1 flex-col items-center gap-1.5 rounded-ui bg-ui-surface-2 px-1.5 py-3 text-center',
          !unlocked && 'opacity-45',
        )}
      >
        <div
          className={cn(
            'text-[26px]',
            unlocked ? 'text-accent' : 'text-ui-text-muted',
          )}
        >
          <Icon size={26} />
        </div>
        <div className="font-ui text-[10px] font-medium text-ui-text">
          {achievement.title}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-ui border px-4 py-3',
        unlocked
          ? 'border-accent/30 bg-accent/5'
          : 'border-ui-surface-2 bg-ui-surface-2/60 opacity-70',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          unlocked ? 'bg-accent text-accent-text' : 'bg-ui-surface text-ui-text-muted',
        )}
      >
        <Icon size={18} />
      </div>
      <div>
        <div className="font-ui text-hud font-semibold text-ui-text">
          {achievement.title}
        </div>
        <div className="mt-0.5 font-ui text-sm text-ui-text-muted">
          {achievement.description}
        </div>
        {unlocked && unlockedAt ? (
          <div className="mt-1 font-ui text-xs text-ui-text-muted">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </div>
        ) : null}
      </div>
    </div>
  );
}

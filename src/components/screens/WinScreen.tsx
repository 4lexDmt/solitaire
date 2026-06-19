'use client';

import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatTile } from '@/components/ui/StatTile';
import { Toast } from '@/components/ui/Toast';
import { TrophyIcon } from '@/components/ui/icons';
import { DailyLeaderboard } from '@/components/auth/DailyLeaderboard';
import { buildDailyShareString, dailyDateKey } from '@/lib/daily';
import { formatDuration, formatNumber } from '@/lib/format';
import type { GameState } from '@/engine/types';
import { ACHIEVEMENTS, getAchievement, type AchievementId } from '@/state/achievements';
import { useStatsStore } from '@/state/stats';
import { useEffect, useState } from 'react';

interface WinScreenProps {
  open: boolean;
  game: GameState;
  isDaily?: boolean;
  newAchievements?: AchievementId[];
  onNewGame: () => void;
  onReplayDeal: () => void;
  onHome: () => void;
}

export function WinScreen({
  open,
  game,
  isDaily,
  newAchievements = [],
  onNewGame,
  onReplayDeal,
  onHome,
}: WinScreenProps) {
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const [copied, setCopied] = useState(false);
  const [toastIndex, setToastIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!open || newAchievements.length === 0) {
      setToastIndex(0);
      setShowToast(false);
      return;
    }
    setToastIndex(0);
    setShowToast(true);
  }, [open, newAchievements]);

  const toastAchievement = newAchievements[toastIndex];
  const toastDef = toastAchievement ? getAchievement(toastAchievement) : undefined;

  async function handleShare() {
    const text = buildDailyShareString({
      moves: game.moves,
      elapsedMs: game.elapsedMs,
      drawCount: game.drawCount,
      streak: dailyStreak,
    });
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User dismissed share sheet.
    }
  }

  return (
    <>
      <Modal open={open} onClose={onHome} title="You won." variant="celebration">
        <div className="flex flex-col items-center gap-0 text-center">
          <div className="mb-2.5 flex h-[46px] w-[46px] items-center justify-center text-accent">
            <TrophyIcon size={46} />
          </div>
          <p className="modal-subtitle mb-[18px]">
            {isDaily
              ? 'Daily challenge complete. Well played.'
              : 'A tidy game. Well played.'}
          </p>

          {newAchievements.length > 0 ? (
            <div className="mb-[18px] w-full">
              <p className="mb-2 font-ui text-xs font-semibold uppercase tracking-wide text-accent">
                Achievement{newAchievements.length > 1 ? 's' : ''} unlocked
              </p>
              <div className="flex gap-2">
                {newAchievements.map((id) => {
                  const def = ACHIEVEMENTS.find((a) => a.id === id);
                  if (!def) return null;
                  return (
                    <AchievementBadge
                      key={id}
                      achievement={def}
                      unlocked
                      compact
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mb-[18px] grid w-full grid-cols-3 gap-2">
          <StatTile label="Time" value={formatDuration(game.elapsedMs)} />
          <StatTile label="Moves" value={formatNumber(game.moves)} />
          {game.scoreMode !== 'none' ? (
            <StatTile label="Score" value={formatNumber(game.score)} />
          ) : (
            <StatTile label="Score" value="—" />
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          {isDaily ? (
            <Button fullWidth variant="ghost" onClick={() => void handleShare()}>
              {copied ? 'Copied!' : 'Share result'}
            </Button>
          ) : null}
          <Button fullWidth onClick={onNewGame}>
            New Game
          </Button>
          <Button fullWidth variant="ghost" onClick={onReplayDeal}>
            Replay this deal
          </Button>
        </div>

        {isDaily ? <DailyLeaderboard date={dailyDateKey()} /> : null}
      </div>
    </Modal>

      <Toast
        open={showToast && Boolean(toastDef)}
        message={toastDef ? `Achievement unlocked: ${toastDef.title}` : ''}
        onDismiss={() => {
          if (toastIndex + 1 < newAchievements.length) {
            setToastIndex((i) => i + 1);
          } else {
            setShowToast(false);
          }
        }}
      />
    </>
  );
}

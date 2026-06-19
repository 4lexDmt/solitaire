'use client';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatTile } from '@/components/ui/StatTile';
import { TrophyIcon } from '@/components/ui/icons';
import { DailyLeaderboard } from '@/components/auth/DailyLeaderboard';
import { buildDailyShareString, dailyDateKey } from '@/lib/daily';
import { formatDuration, formatNumber } from '@/lib/format';
import type { GameState } from '@/engine/types';
import { useStatsStore } from '@/state/stats';
import { useState } from 'react';

interface WinScreenProps {
  open: boolean;
  game: GameState;
  isDaily?: boolean;
  onNewGame: () => void;
  onReplayDeal: () => void;
  onHome: () => void;
}

export function WinScreen({
  open,
  game,
  isDaily,
  onNewGame,
  onReplayDeal,
  onHome,
}: WinScreenProps) {
  const dailyStreak = useStatsStore((s) => s.dailyCurrentStreak);
  const [copied, setCopied] = useState(false);

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
  );
}

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
  onHome: () => void;
}

export function WinScreen({
  open,
  game,
  isDaily,
  onNewGame,
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
    <Modal open={open} onClose={onHome} title={isDaily ? 'Daily complete' : 'You won'}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-text">
          <TrophyIcon size={32} />
        </div>
        <p className="font-ui text-hud text-ui-text-muted">
          {isDaily
            ? 'Nice work on today\'s verified winnable deal.'
            : 'Every win counts — however long it took.'}
        </p>

        <div className="grid w-full grid-cols-2 gap-3">
          <StatTile label="Time" value={formatDuration(game.elapsedMs)} />
          <StatTile label="Moves" value={formatNumber(game.moves)} />
          {game.scoreMode !== 'none' ? (
            <StatTile label="Score" value={formatNumber(game.score)} className="col-span-2" />
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 pt-2">
          {isDaily ? (
            <Button fullWidth variant="secondary" onClick={() => void handleShare()}>
              {copied ? 'Copied!' : 'Share result'}
            </Button>
          ) : null}
          <Button fullWidth onClick={onNewGame}>
            Play Again
          </Button>
          <Button fullWidth variant="secondary" onClick={onHome}>
            Home
          </Button>
        </div>

        {isDaily ? <DailyLeaderboard date={dailyDateKey()} /> : null}
      </div>
    </Modal>
  );
}

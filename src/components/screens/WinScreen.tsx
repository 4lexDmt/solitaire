'use client';

import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { Toast } from '@/components/ui/Toast';
import { Win95Button, Win95Dialog, formatTimer } from '@/components/win95/primitives';
import { DailyLeaderboard } from '@/components/auth/DailyLeaderboard';
import { buildDailyShareString, dailyDateKey } from '@/lib/daily';
import { formatNumber } from '@/lib/format';
import type { GameState } from '@/engine/types';
import { ACHIEVEMENTS, getAchievement, type AchievementId } from '@/state/achievements';
import { useStatsStore } from '@/state/stats';
import { variantLabel } from '@/lib/variantLabel';
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
  const gameName = variantLabel(game.variantId);

  async function handleShare() {
    const text = buildDailyShareString({
      moves: game.moves,
      elapsedMs: game.elapsedMs,
      drawCount: game.drawCount,
      streak: dailyStreak,
    });
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* dismissed */
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="win95-scrim">
        <Win95Dialog title="Congratulations!" onClose={onHome} size="sm">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, animation: 'trophy 1.4s ease-in-out infinite' }}>🏆</div>
            <div
              className="win95-pixel"
              style={{ fontSize: 22, color: '#0a5f30', letterSpacing: 1, margin: '6px 0 2px' }}
            >
              YOU WON!
            </div>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 14 }}>{gameName} solved</div>

            {newAchievements.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                {newAchievements.map((id) => {
                  const def = ACHIEVEMENTS.find((a) => a.id === id);
                  if (!def) return null;
                  return <AchievementBadge key={id} achievement={def} unlocked compact />;
                })}
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              <div className="win95-inset" style={{ flex: 1, padding: 8 }}>
                <div className="win95-pixel" style={{ fontSize: 16, color: '#04057a' }}>
                  {formatTimer(game.elapsedMs)}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>TIME</div>
              </div>
              <div className="win95-inset" style={{ flex: 1, padding: 8 }}>
                <div className="win95-pixel" style={{ fontSize: 16, color: '#04057a' }}>
                  {formatNumber(game.moves)}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>MOVES</div>
              </div>
              <div className="win95-inset" style={{ flex: 1, padding: 8 }}>
                <div className="win95-pixel" style={{ fontSize: 16, color: '#0a5f30' }}>
                  {game.scoreMode === 'none' ? '—' : formatNumber(game.score)}
                </div>
                <div style={{ fontSize: 10, color: '#555' }}>SCORE</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {isDaily ? (
                <Win95Button onClick={() => void handleShare()}>
                  {copied ? 'Copied!' : 'Share'}
                </Win95Button>
              ) : null}
              <Win95Button className="win95-btn--primary" onClick={onNewGame}>
                Play Again
              </Win95Button>
              <Win95Button onClick={onReplayDeal}>Replay</Win95Button>
              <Win95Button onClick={onHome}>Close</Win95Button>
            </div>

            {isDaily ? (
              <div style={{ marginTop: 14, textAlign: 'left' }}>
                <DailyLeaderboard date={dailyDateKey()} />
              </div>
            ) : null}
          </div>
        </Win95Dialog>
      </div>

      <Toast
        open={showToast && Boolean(toastDef)}
        message={toastDef ? `Achievement unlocked: ${toastDef.title}` : ''}
        onDismiss={() => {
          if (toastIndex + 1 < newAchievements.length) setToastIndex((i) => i + 1);
          else setShowToast(false);
        }}
      />
    </>
  );
}

'use client';

import { AchievementBadge } from '@/components/ui/AchievementBadge';
import { Win95Button, Win95Dialog, formatTimer } from '@/components/win95/primitives';
import { formatNumber } from '@/lib/format';
import { ACHIEVEMENTS, useAchievementsStore } from '@/state/achievements';
import { useStatsStore, winRate, type ModeStats } from '@/state/stats';

interface StatsPanelProps {
  open: boolean;
  onClose: () => void;
}

function row(name: string, mode: ModeStats | undefined, idx: number) {
  const played = mode?.played ?? 0;
  const won = mode?.won ?? 0;
  const pct = played ? `${Math.round(winRate(won, played) * 100)}%` : '—';
  const bestTime = mode?.bestTimeMs ? formatTimer(mode.bestTimeMs) : '—';
  const bestMoves = mode?.fewestMoves ?? '—';
  return (
    <div key={name} className="win95-table__row" style={{ background: idx % 2 ? '#eef' : '#fff' }}>
      <span style={{ fontWeight: 'bold' }}>{name}</span>
      <span style={{ textAlign: 'center' }}>{played}</span>
      <span style={{ textAlign: 'center' }}>{won}</span>
      <span style={{ textAlign: 'center' }}>{pct}</span>
      <span className="win95-pixel" style={{ textAlign: 'center', fontSize: 11 }}>
        {bestTime}
      </span>
      <span className="win95-pixel" style={{ textAlign: 'center', fontSize: 11 }}>
        {bestMoves}
      </span>
    </div>
  );
}

export function StatsPanel({ open, onClose }: StatsPanelProps) {
  const stats = useStatsStore();
  const achievements = useAchievementsStore();
  const reset = useStatsStore((s) => s.reset);

  if (!open) return null;

  return (
    <div className="win95-scrim" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Win95Dialog title="Statistics" onClose={onClose}>
          <div className="win95-table">
            <div className="win95-table__head">
              <span>Game</span>
              <span style={{ textAlign: 'center' }}>Played</span>
              <span style={{ textAlign: 'center' }}>Won</span>
              <span style={{ textAlign: 'center' }}>Win %</span>
              <span style={{ textAlign: 'center' }}>Best Time</span>
              <span style={{ textAlign: 'center' }}>Best Moves</span>
            </div>
            {row('Solitaire', { played: stats.draw1.played + stats.draw3.played, won: stats.draw1.won + stats.draw3.won, bestTimeMs: pickBestTime(stats.draw1, stats.draw3), fewestMoves: pickBestMoves(stats.draw1, stats.draw3) }, 0)}
            {row('FreeCell', stats.freecell, 1)}
            {row('Spider', stats.spider, 2)}
            {row('Pyramid', stats.pyramid, 3)}
            {row('TriPeaks', stats.tripeaks, 4)}
          </div>

          <div style={{ marginTop: 12, fontSize: 12, color: '#333' }}>
            Overall {formatNumber(stats.gamesWon)}/{formatNumber(stats.gamesPlayed)} · Daily streak{' '}
            {stats.dailyCurrentStreak}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {ACHIEVEMENTS.map((a) => (
              <AchievementBadge
                key={a.id}
                achievement={a}
                unlocked={achievements.unlocked.includes(a.id)}
                unlockedAt={achievements.unlockedAt[a.id]}
                compact
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            <Win95Button
              onClick={() => {
                if (window.confirm('Reset all statistics?')) reset();
              }}
            >
              Reset…
            </Win95Button>
            <Win95Button onClick={onClose} className="win95-btn--primary">
              OK
            </Win95Button>
          </div>
        </Win95Dialog>
      </div>
    </div>
  );
}

function pickBestTime(a: ModeStats, b: ModeStats): number | null {
  const times = [a.bestTimeMs, b.bestTimeMs].filter((t): t is number => t != null);
  return times.length ? Math.min(...times) : null;
}

function pickBestMoves(a: ModeStats, b: ModeStats): number | null {
  const moves = [a.fewestMoves, b.fewestMoves].filter((t): t is number => t != null);
  return moves.length ? Math.min(...moves) : null;
}

'use client';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { formatDuration } from '@/lib/format';
import { useEffect, useState } from 'react';

interface LeaderboardEntry {
  user_id: string;
  elapsed_ms: number;
  moves: number;
  completed_at: string;
}

interface DailyLeaderboardProps {
  date: string;
}

export function DailyLeaderboard({ date }: DailyLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    void supabase
      .from('daily_results')
      .select('user_id, elapsed_ms, moves, completed_at')
      .eq('challenge_date', date)
      .order('elapsed_ms', { ascending: true })
      .limit(10)
      .then(({ data, error }) => {
        if (!error && data) setEntries(data as LeaderboardEntry[]);
        setLoading(false);
      });
  }, [date]);

  if (!isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-ui-surface-2 pt-4">
      <h3 className="font-ui text-sm font-semibold text-ui-text">Today&apos;s leaderboard</h3>
      {loading ? (
        <p className="mt-2 font-ui text-sm text-ui-text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="mt-2 font-ui text-sm text-ui-text-muted">
          Be the first to post a time today.
        </p>
      ) : (
        <ol className="mt-2 space-y-1">
          {entries.map((entry, index) => (
            <li
              key={`${entry.user_id}-${entry.completed_at}`}
              className="flex items-center justify-between font-ui text-sm text-ui-text"
            >
              <span>
                #{index + 1} · {entry.user_id.slice(0, 8)}
              </span>
              <span className="tabular-nums text-ui-text-muted">
                {formatDuration(entry.elapsed_ms)} · {entry.moves} moves
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

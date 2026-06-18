'use client';

import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { GameState } from '@/engine/types';
import type { PlayerStats } from '@/state/stats';

export interface SyncGameResult {
  game: GameState;
  stats: PlayerStats;
  isDaily: boolean;
  dailyDate?: string;
}

export async function syncOnGameEnd(result: SyncGameResult): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  if (!supabase) return;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;

  const { game, stats, isDaily, dailyDate } = result;

  await Promise.all([
    supabase.from('stats').upsert(
      {
        user_id: user.id,
        payload: stats,
      },
      { onConflict: 'user_id' },
    ),
    isDaily && dailyDate
      ? supabase.from('daily_results').upsert(
          {
            user_id: user.id,
            challenge_date: dailyDate,
            elapsed_ms: game.elapsedMs,
            moves: game.moves,
            score: game.score,
          },
          { onConflict: 'user_id,challenge_date' },
        )
      : Promise.resolve(),
  ]);

  await supabase.from('saves').delete().eq('user_id', user.id);
}

export async function syncActiveSave(
  game: GameState,
  isDaily: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = createClient();
  if (!supabase) return;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;

  if (game.status === 'won' || game.status === 'lost') {
    return;
  }

  await supabase.from('saves').upsert(
    {
      user_id: user.id,
      game,
      seed: game.seed,
      draw_count: game.drawCount,
      is_daily: isDaily,
    },
    { onConflict: 'user_id' },
  );
}

export async function pullCloudSave(): Promise<GameState | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data } = await supabase
    .from('saves')
    .select('game')
    .eq('user_id', user.id)
    .maybeSingle();

  return (data?.game as GameState | undefined) ?? null;
}

export async function pullCloudStats(): Promise<PlayerStats | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createClient();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data } = await supabase
    .from('stats')
    .select('payload')
    .eq('user_id', user.id)
    .maybeSingle();

  return (data?.payload as PlayerStats | undefined) ?? null;
}

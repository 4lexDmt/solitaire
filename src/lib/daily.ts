/** Daily challenge seed — SPEC §9.3 */
export function dailySeed(date = new Date()): string {
  const yyyyMmDd = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `klondike-${yyyyMmDd}`;
}

export function dailyDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** True for date-keyed daily seed strings (not winnable-pool pick ids). */
export function isDailySeed(seed: string): boolean {
  return /^klondike-\d{8}$/.test(seed) || /^daily-pool-\d{8}$/.test(seed);
}

export function formatDailyLabel(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Wordle-style spoiler-free daily result (§12.7). */
export function buildDailyShareString(options: {
  date?: Date;
  moves: number;
  elapsedMs: number;
  drawCount: 1 | 3;
  streak: number;
  siteUrl?: string;
}): string {
  const dateKey = (options.date ?? new Date()).toISOString().slice(0, 10);
  const minutes = Math.max(1, Math.round(options.elapsedMs / 60_000));
  const efficiency = Math.min(
    5,
    Math.max(1, Math.round((52 / Math.max(options.moves, 1)) * 5)),
  );
  const bars = '█'.repeat(efficiency) + '░'.repeat(5 - efficiency);
  const site =
    options.siteUrl ??
    (typeof window !== 'undefined'
      ? `${window.location.origin}/daily`
      : 'https://aevanor.com/daily');
  return [
    `Aevanor Daily ${dateKey}`,
    `Draw-${options.drawCount} · ${options.moves} moves · ${minutes}m`,
    bars,
    options.streak > 1 ? `🔥 ${options.streak}-day streak` : '',
    site,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Non-judgmental stats copy — SPEC §12.3 */

export function streakMessage(current: number): string {
  if (current === 0) return 'Streak reset — a fresh start whenever you are ready.';
  if (current === 1) return 'One win in a row. Nice start.';
  return `${current} wins in a row. Keep going at your pace.`;
}

export function winRateMessage(rate: number, played: number): string {
  if (played === 0) return 'No games recorded yet — your stats will appear here as you play.';
  return `${rate}% of games won so far. Every deal is its own story.`;
}

export function dailyStreakMessage(streak: number): string {
  if (streak === 0) return 'Daily streak ready when you are.';
  if (streak === 1) return 'One daily completed. See you tomorrow?';
  return `${streak} dailies in a row. Steady progress.`;
}

export function emptyStatHint(): string {
  return 'Play a few games and your numbers will show up here — no pressure.';
}

import { describe, expect, it } from 'vitest';
import { buildDailyShareString, dailyDateKey, dailySeed, isDailySeed } from '../daily';

describe('daily helpers', () => {
  it('formats SPEC-style date seeds', () => {
    expect(dailySeed(new Date('2024-06-18T12:00:00.000Z'))).toBe('klondike-20240618');
    expect(dailyDateKey(new Date('2024-06-18T12:00:00.000Z'))).toBe('2024-06-18');
  });

  it('recognizes date-keyed daily seeds only', () => {
    expect(isDailySeed('klondike-20240618')).toBe(true);
    expect(isDailySeed('daily-pool-20240618')).toBe(true);
    expect(isDailySeed('pool-1-0004')).toBe(false);
    expect(isDailySeed('abc12345')).toBe(false);
  });

  it('builds branded share text with daily URL', () => {
    const text = buildDailyShareString({
      date: new Date('2026-07-17T12:00:00.000Z'),
      moves: 104,
      elapsedMs: 180_000,
      drawCount: 3,
      streak: 4,
      siteUrl: 'https://aevanor.com/daily',
    });
    expect(text).toContain('Aevanor Daily 2026-07-17');
    expect(text).toContain('Draw-3 · 104 moves · 3m');
    expect(text).toContain('🔥 4-day streak');
    expect(text).toContain('https://aevanor.com/daily');
  });
});

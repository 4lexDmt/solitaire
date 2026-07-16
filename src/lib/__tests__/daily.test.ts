import { describe, expect, it } from 'vitest';
import { dailyDateKey, dailySeed, isDailySeed } from '../daily';

describe('daily helpers', () => {
  it('formats SPEC-style date seeds', () => {
    expect(dailySeed(new Date('2024-06-18T12:00:00.000Z'))).toBe('klondike-20240618');
    expect(dailyDateKey(new Date('2024-06-18T12:00:00.000Z'))).toBe('2024-06-18');
  });

  it('recognizes date-keyed daily seeds only', () => {
    expect(isDailySeed('klondike-20240618')).toBe(true);
    expect(isDailySeed('daily-pool-20240618')).toBe(true);
    // Winnable pool pick ids are not daily by themselves (shared with winnable mode).
    expect(isDailySeed('pool-1-0004')).toBe(false);
    expect(isDailySeed('abc12345')).toBe(false);
  });
});

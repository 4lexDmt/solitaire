'use client';

import { dailyDateKey, formatDailyLabel } from '@/lib/daily';
import { useEffect, useState } from 'react';

/** Client-only daily label — avoids SSR/build-time date hydration mismatches. */
export function useClientDailyLabel(): string {
  const [label, setLabel] = useState('');
  useEffect(() => {
    setLabel(formatDailyLabel());
  }, []);
  return label;
}

/** Client-only YYYY-MM-DD key for daily challenge APIs. */
export function useClientDailyDateKey(): string {
  const [dateKey, setDateKey] = useState('');
  useEffect(() => {
    setDateKey(dailyDateKey());
  }, []);
  return dateKey;
}

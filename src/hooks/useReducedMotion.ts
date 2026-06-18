'use client';

import { useSettingsStore } from '@/state/settings';
import { useEffect, useState } from 'react';

/** Combines OS prefers-reduced-motion with the in-app Motion toggle (SPEC §8.7). */
export function useReducedMotion(): {
  reducedMotion: boolean;
  motionEnabled: boolean;
} {
  const motionSetting = useSettingsStore((s) => s.motionEnabled);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const reducedMotion = prefersReduced || !motionSetting;
  return { reducedMotion, motionEnabled: !reducedMotion };
}

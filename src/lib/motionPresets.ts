import { DURATIONS, EASINGS, SPRINGS } from '@/config/tokens';

export function flipTransition(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      duration: DURATIONS.reducedFlip / 1000,
      ease: EASINGS.standard,
    };
  }
  return {
    duration: DURATIONS.flip / 1000,
    ease: EASINGS.standard,
  };
}

export function snapTransition(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      duration: DURATIONS.reducedSnap / 1000,
      ease: EASINGS.standard,
    };
  }
  return {
    type: 'spring' as const,
    ...SPRINGS.snap,
  };
}

export function dealTransition(reducedMotion: boolean, delay = 0) {
  if (reducedMotion) {
    return {
      duration: 0.12,
      delay,
      ease: EASINGS.standard,
    };
  }
  return {
    duration: DURATIONS.dealCard / 1000,
    delay,
    ease: EASINGS.decel,
  };
}

export function invalidShakeTransition(reducedMotion: boolean) {
  if (reducedMotion) {
    return { duration: 0.2, ease: EASINGS.standard };
  }
  return {
    duration: DURATIONS.invalidShake / 1000,
    ease: EASINGS.accel,
  };
}

export function autocompleteTransition(reducedMotion: boolean, delay = 0) {
  if (reducedMotion) {
    return { duration: DURATIONS.reducedSnap / 1000, delay, ease: EASINGS.standard };
  }
  return {
    duration: DURATIONS.autocompleteCard / 1000,
    delay,
    ease: EASINGS.decel,
  };
}

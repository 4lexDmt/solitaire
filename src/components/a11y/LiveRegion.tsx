'use client';

interface LiveRegionProps {
  /** Text announced to screen readers when it changes. */
  message: string;
  politeness?: 'polite' | 'assertive';
}

/** Polite live region for move and game-state announcements (SPEC §13). */
export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live={politeness}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

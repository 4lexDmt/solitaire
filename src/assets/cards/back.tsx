'use client';

import { useId } from 'react';
import { PlacedSuitGlyph } from './suits';

/** Original lattice card back — one pattern per theme via CSS tokens (design system Contract H). */
export function CardBackPattern() {
  const patternId = useId().replace(/:/g, '');

  return (
    <svg viewBox="0 0 250 350" aria-hidden className="h-full w-full">
      <defs>
        <pattern
          id={patternId}
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="30" height="30" fill="var(--card-back-base)" />
          <path
            d="M0 0H30M0 15H30"
            stroke="var(--card-back-accent)"
            strokeWidth="1.4"
            opacity="0.3"
          />
          <circle
            cx="15"
            cy="15"
            r="2.3"
            fill="var(--card-back-accent)"
            opacity="0.5"
          />
        </pattern>
      </defs>
      <rect width="250" height="350" fill="var(--card-back-base)" />
      <rect
        x="14"
        y="14"
        width="222"
        height="322"
        rx="11"
        fill={`url(#${patternId})`}
      />
      <rect
        x="14"
        y="14"
        width="222"
        height="322"
        rx="11"
        fill="none"
        stroke="var(--card-back-accent)"
        strokeWidth="3"
        opacity="0.9"
      />
      <rect
        x="23"
        y="23"
        width="204"
        height="304"
        rx="7"
        fill="none"
        stroke="var(--card-back-accent)"
        strokeWidth="1"
        opacity="0.55"
      />
      <circle
        cx="125"
        cy="175"
        r="47"
        fill="var(--card-back-base)"
        stroke="var(--card-back-accent)"
        strokeWidth="2"
        opacity="0.95"
      />
      <circle
        cx="125"
        cy="175"
        r="39"
        fill="none"
        stroke="var(--card-back-accent)"
        strokeWidth="1"
        opacity="0.6"
      />
      <PlacedSuitGlyph
        suit="spades"
        color="var(--card-back-accent)"
        cx={125}
        cy={175}
        size={42}
      />
    </svg>
  );
}

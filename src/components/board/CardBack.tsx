'use client';

import { CardBackPattern } from '@/assets/cards';

/** Card back — theme-driven via CSS custom properties (design system Contract H). */
export function CardBack() {
  return (
    <div className="card-view__inner">
      <CardBackPattern />
    </div>
  );
}

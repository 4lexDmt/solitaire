'use client';

import type { Suit } from '@/engine/types';

/** Patterned card back only — face art lives in ExternalCardFace / public/cards. */
export function ClassicCardBack() {
  return <div className="classic-back" aria-hidden />;
}

export function isRed(suit: Suit): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

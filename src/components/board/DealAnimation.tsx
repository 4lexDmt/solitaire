'use client';

import { DURATIONS } from '@/config/tokens';
import type { Card } from '@/engine/types';
import { dealTransition } from '@/lib/motionPresets';
import { playSound } from '@/lib/sound';
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';

interface DealSlot {
  card: Card;
  pileId: string;
  indexInPile: number;
  dealIndex: number;
}

interface DealAnimationProps {
  dealKey: string;
  boardRef: React.RefObject<HTMLElement | null>;
  slots: DealSlot[];
  reducedMotion: boolean;
  onComplete: () => void;
}

function buildDealSlots(): DealSlot[] {
  const slots: DealSlot[] = [];
  let dealIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      slots.push({
        card: {
          id: `deal-${col}-${row}`,
          suit: 'hearts',
          rank: 1,
          color: 'red',
          faceUp: row === col,
        },
        pileId: `tableau-${col}`,
        indexInPile: row,
        dealIndex: dealIndex++,
      });
    }
  }

  return slots;
}

export function DealAnimation({
  dealKey,
  boardRef,
  slots,
  reducedMotion,
  onComplete,
}: DealAnimationProps) {
  const completedRef = useRef(false);
  const fallbackSlots = useMemo(() => buildDealSlots(), []);
  const dealSlots = slots.length > 0 ? slots : fallbackSlots;

  useEffect(() => {
    completedRef.current = false;
    const lastDelay =
      (dealSlots.length - 1) * (reducedMotion ? 0 : DURATIONS.dealStagger) +
      (reducedMotion ? DURATIONS.reducedSnap : DURATIONS.dealCard) +
      120;

    const id = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, lastDelay);

    return () => window.clearTimeout(id);
  }, [dealKey, dealSlots.length, onComplete, reducedMotion]);

  const stockRect = boardRef.current
    ?.querySelector('[data-pile-id="stock"]')
    ?.getBoundingClientRect();

  return (
    <div className="deal-animation" aria-hidden>
      {dealSlots.map((slot) => {
        const targetEl = boardRef.current?.querySelector(
          `[data-pile-id="${slot.pileId}"] [data-card-id="${slot.card.id}"]`,
        );
        const targetRect = targetEl?.getBoundingClientRect();
        const fromX = stockRect?.left ?? 0;
        const fromY = stockRect?.top ?? 0;
        const toX = targetRect?.left ?? fromX;
        const toY = targetRect?.top ?? fromY;

        return (
          <motion.div
            key={`${dealKey}-${slot.card.id}`}
            className="deal-animation__card"
            style={{
              position: 'fixed',
              width: 'var(--card-w)',
              height: 'var(--card-h)',
              pointerEvents: 'none',
              zIndex: 1200,
            }}
            initial={{
              left: fromX,
              top: fromY,
              opacity: reducedMotion ? 0 : 1,
              scale: reducedMotion ? 0.96 : 1,
            }}
            animate={{
              left: toX,
              top: toY,
              opacity: 1,
              scale: 1,
            }}
            transition={dealTransition(
              reducedMotion,
              reducedMotion ? 0 : slot.dealIndex * (DURATIONS.dealStagger / 1000),
            )}
            onAnimationComplete={() => {
              if (slot.card.faceUp) playSound('flip');
              else playSound('deal');
            }}
          >
            {slot.card.faceUp ? (
              <CardFace card={slot.card} />
            ) : (
              <CardBack />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export function buildDealSlotsFromGame(
  piles: Record<string, { cards: Card[] }>,
): DealSlot[] {
  const slots: DealSlot[] = [];
  let dealIndex = 0;

  for (let col = 0; col < 7; col++) {
    const pile = piles[`tableau-${col}`];
    if (!pile) continue;
    pile.cards.forEach((card, indexInPile) => {
      slots.push({
        card,
        pileId: `tableau-${col}`,
        indexInPile,
        dealIndex: dealIndex++,
      });
    });
  }

  return slots;
}

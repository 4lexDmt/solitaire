'use client';

import { DURATIONS } from '@/config/tokens';
import type { Card } from '@/engine/types';
import { dealTransition } from '@/lib/motionPresets';
import { playSound } from '@/lib/sound';
import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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

interface SlotTarget {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
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
  const finishedCardsRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const fallbackSlots = useMemo(() => buildDealSlots(), []);
  const dealSlots = slots.length > 0 ? slots : fallbackSlots;
  const [targets, setTargets] = useState<Record<string, SlotTarget>>({});

  const finishDeal = useRef(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  });

  finishDeal.current = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onCompleteRef.current();
  };

  useLayoutEffect(() => {
    completedRef.current = false;
    finishedCardsRef.current = 0;

    const board = boardRef.current;
    if (!board) return;

    // Cards fly from the stock; variants without one (FreeCell) deal from the board's top center.
    const stockRect = board
      .querySelector('[data-pile-id="stock"]')
      ?.getBoundingClientRect();
    const boardRect = board.getBoundingClientRect();
    const fromX = stockRect?.left ?? boardRect.left + boardRect.width / 2;
    const fromY = stockRect?.top ?? boardRect.top;

    const nextTargets: Record<string, SlotTarget> = {};
    for (const slot of dealSlots) {
      const targetEl = board.querySelector(
        `[data-pile-id="${slot.pileId}"] [data-card-id="${slot.card.id}"]`,
      );
      const targetRect = targetEl?.getBoundingClientRect();
      nextTargets[slot.card.id] = {
        fromX,
        fromY,
        toX: targetRect?.left ?? fromX,
        toY: targetRect?.top ?? fromY,
      };
    }

    setTargets(nextTargets);
  }, [boardRef, dealKey, dealSlots]);

  useEffect(() => {
    completedRef.current = false;
    finishedCardsRef.current = 0;

    const lastDelay =
      (dealSlots.length - 1) * (reducedMotion ? 0 : DURATIONS.dealStagger) +
      (reducedMotion ? DURATIONS.reducedSnap : DURATIONS.dealCard) +
      120;

    const id = window.setTimeout(() => {
      finishDeal.current();
    }, lastDelay);

    return () => window.clearTimeout(id);
  }, [dealKey, dealSlots.length, reducedMotion]);

  return (
    <div className="deal-animation" aria-hidden>
      {dealSlots.map((slot) => {
        const target = targets[slot.card.id];
        if (!target) return null;

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
              left: target.fromX,
              top: target.fromY,
              opacity: reducedMotion ? 0 : 1,
              scale: reducedMotion ? 0.96 : 1,
            }}
            animate={{
              left: target.toX,
              top: target.toY,
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

              finishedCardsRef.current += 1;
              if (finishedCardsRef.current >= dealSlots.length) {
                finishDeal.current();
              }
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
  piles: Record<string, { id?: string; type?: string; cards: Card[] }>,
): DealSlot[] {
  const slots: DealSlot[] = [];
  let dealIndex = 0;

  const tableauIds = Object.keys(piles)
    .filter((id) => id.startsWith('tableau-'))
    .sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]));

  for (const pileId of tableauIds) {
    piles[pileId].cards.forEach((card, indexInPile) => {
      slots.push({
        card,
        pileId,
        indexInPile,
        dealIndex: dealIndex++,
      });
    });
  }

  return slots;
}

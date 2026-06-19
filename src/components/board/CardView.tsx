'use client';

import { CASCADE, DURATIONS } from '@/config/tokens';
import type { Card } from '@/engine/types';
import { cardAriaLabel, cardZIndex } from '@/lib/layout';
import { flipTransition, invalidShakeTransition } from '@/lib/motionPresets';
import { motion } from 'motion/react';
import { CardBack } from './CardBack';
import { CardFace } from './CardFace';

interface CardViewProps {
  card: Card;
  depthIndex: number;
  topOffsetStyle?: string;
  leftOffsetStyle?: string;
  hinted?: boolean;
  selected?: boolean;
  dragSource?: boolean;
  focused?: boolean;
  pileId?: string;
  tabIndex?: number;
  reducedMotion?: boolean;
  shake?: boolean;
  invalidFlash?: boolean;
  foundationSparkle?: boolean;
  hiddenForDeal?: boolean;
  layout?: boolean;
  onFocus?: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

function CardFlipInner({
  card,
  reducedMotion,
}: {
  card: Card;
  reducedMotion: boolean;
}) {
  const duration = flipTransition(reducedMotion);

  return (
    <motion.div
      className="card-view__flip"
      style={{
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}
      initial={false}
      animate={{
        rotateY: card.faceUp ? 180 : 0,
        scale: reducedMotion ? 1 : card.faceUp ? [1, 1.04, 1] : 1,
      }}
      transition={duration}
    >
      <div
        className="card-view__face card-view__face--back"
        style={{ backfaceVisibility: 'hidden' }}
      >
        <CardBack />
      </div>
      <div
        className="card-view__face card-view__face--front"
        style={{
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          position: 'absolute',
          inset: 0,
        }}
      >
        <CardFace card={card} />
      </div>
    </motion.div>
  );
}

export function CardView({
  card,
  depthIndex,
  topOffsetStyle = '0px',
  leftOffsetStyle = '0px',
  hinted = false,
  selected = false,
  dragSource = false,
  focused = false,
  pileId,
  tabIndex,
  reducedMotion = false,
  shake = false,
  invalidFlash = false,
  foundationSparkle = false,
  hiddenForDeal = false,
  layout = true,
  onFocus,
  onPointerDown,
  onDoubleClick,
}: CardViewProps) {
  const classNames = [
    'card-view',
    hinted ? 'card-view--hint' : '',
    selected ? 'card-view--selected' : '',
    dragSource ? 'card-view--drag-source' : '',
    focused ? 'card-view--focused' : '',
    invalidFlash ? 'card-view--invalid-flash' : '',
    foundationSparkle ? 'card-view--foundation-sparkle' : '',
    hiddenForDeal ? 'card-view--deal-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.div
      layout={layout && !reducedMotion}
      layoutId={layout && !reducedMotion ? card.id : undefined}
      className={classNames}
      style={{
        top: topOffsetStyle,
        left: leftOffsetStyle,
        zIndex: cardZIndex(depthIndex),
      }}
      aria-label={cardAriaLabel(card)}
      role="button"
      draggable={false}
      data-card-id={card.id}
      data-pile-id={pileId}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      whileHover={
        reducedMotion || !onPointerDown || dragSource
          ? undefined
          : {
              y: CASCADE.hoverLiftPx,
              boxShadow: 'var(--elev-card-lifted)',
              transition: {
                duration: DURATIONS.hoverLift / 1000,
              },
            }
      }
      whileTap={
        reducedMotion || !onPointerDown || dragSource
          ? undefined
          : {
              scale: CASCADE.pressScale,
              transition: { duration: DURATIONS.press / 1000 },
            }
      }
      animate={
        shake && !reducedMotion
          ? {
              x: [0, -CASCADE.invalidShakePx, CASCADE.invalidShakePx, -CASCADE.invalidShakePx, CASCADE.invalidShakePx, 0],
            }
          : invalidFlash && reducedMotion
            ? { boxShadow: '0 0 0 2px var(--highlight-invalid)' }
            : undefined
      }
      transition={shake ? invalidShakeTransition(reducedMotion) : undefined}
    >
      <CardFlipInner card={card} reducedMotion={reducedMotion} />
    </motion.div>
  );
}

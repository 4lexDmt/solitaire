'use client';

import { CASCADE } from '@/config/tokens';
import type { Card } from '@/engine/types';
import { cardAriaLabel, cardZIndex } from '@/lib/layout';
import { invalidShakeTransition } from '@/lib/motionPresets';
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

/** Instant face/back swap — matches Aevanor Solitaire.dc.html (no 3D flip). */
function CardFlipInner({ card }: { card: Card; reducedMotion: boolean }) {
  return card.faceUp ? <CardFace card={card} /> : <CardBack />;
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
      layout={false}
      className={classNames}
      style={{
        top: topOffsetStyle,
        left: leftOffsetStyle,
        zIndex: cardZIndex(depthIndex),
      }}
      role="button"
      tabIndex={tabIndex}
      aria-label={cardAriaLabel(card)}
      data-card-id={card.id}
      data-pile-id={pileId}
      data-focused={focused || undefined}
      animate={
        shake
          ? {
              x: [
                0,
                -CASCADE.invalidShakePx,
                CASCADE.invalidShakePx,
                -CASCADE.invalidShakePx,
                CASCADE.invalidShakePx,
                0,
              ],
            }
          : { x: 0 }
      }
      transition={shake ? invalidShakeTransition(reducedMotion) : undefined}
      onFocus={onFocus}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      draggable={false}
    >
      <CardFlipInner card={card} reducedMotion={reducedMotion} />
    </motion.div>
  );
}

'use client';

import type { Card } from '@/engine/types';
import { cardAriaLabel, cardZIndex } from '@/lib/layout';
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

/** Instant face/back swap — no Motion layout (avoids deal-time card morphing). */
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
    shake ? 'card-view--shake' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
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
      onFocus={onFocus}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      draggable={false}
    >
      {card.faceUp ? <CardFace card={card} /> : <CardBack />}
    </div>
  );
}

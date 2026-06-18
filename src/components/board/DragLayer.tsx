'use client';

import { motion, type TargetAndTransition, type Transition } from 'motion/react';
import { CASCADE, Z } from '@/config/tokens';
import type { ActiveDrag, RejectDrag } from '@/hooks/useCardDrag';
import { snapTransition } from '@/lib/motionPresets';
import { tableauCardTopStyle } from '@/lib/layout';
import { CardView } from './CardView';

interface DragLayerProps {
  drag: ActiveDrag | null;
  reject: RejectDrag | null;
  motionEnabled: boolean;
  onRejectComplete: () => void;
}

function DragRun({
  cards,
  style,
  animate,
  transition,
  onAnimationComplete,
}: {
  cards: ActiveDrag['cards'];
  style: React.CSSProperties;
  animate?: TargetAndTransition;
  transition?: Transition;
  onAnimationComplete?: () => void;
}) {
  return (
    <motion.div
      className="drag-layer"
      style={style}
      animate={animate}
      transition={transition}
      onAnimationComplete={onAnimationComplete}
      role="presentation"
      aria-hidden
    >
      {cards.map((card, index) => (
        <CardView
          key={card.id}
          card={card}
          depthIndex={index}
          topOffsetStyle={tableauCardTopStyle(cards, index)}
          layout={false}
        />
      ))}
    </motion.div>
  );
}

export function DragLayer({ drag, reject, motionEnabled, onRejectComplete }: DragLayerProps) {
  if (drag) {
    return (
      <DragRun
        cards={drag.cards}
        style={{
          position: 'fixed',
          left: drag.x,
          top: drag.y,
          zIndex: Z.cardDragging,
          pointerEvents: 'none',
          scale: motionEnabled ? CASCADE.dragScale : 1,
          boxShadow: 'var(--elev-card-dragging)',
        }}
      />
    );
  }

  if (reject) {
    return (
      <DragRun
        cards={reject.cards}
        style={{
          position: 'fixed',
          left: reject.fromX,
          top: reject.fromY,
          zIndex: Z.cardDragging,
          pointerEvents: 'none',
          boxShadow: 'var(--elev-card-dragging)',
        }}
        animate={{
          left: reject.toX,
          top: reject.toY,
        }}
        transition={snapTransition(!motionEnabled)}
        onAnimationComplete={onRejectComplete}
      />
    );
  }

  return null;
}

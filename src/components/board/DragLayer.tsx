'use client';

import { useEffect } from 'react';
import { motion, type TargetAndTransition, type Transition } from 'motion/react';
import { CASCADE, DURATIONS, Z } from '@/config/tokens';
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

function RejectRun({
  reject,
  motionEnabled,
  onRejectComplete,
}: {
  reject: RejectDrag;
  motionEnabled: boolean;
  onRejectComplete: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(
      onRejectComplete,
      motionEnabled ? DURATIONS.snap + 80 : DURATIONS.reducedSnap + 40,
    );
    return () => window.clearTimeout(timeout);
  }, [motionEnabled, onRejectComplete, reject]);

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

export function DragLayer({ drag, reject, motionEnabled, onRejectComplete }: DragLayerProps) {
  if (drag) {
    return (
      <div
        className="drag-layer"
        style={{
          position: 'fixed',
          left: drag.x,
          top: drag.y,
          zIndex: Z.cardDragging,
          pointerEvents: 'none',
          transform: motionEnabled ? `scale(${CASCADE.dragScale})` : undefined,
          transformOrigin: 'top left',
        }}
        role="presentation"
        aria-hidden
      >
        {drag.cards.map((card, index) => (
          <CardView
            key={card.id}
            card={card}
            depthIndex={index}
            topOffsetStyle={tableauCardTopStyle(drag.cards, index)}
            layout={false}
          />
        ))}
      </div>
    );
  }

  if (reject) {
    return (
      <RejectRun
        reject={reject}
        motionEnabled={motionEnabled}
        onRejectComplete={onRejectComplete}
      />
    );
  }

  return null;
}

import type { PileType, Suit } from '@/engine/types';
import { SuitGlyph } from '@/assets/cards/suits';
import { isRed } from './ClassicCard';

type PilePlaceholderProps = {
  variant: PileType;
  suit?: Suit;
  hinted?: boolean;
};

/** Empty-pile outlines and watermarks — dashed Win9x style (vector suits, no emoji). */
export function PilePlaceholder({
  variant,
  suit,
  hinted = false,
}: PilePlaceholderProps) {
  return (
    <div
      className={`pile-placeholder${hinted ? ' pile-placeholder--hint' : ''}`}
      aria-hidden
    >
      {variant === 'foundation' && suit ? (
        <span
          className="pile-placeholder__suit-ghost"
          style={{
            color: isRed(suit)
              ? 'var(--foundation-watermark-red)'
              : 'var(--foundation-watermark)',
          }}
        >
          <SuitGlyph suit={suit} size={34} />
        </span>
      ) : null}
      {variant === 'stock' ? (
        <span
          className="pile-placeholder__recycle"
          style={{ color: 'rgba(255,255,255,.4)' }}
          aria-hidden
        >
          ↻
        </span>
      ) : null}
    </div>
  );
}

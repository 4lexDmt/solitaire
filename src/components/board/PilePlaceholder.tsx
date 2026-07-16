import type { PileType, Suit } from '@/engine/types';
import { SUIT_CHAR, isRed } from './ClassicCard';

type PilePlaceholderProps = {
  variant: PileType;
  suit?: Suit;
  hinted?: boolean;
};

/** Empty-pile outlines and watermarks — dashed Win9x style. */
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
          {SUIT_CHAR[suit]}
        </span>
      ) : null}
      {variant === 'stock' ? (
        <span className="pile-placeholder__suit-ghost" style={{ fontSize: '30px', color: 'rgba(255,255,255,.4)' }}>
          ↻
        </span>
      ) : null}
    </div>
  );
}

import type { PileType, Suit } from '@/engine/types';
import { SuitGlyph } from '@/assets/cards';

type PilePlaceholderProps = {
  variant: PileType;
  suit?: Suit;
  hinted?: boolean;
};

function RecycleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="pile-placeholder__recycle"
      aria-hidden
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        d="M6 8 A8 8 0 0 1 18 8 M18 8 L15 5 M18 8 L15 11 M18 16 A8 8 0 0 1 6 16 M6 16 L9 13 M6 16 L9 19"
      />
    </svg>
  );
}

/** Empty-pile outlines and watermarks (SPEC §11.4). */
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
      {variant === 'foundation' && (
        <div className="pile-placeholder__watermark">
          {suit ? <SuitGlyph suit={suit} size={48} /> : null}
          <span className="pile-placeholder__label">A</span>
        </div>
      )}
      {variant === 'stock' && <RecycleIcon />}
      {(variant === 'tableau' || variant === 'cell') && (
        <div className="pile-placeholder__watermark">
          <div
            style={{
              width: '70%',
              height: '70%',
              borderRadius: 'var(--card-radius)',
              border: '1px solid var(--placeholder-stroke)',
              opacity: 0.5,
            }}
          />
        </div>
      )}
    </div>
  );
}

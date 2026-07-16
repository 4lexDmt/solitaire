import type { Card } from '@/engine/types';
import { ExternalCardFace } from '@/assets/cards/externalFaces';

type CardFaceProps = {
  card: Card;
};

/**
 * Playing-card faces — always the traditional deck-of-cards SVG art
 * (rank, suit pips, and court illustrations). Never emoji / Unicode glyphs.
 */
export function CardFace({ card }: CardFaceProps) {
  return (
    <div className="card-view__inner">
      <ExternalCardFace card={card} />
    </div>
  );
}

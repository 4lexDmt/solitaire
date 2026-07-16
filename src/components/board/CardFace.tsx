import type { Card } from '@/engine/types';
import { ExternalCardFace } from '@/assets/cards/externalFaces';

type CardFaceProps = {
  card: Card;
};

/** Full deck-of-cards face art — correct rank/suit and balanced proportions. */
export function CardFace({ card }: CardFaceProps) {
  return (
    <div className="card-view__inner">
      <ExternalCardFace card={card} />
    </div>
  );
}

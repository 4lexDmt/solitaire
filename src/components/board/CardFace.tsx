import type { Card } from '@/engine/types';
import { CardFaceSvg } from '@/assets/cards/faces';

type CardFaceProps = {
  card: Card;
};

/** Pip / court card faces — correct rank, suit, and layout for every card. */
export function CardFace({ card }: CardFaceProps) {
  return (
    <div className="card-view__inner">
      <CardFaceSvg card={card} />
    </div>
  );
}

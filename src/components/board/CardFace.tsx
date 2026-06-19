import type { Card } from '@/engine/types';
import { CardFaceSvg } from '@/assets/cards/faces';

type CardFaceProps = {
  card: Card;
};

/** SVG card face — original design-system artwork (Contract H). */
export function CardFace({ card }: CardFaceProps) {
  return (
    <div className="card-view__inner">
      <CardFaceSvg card={card} />
    </div>
  );
}

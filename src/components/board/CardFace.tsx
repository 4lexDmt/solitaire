import type { Card } from '@/engine/types';
import { CardFaceSvg } from '@/assets/cards/faces';

type CardFaceProps = {
  card: Card;
};

/**
 * Playing-card faces with corner rank indices + vector suit pips.
 * Uses programmatic faces (not the pip-only external SVGs) so ranks stay
 * readable when cards are stacked on mobile.
 */
export function CardFace({ card }: CardFaceProps) {
  return (
    <div className="card-view__inner">
      <CardFaceSvg card={card} />
    </div>
  );
}

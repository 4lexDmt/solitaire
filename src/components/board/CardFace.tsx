import type { Card } from '@/engine/types';
import { ClassicCardFace } from './ClassicCard';

type CardFaceProps = {
  card: Card;
};

/** Classic desktop solitaire face (Aevanor Solitaire.dc.html). */
export function CardFace({ card }: CardFaceProps) {
  return (
    <div className="card-view__inner">
      <ClassicCardFace card={card} />
    </div>
  );
}

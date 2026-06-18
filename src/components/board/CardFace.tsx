import type { Card } from '@/engine/types';
import { useSettingsStore } from '@/state/settings';
import { CardFaceSvg as ExternalFace } from '@/assets/cards/externalFaces';
import { CardFaceSvg as ProgrammaticFace } from '@/assets/cards/faces';

type CardFaceProps = {
  card: Card;
};

/** SVG card face — external MIT deck by default; programmatic fallback for four-color tinting. */
export function CardFace({ card }: CardFaceProps) {
  const fourColor = useSettingsStore((s) => s.fourColorDeck);
  return (
    <div className={`card-view__inner${fourColor ? ' card-view__inner--four-color' : ''}`}>
      {fourColor ? <ProgrammaticFace card={card} /> : <ExternalFace card={card} />}
    </div>
  );
}

import type { Card } from '@/engine/types';
import { cardSvgUrl } from './svgAssets';

interface ExternalCardFaceProps {
  card: Card;
}

/** High-quality open-source SVG faces (deck-of-cards, MIT) scaled to SPEC viewBox. */
export function ExternalCardFace({ card }: ExternalCardFaceProps) {
  const src = cardSvgUrl(card);
  return (
    <svg viewBox="0 0 250 350" aria-hidden className="h-full w-full">
      <rect width="250" height="350" fill="var(--card-face)" rx="4" />
      <image
        href={src}
        x="11"
        y="17"
        width="228"
        height="316"
        preserveAspectRatio="xMidYMid meet"
        className="card-face-art"
      />
    </svg>
  );
}

export { ExternalCardFace as CardFaceSvg, ExternalCardFace as getCardFace };

import type { Card } from '@/engine/types';
import { rankLabel } from '@/lib/layout';
import { CourtArt } from './courts';
import { PIP_LAYOUTS, pipSizeForRank, pipToViewBox } from './pips';
import { SuitGlyph } from './suits';

interface CardFaceSvgProps {
  card: Card;
}

function inkColor(card: Card): string {
  const suitInk: Record<Card['suit'], string> = {
    hearts: 'var(--ink-suit-hearts)',
    diamonds: 'var(--ink-suit-diamonds)',
    clubs: 'var(--ink-suit-clubs)',
    spades: 'var(--ink-suit-spades)',
  };
  return suitInk[card.suit];
}

function IndexBlock({
  card,
  transform,
}: {
  card: Card;
  transform?: string;
}) {
  const ink = inkColor(card);
  return (
    <g transform={transform}>
      <text
        x="18"
        y="14"
        dominantBaseline="hanging"
        fill={ink}
        fontFamily="var(--font-index, Inter, system-ui, sans-serif)"
        fontWeight="800"
        fontSize="46"
      >
        {rankLabel(card.rank)}
      </text>
      <foreignObject x="10" y="64" width="30" height="30">
        <div style={{ color: ink, lineHeight: 0 }}>
          <SuitGlyph suit={card.suit} size={30} />
        </div>
      </foreignObject>
    </g>
  );
}

function CenterPips({ card }: { card: Card }) {
  const ink = inkColor(card);
  const rank = card.rank;

  if (rank >= 11) {
    return <CourtArt rank={rank as 11 | 12 | 13} suit={card.suit} ink={ink} />;
  }

  const points = PIP_LAYOUTS[rank] ?? [];
  const size = pipSizeForRank(rank);

  return (
    <g aria-hidden>
      {points.map((pip, i) => {
        const { x, y } = pipToViewBox(pip);
        return (
          <g
            key={i}
            transform={`translate(${x - size / 2} ${y - size / 2})${
              pip.invert ? ` rotate(180 ${x} ${y})` : ''
            }`}
          >
            <foreignObject x="0" y="0" width={size} height={size}>
              <div
                style={{
                  color: ink,
                  width: size,
                  height: size,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SuitGlyph suit={card.suit} size={size * 0.92} />
              </div>
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

/** Programmatic card face for any of the 52 cards §11.1 */
export function CardFaceSvg({ card }: CardFaceSvgProps) {
  return (
    <svg viewBox="0 0 250 350" aria-hidden className="h-full w-full">
      <rect width="250" height="350" fill="var(--card-face)" />
      <rect
        x="1"
        y="1"
        width="248"
        height="348"
        rx="4"
        fill="none"
        stroke="var(--card-face-edge)"
        strokeWidth="2"
      />
      <IndexBlock card={card} />
      <IndexBlock card={card} transform="rotate(180 125 175)" />
      <CenterPips card={card} />
    </svg>
  );
}

export { CardFaceSvg as getCardFace };

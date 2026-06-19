import type { Card } from '@/engine/types';
import { rankLabel } from '@/lib/layout';
import { CourtArt } from './courts';
import { PIP_LAYOUTS, pipSizeForRank, pipToViewBox } from './pips';
import { PlacedSuitGlyph } from './suits';

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
  const rank = rankLabel(card.rank);
  const fontSize = rank === '10' ? 44 : 58;

  return (
    <g transform={transform}>
      <text
        x="30"
        y="60"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={ink}
        fontFamily="var(--font-index, Inter, system-ui, sans-serif)"
        fontWeight="800"
        fontSize={fontSize}
        style={{
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.04em',
        }}
      >
        {rank}
      </text>
      <PlacedSuitGlyph suit={card.suit} color={ink} cx={30} cy={86} size={28} />
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
          <PlacedSuitGlyph
            key={i}
            suit={card.suit}
            color={ink}
            cx={x}
            cy={y}
            size={size}
            invert={pip.invert}
          />
        );
      })}
    </g>
  );
}

/** Programmatic card face for any of the 52 cards — design system Contract H. */
export function CardFaceSvg({ card }: CardFaceSvgProps) {
  return (
    <svg viewBox="0 0 250 350" aria-hidden className="h-full w-full">
      <rect width="250" height="350" fill="var(--card-face)" />
      <IndexBlock card={card} />
      <IndexBlock card={card} transform="rotate(180 125 175)" />
      <CenterPips card={card} />
    </svg>
  );
}

export { CardFaceSvg as getCardFace };

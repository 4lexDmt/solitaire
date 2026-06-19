import type { Rank, Suit } from '@/engine/types';
import { PlacedSuitGlyph } from './suits';

type CourtProps = {
  rank: 11 | 12 | 13;
  suit: Suit;
  ink: string;
};

/** Original monogram crest court designs (design system Contract H). */
export function CourtArt({ rank, suit, ink }: CourtProps) {
  const letter = rank === 11 ? 'J' : rank === 12 ? 'Q' : 'K';

  return (
    <g aria-hidden>
      <rect
        x="54"
        y="74"
        width="142"
        height="202"
        rx="11"
        fill="none"
        stroke={ink}
        strokeWidth="2.4"
        opacity="0.9"
      />
      <rect
        x="62"
        y="82"
        width="126"
        height="186"
        rx="7"
        fill="none"
        stroke={ink}
        strokeWidth="1"
        opacity="0.45"
      />
      <path
        d="M62 96 V82 H76"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        opacity="0.6"
      />
      <path
        d="M174 82 H188 V96"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        opacity="0.6"
      />
      <path
        d="M62 254 V268 H76"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        opacity="0.6"
      />
      <path
        d="M174 268 H188 V254"
        fill="none"
        stroke={ink}
        strokeWidth="1.6"
        opacity="0.6"
      />
      <PlacedSuitGlyph suit={suit} color={ink} cx={125} cy={108} size={30} />
      <PlacedSuitGlyph
        suit={suit}
        color={ink}
        cx={125}
        cy={242}
        size={30}
        invert
      />
      <PlacedSuitGlyph suit={suit} color={ink} cx={76} cy={175} size={15} />
      <PlacedSuitGlyph suit={suit} color={ink} cx={174} cy={175} size={15} />
      <text
        x="125"
        y="206"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={ink}
        fontFamily="var(--font-court)"
        fontWeight="var(--font-court-weight)"
        fontSize="92"
        style={{ letterSpacing: '-0.02em' }}
      >
        {letter}
      </text>
    </g>
  );
}

export function isCourtRank(rank: Rank): rank is 11 | 12 | 13 {
  return rank === 11 || rank === 12 || rank === 13;
}

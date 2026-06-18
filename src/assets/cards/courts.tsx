import type { Rank, Suit } from "@/engine/types";

type CourtProps = {
  rank: 11 | 12 | 13;
  suit: Suit;
  ink: string;
};

/** Original monogram-style court designs within center field (SPEC §11.1). */
export function CourtArt({ rank, suit, ink }: CourtProps) {
  const letter = rank === 11 ? "J" : rank === 12 ? "Q" : "K";
  const accent =
    suit === "hearts" || suit === "diamonds"
      ? "var(--ink-red)"
      : "var(--ink-black)";

  return (
    <g aria-hidden>
      <rect
        x="54"
        y="78"
        width="142"
        height="194"
        rx="18"
        fill="none"
        stroke={ink}
        strokeWidth="2"
        opacity="0.18"
      />
      <text
        x="125"
        y="168"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={ink}
        fontFamily="var(--font-court)"
        fontWeight="var(--font-court-weight)"
        fontSize="112"
      >
        {letter}
      </text>
      <circle cx="125" cy="228" r="28" fill={accent} opacity="0.15" />
      <circle cx="125" cy="228" r="14" fill={accent} opacity="0.35" />
      {suit === "spades" && (
        <path
          d="M125 248 C115 238 108 228 108 218 C108 208 115 202 125 202 C135 202 142 208 142 218 C142 228 135 238 125 248 Z"
          fill={accent}
          opacity="0.5"
        />
      )}
      {suit === "hearts" && (
        <path
          d="M125 252 C112 238 104 226 104 214 C104 204 110 198 118 198 C122 198 125 202 125 208 C125 202 128 198 132 198 C140 198 146 204 146 214 C146 226 138 238 125 252 Z"
          fill={accent}
          opacity="0.5"
        />
      )}
      {suit === "diamonds" && (
        <path
          d="M125 202 L148 228 L125 254 L102 228 Z"
          fill={accent}
          opacity="0.5"
        />
      )}
      {suit === "clubs" && (
        <>
          <circle cx="125" cy="214" r="10" fill={accent} opacity="0.5" />
          <circle cx="110" cy="228" r="10" fill={accent} opacity="0.5" />
          <circle cx="140" cy="228" r="10" fill={accent} opacity="0.5" />
        </>
      )}
    </g>
  );
}

export function isCourtRank(rank: Rank): rank is 11 | 12 | 13 {
  return rank === 11 || rank === 12 || rank === 13;
}

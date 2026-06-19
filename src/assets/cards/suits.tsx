import type { Suit } from "@/engine/types";

type SuitGlyphProps = {
  className?: string;
  size?: number;
};

/** Original vector suit glyphs — viewBox 0 0 100 100 (design system Contract H). */
export function SuitGlyph({
  suit,
  className,
  size = 100,
}: SuitGlyphProps & { suit: Suit }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {suit === "spades" && (
        <path
          fill="currentColor"
          d="M50 14 C46 31 21 43 21 61 C21 74 33 82 43 76 C42 84 38 89 30 92 L70 92 C62 89 58 84 57 76 C67 82 79 74 79 61 C79 43 54 31 50 14 Z"
        />
      )}
      {suit === "hearts" && (
        <path
          fill="currentColor"
          d="M50 87 C29 71 17 59 17 40 C17 27 26 18 37 18 C45 18 49 24 50 31 C51 24 55 18 63 18 C74 18 83 27 83 40 C83 59 71 71 50 87 Z"
        />
      )}
      {suit === "diamonds" && (
        <path
          fill="currentColor"
          d="M50 11 L81 50 L50 89 L19 50 Z"
        />
      )}
      {suit === "clubs" && (
        <>
          <circle cx="50" cy="31" r="15" fill="currentColor" />
          <circle cx="32" cy="55" r="15" fill="currentColor" />
          <circle cx="68" cy="55" r="15" fill="currentColor" />
          <path
            fill="currentColor"
            d="M44 55 C44 70 40 82 32 91 L68 91 C60 82 56 70 56 55 Z"
          />
        </>
      )}
    </svg>
  );
}

export const SUIT_ORDER: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

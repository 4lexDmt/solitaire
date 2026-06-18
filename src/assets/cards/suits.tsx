import type { Suit } from "@/engine/types";

type SuitGlyphProps = {
  className?: string;
  size?: number;
};

/** Original vector suit glyphs — viewBox 0 0 100 100, currentColor-driven (SPEC §11.3). */
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
      {suit === "hearts" && (
        <path
          fill="currentColor"
          d="M50 88 C20 62 8 44 8 28 C8 14 18 6 30 6 C38 6 45 11 50 20 C55 11 62 6 70 6 C82 6 92 14 92 28 C92 44 80 62 50 88 Z"
        />
      )}
      {suit === "diamonds" && (
        <path
          fill="currentColor"
          d="M50 6 L94 50 L50 94 L6 50 Z M50 18 L82 50 L50 82 L18 50 Z"
        />
      )}
      {suit === "clubs" && (
        <>
          <circle cx="50" cy="28" r="18" fill="currentColor" />
          <circle cx="28" cy="52" r="18" fill="currentColor" />
          <circle cx="72" cy="52" r="18" fill="currentColor" />
          <path
            fill="currentColor"
            d="M42 58 Q50 68 58 58 L62 92 L38 92 Z"
          />
        </>
      )}
      {suit === "spades" && (
        <>
          <path
            fill="currentColor"
            d="M50 8 C28 8 12 24 12 42 C12 58 28 68 50 82 C72 68 88 58 88 42 C88 24 72 8 50 8 Z"
          />
          <path
            fill="currentColor"
            d="M42 62 Q50 72 58 62 L62 92 L38 92 Z"
          />
        </>
      )}
    </svg>
  );
}

export const SUIT_ORDER: Suit[] = ["hearts", "diamonds", "clubs", "spades"];

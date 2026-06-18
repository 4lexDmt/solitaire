# Card assets

## Face cards (52)

- **Source:** [deck-of-cards](https://github.com/deckofcards/deck-of-cards) (npm package `deck-of-cards`) — vector art by Chris Aguilar
- **License:** GNU LGPL v3 (see `LICENSE-deck-of-cards.txt`); npm package wrapper is MIT
- **Files:** `public/cards/{suitIndex}_{rank}.svg` — suits `0=spades`, `1=hearts`, `2=clubs`, `3=diamonds`; ranks `1–13` (Ace–King)
- **Integration:** Rendered via `src/assets/cards/externalFaces.tsx`, scaled into viewBox `0 0 250 350` per SPEC §11

## Card back

- Original geometric pattern in `back.tsx`, tinted with theme tokens `--card-back-base` and `--card-back-accent`.

## Suit glyphs & programmatic fallback

- `suits.tsx`, `pips.ts`, `courts.tsx`, `faces.tsx` remain for four-color deck overrides and sprite tooling.

## Four-color deck

- CSS custom properties `--ink-suit-hearts`, `--ink-suit-diamonds`, `--ink-suit-clubs`, `--ink-suit-spades` tint external SVG faces via `filter` in `board.css` when `[data-four-color="true"]`.

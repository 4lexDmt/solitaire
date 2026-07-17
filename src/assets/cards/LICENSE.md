# Card assets

## Face cards (52)

- **Source:** Original programmatic SVG faces in `faces.tsx`, `pips.ts`, `courts.tsx`, and `suits.tsx`
- **License:** Same as this project
- **Notes:** Corner rank indices + vector suit glyphs. No third-party deck artwork is shipped.

## Card backs

- Geometric CSS patterns (`weave`, `argyle`, `waves`, `citadel`, `bloom`, `circuit`) via theme tokens in `tokens.css`
- Optional lattice SVG accent in `back.tsx`, tinted with `--card-back-base` / `--card-back-accent`

## Four-color deck

- CSS custom properties `--ink-suit-hearts`, `--ink-suit-diamonds`, `--ink-suit-clubs`, `--ink-suit-spades` tint suit ink when `[data-four-color="true"]`

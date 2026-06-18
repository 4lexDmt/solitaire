# Solitaire — Shared Specification

**In-repo copy of the canonical contract.** `SPEC_VERSION = 1.0.0`

Sections 5–13 below are the single source of truth for tokens, state, components, features, and accessibility.

---

## 5. Design tokens

CSS custom properties are the contract surface. Code maps these into `tokens.ts` + Tailwind `theme.extend`; design outputs them with these exact names. Three themes ship at launch: **Heritage** (default, nostalgic), **Midnight** (dark), **Studio** (modern).

### 5.1 Color tokens

| Token | Heritage (default) | Midnight | Studio |
|---|---|---|---|
| `--baize-center` | `#1C7A52` | `#15323B` | `#2E9E86` |
| `--baize-edge` | `#0C4A30` | `#0A1A1F` | `#26876F` |
| `--table-vignette-alpha` | `0.45` | `0.55` | `0.18` |
| `--card-face` | `#FBF8F1` | `#F5F3EC` | `#FFFFFF` |
| `--card-face-edge` | `#E9E1D0` | `#DED9CC` | `#ECECEC` |
| `--ink-red` | `#C0362C` | `#D4584C` | `#D8392B` |
| `--ink-black` | `#23262E` | `#2A2D34` | `#15171C` |
| `--card-back-base` | `#8E2A2A` | `#1E3A4C` | `#0E7C66` |
| `--card-back-accent` | `#F3E9D2` | `#5FA8C9` | `#BFEAD9` |
| `--card-border` | `rgba(0,0,0,0.18)` | `rgba(0,0,0,0.30)` | `rgba(0,0,0,0.12)` |
| `--placeholder-stroke` | `rgba(255,255,255,0.30)` | `rgba(255,255,255,0.22)` | `rgba(255,255,255,0.40)` |
| `--placeholder-fill` | `rgba(0,0,0,0.10)` | `rgba(0,0,0,0.18)` | `rgba(0,0,0,0.06)` |
| `--foundation-watermark` | `rgba(255,255,255,0.16)` | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.22)` |
| `--highlight-valid` | `#FFCF5C` | `#6FE3C0` | `#FFD66B` |
| `--highlight-invalid` | `#E04A37` | `#FF6B57` | `#E5533C` |
| `--hint-pulse` | `#74E0A8` | `#5FE0FF` | `#4FD0A0` |
| `--ui-surface` | `#FFFFFF` | `#16191F` | `#FFFFFF` |
| `--ui-surface-2` | `#F4F1EA` | `#1F242C` | `#F3F6F4` |
| `--ui-text` | `#1E2128` | `#ECEFF3` | `#15181C` |
| `--ui-text-muted` | `#6B6F77` | `#9AA1AB` | `#5C6168` |
| `--accent` | `#2E7D5B` | `#3DD6A6` | `#0E7C66` |
| `--accent-text` | `#FFFFFF` | `#08110E` | `#FFFFFF` |

> Cards stay **light in every theme** for legibility — the table changes, the paper doesn't. `--ink-red` / `--ink-black` are functional suit/rank colors and are standard.

### 5.2 Typography

| Token | Value | Notes |
|---|---|---|
| `--font-ui` | `"Inter", system-ui, sans-serif` | All UI, menus, HUD. Use tabular numerals for timer/score. |
| `--font-index` | `"Inter", system-ui, sans-serif`, weight **800** | Corner rank glyphs. Heavy weight for legibility at small size. |
| `--font-court` | `"Inter", system-ui, sans-serif`, weight **700** | Court monograms (J/Q/K letters), if using monogram-style courts. |
| `--text-hud` | `clamp(13px, 2.6vw, 16px)` | |
| `--text-title` | `clamp(22px, 5vw, 34px)` | |
| `--text-button` | `15px / 600` | |

Fonts must be free/open (Inter is OFL). Suit symbols are **drawn as SVG**, never font glyphs, so they're crisp and original.

### 5.3 Spacing, radius, elevation

| Token | Value |
|---|---|
| `--space-unit` | `4px` (scale: 4/8/12/16/24/32) |
| `--card-radius` | `calc(var(--card-w) * 0.06)` (Studio theme: `0.08`) |
| `--ui-radius` | `12px` (Studio: `16px`) |
| `--elev-card-resting` | `0 1px 2px rgba(0,0,0,0.22)` |
| `--elev-card-lifted` | `0 8px 18px rgba(0,0,0,0.30)` |
| `--elev-card-dragging` | `0 16px 32px rgba(0,0,0,0.38)` |
| `--elev-modal` | `0 24px 60px rgba(0,0,0,0.40)` |

---

---

## 6. Card & board geometry (the most important shared numbers)

These ratios MUST match between layout code and design mockups. Everything derives from one driver variable, `--card-w` (current card width in px).

| Token | Value | Meaning |
|---|---|---|
| `--card-aspect` | `5 / 7` | width:height of a playing card (2.5″×3.5″). |
| `--card-h` | `calc(var(--card-w) * 1.4)` | derived height. |
| `--card-w-max` | `104px` | cap on desktop so cards don't get huge. |
| `--card-w-min` | `40px` | floor for tiny screens. |
| `--gap-x` | `calc(var(--card-w) * 0.18)` | horizontal gap between the 7 tableau columns. |
| `--overlap-faceup` | `calc(var(--card-h) * 0.24)` | vertical offset of each face-up tableau card. |
| `--overlap-facedown` | `calc(var(--card-h) * 0.11)` | tighter offset for face-down tableau cards. |
| `--waste-fan` | `calc(var(--card-w) * 0.26)` | horizontal fan offset for the 3 visible waste cards (draw-3). |
| `--board-pad` | `calc(var(--card-w) * 0.22)` | outer board padding. |
| `--row-gap` | `calc(var(--card-h) * 0.30)` | gap between the top row (stock/waste/foundations) and the tableau. |

**Card width formula (responsive):**
```
--card-w = clamp(
  var(--card-w-min),
  (100vw - 2*--board-pad - 6*--gap-x) / 7,
  var(--card-w-max)
);
```
i.e. seven columns plus six gaps always fit the viewport width, capped at 104px.

**Klondike board layout (top to bottom):**
- **Top row:** `stock` (far left), `waste` (immediately right of stock), then a flexible gap, then `foundation-0..3` aligned to the right. On screens < 380px, foundations may wrap; design must specify both arrangements.
- **Tableau row:** `tableau-0..6`, left to right, starting with 1 card (col 0) up to 7 cards (col 6); the top card of each is face-up, the rest face-down.

**Internal card coordinate system:** every card SVG uses `viewBox="0 0 250 350"` (5:7 ×50). All asset coordinates in §11 are in these units.

---

---

## 7. Z-index layer system

| Token | Value | Layer |
|---|---|---|
| `--z-baize` | `0` | table + vignette |
| `--z-pile-placeholder` | `1` | empty-pile outlines/watermarks |
| `--z-card-base` | `10` | resting cards: actual z = `10 + depthIndexInPile` |
| `--z-card-lifted` | `500` | hover/selected lift |
| `--z-card-dragging` | `1000` | the card/run being dragged |
| `--z-cascade` | `2000` | win-cascade canvas overlay |
| `--z-hud` | `2500` | top bar (timer/score/moves/menu) |
| `--z-modal` | `3000` | menus, win dialog, settings |
| `--z-toast` | `3500` | transient messages |

---

---

## 8. Motion & physics specification

All durations/easings are shared tokens. Code uses Motion (formerly Framer Motion) for declarative card animation + drag, and a **custom `requestAnimationFrame` physics loop on a `<canvas>` for the win cascade** (52 trailed sprites need raw canvas for 60fps). Respect `prefers-reduced-motion` (see §8.7).

### 8.1 Easing & spring tokens
| Token | Value |
|---|---|
| `--ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` |
| `--ease-decel` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `--ease-accel` | `cubic-bezier(0.4, 0, 1, 1)` |
| `--spring-snap` | Motion spring: `{ stiffness: 520, damping: 30, mass: 0.9 }` |
| `--spring-soft` | Motion spring: `{ stiffness: 300, damping: 26, mass: 1 }` |

### 8.2 Card flip
- **Duration:** `--dur-flip = 180ms`, easing `--ease-standard`.
- 3D `rotateY` 0→180°; swap face/back render at 90°; slight `scale` bump to 1.04 at midpoint then back to 1.0. `transform-style: preserve-3d`.

### 8.3 Card move / snap (legal drop or click-to-move)
- **Duration:** `--dur-snap = 220ms`, motion `--spring-snap` (gives a tiny, satisfying overshoot). The card travels from pickup point to the destination slot.
- On release of a drag, Motion inertia hands off to the snap spring.

### 8.4 Deal (new game)
- Cards fly from the stock position to their tableau slots, **staggered `45ms`** per card, each card `--dur-deal-card = 300ms`, easing `--ease-decel`. Deal order: column-by-column or diagonal — design specifies; code follows. Face-down cards arrive face-down; the final card of each column flips (8.2) on arrival.

### 8.5 Feedback micro-animations
| Interaction | Spec |
|---|---|
| Hover (pointer) | lift `translateY(-2px)` + `--elev-card-lifted`, `--dur-hover-lift = 120ms`. |
| Press (button/card) | `scale(0.97)`, `--dur-press = 90ms`. |
| Invalid drop | card springs back to origin + **shake** ±6px, 3 oscillations, `--dur-invalid-shake = 320ms`; brief `--highlight-invalid` ring. |
| Valid drop target (while dragging over) | target placeholder/top card gains `--highlight-valid` glow + `scale(1.03)`. |
| Hint | pulsing `--hint-pulse` outline on the source and destination, 2 pulses. |
| Foundation completes a suit | subtle radial glow + small original sparkle burst (no third-party assets). |
| Mobile haptic | `navigator.vibrate(10)` on pickup, `(15)` on foundation drop, `([10,40,10])` on win (guarded by a setting + feature check). |

### 8.6 Auto-complete & win cascade
- **Auto-complete:** when only foundation moves remain (no face-down cards left), show a "Finish" affordance; cards fly to foundations, `--dur-autocomplete-card = 160ms`, stagger `60ms`, easing `--ease-decel`.
- **Win cascade (the nostalgic moment), original implementation, canvas at `--z-cascade`:**
  - Trigger on game won. Cards launch from the **four foundation piles**, top card first, staggered ~`80ms` between launches.
  - Physics (per card, integrated at 60fps; values given in px/second):
    - `gravity = 2200 px/s²` (downward).
    - initial horizontal velocity `vx ∈ [-420, 420] px/s` (random, biased away from center).
    - initial vertical velocity `vy ∈ [-360, -120] px/s` (slight upward pop).
    - floor restitution `0.82`; wall restitution `0.70`; each card bounces until it leaves the canvas or energy < threshold.
  - **Trail effect:** the canvas is **not cleared each frame** — each card image is redrawn at its new position over the previous frame, producing the iconic cumulative card-trail "smear." Provide a tap/click and an auto-timeout (after the last card exits, or 12s) that clears the canvas and shows the Win dialog.
  - Cap simultaneous cards for perf; recycle sprites.

### 8.7 Reduced motion
If `prefers-reduced-motion: reduce` **or** the user's Motion setting is off:
- Flips become instant (or ≤80ms cross-fade), snaps become `120ms` ease, deal is a quick fade-in, **the win cascade is replaced by a static celebratory overlay** (trophy + stats, gentle fade). No bouncing, no shake (use a color flash for invalid instead).

---

---

## 9. State model contract (TypeScript)

This is the authoritative data shape. Code implements it; design treats every visual state below as a thing it must style.

```ts
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type Color = 'red' | 'black';
export type Rank = 1|2|3|4|5|6|7|8|9|10|11|12|13; // A=1, J=11, Q=12, K=13

export interface Card {
  id: string;        // stable per deck, e.g. 'H7' (hearts 7), 'SK' (spades king)
  suit: Suit;
  rank: Rank;
  color: Color;      // derived from suit; cached for convenience
  faceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau';

export interface Pile {
  id: string;        // 'stock' | 'waste' | 'foundation-0'..'foundation-3' | 'tableau-0'..'tableau-6'
  type: PileType;
  cards: Card[];     // index 0 = bottom of pile
  suit?: Suit;       // foundations may be locked to a suit once seeded
}

export type ScoreMode = 'none' | 'standard' | 'vegas';

export interface Move {
  from: string;      // pile id
  to: string;        // pile id
  cardIds: string[]; // the moved cards, bottom→top (a run can be >1)
  flipped?: { pileId: string; cardId: string }; // a card revealed/flipped as a result
  recycled?: boolean;// true for waste→stock recycle
  drew?: number;     // for stock→waste draws (1 or 3)
  scoreDelta: number;
  ts: number;        // epoch ms
}

export interface Selection { pileId: string; cardId: string; } // click-to-select source

export type GameStatus = 'idle' | 'dealing' | 'playing' | 'won' | 'lost';

export interface GameState {
  variantId: string;             // 'klondike'
  seed: string;                  // reproducible deal seed
  drawCount: 1 | 3;
  scoreMode: ScoreMode;
  piles: Record<string, Pile>;
  selection: Selection | null;
  status: GameStatus;
  moves: number;
  score: number;
  elapsedMs: number;
  history: Move[];               // undo stack
  future: Move[];                // redo stack
  hintCardIds?: string[];        // currently highlighted hint
}
```

**Visual states design must cover for a card:** face-down, face-up resting, hovered/lifted, selected, dragging (with run), valid-drop-target highlight, invalid flash, hint pulse, just-flipped, auto-completing, in-cascade.

### 9.1 Variant interface (framework boundary)

```ts
export interface BoardLayout {
  piles: { id: string; type: PileType; gridArea: string }[]; // CSS grid placement
  // responsive breakpoints handled in CSS via the tokens in §6
}

export interface Variant {
  id: string;
  name: string;                                   // display, e.g. 'Klondike'
  layout: BoardLayout;
  deal(deck: Card[], seed: string): Record<string, Pile>;
  getLegalMoves(state: GameState): Move[];         // used by hints & input validation
  canDrop(state: GameState, cardIds: string[], from: string, to: string): boolean;
  isWon(state: GameState): boolean;
  autoMoveTarget(state: GameState, cardId: string): string | null; // double-click destination
  score(move: Move, mode: ScoreMode): number;
}
```

### 9.2 Klondike rules (the flagship variant's concrete behavior)
- **Tableau build-down:** descending rank, alternating color (e.g. red 6 on black 7).
- **Tableau empty:** only a King (or a run starting with a King) may move onto an empty column.
- **Foundation build-up:** by suit, Ace→King.
- **Runs:** any face-up descending/alternating sequence moves as a unit.
- **Stock:** draw `drawCount` to waste; only the top waste card is playable; empty stock can be recycled from waste (unlimited passes by default; a setting may limit passes).
- **Worrying back:** moving a card from a foundation back to the tableau is allowed.
- **Win:** all four foundations complete (King on top).

### 9.3 Seeded deal (identical deals everywhere — required for daily challenge + winnable pool)
- Seed string → 32-bit state via **cyrb128** hash → **mulberry32** PRNG → **Fisher–Yates** shuffle of the 52-card deck. This must be byte-for-byte deterministic across devices.
- **Daily seed:** `klondike-${YYYYMMDD}` (UTC date). Everyone gets the same daily deal.
- **Random game seed:** 8-char base36 (also shown to the user so a deal can be shared/replayed).

```ts
// Reference PRNG — implement exactly as below so deals match across platforms.
export function cyrb128(str: string): [number, number, number, number] { /* standard cyrb128 */ }
export function mulberry32(a: number): () => number { /* standard mulberry32 */ }
export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```

---

---

## 10. Component inventory (identical names in code & design)

**Screens:** `HomeScreen`, `GameScreen`, `WinScreen` (modal), `PausedScreen` (modal), `StatsPanel`, `SettingsPanel`, `ThemePicker`, `VariantPicker`, `DailyChallengeBanner`.

**Board components:** `Board`, `FoundationRow`, `FoundationPile`, `StockPile`, `WastePile`, `TableauColumn`, `CardView`, `CardFace`, `CardBack`, `PilePlaceholder`, `DragLayer`, `WinCascadeCanvas`.

**HUD:** `HUD`, `TimerDisplay`, `MoveCounter`, `ScoreDisplay`, `MenuButton`, `UndoButton`, `RedoButton`, `HintButton`, `RestartButton`.

**UI primitives:** `Button`, `IconButton`, `Toggle`, `SegmentedControl`, `Modal`, `Sheet`, `StatTile`, `AchievementBadge`, `ThemeSwatch`.

Design delivers a spec for each; code names files/components to match (e.g. `components/board/TableauColumn.tsx`).

---

---

## 11. Asset specification

### 11.1 Card faces (52)
- `viewBox="0 0 250 350"`, `--card-radius` applied by the container (SVG has square corners; the `CardView` clips).
- **Index block (top-left):** rank glyph anchored at `x=18, y=14`, glyph cap-height ≈ `46`; suit glyph centered under it, ≈ `30×30`, top at `y≈64`. Bottom-right index is the same block rotated 180° about card center.
- **Center field:** `x∈[44,206]`, `y∈[58,292]`.
  - Number cards (2–10): standard pip arrangements (original vector suit shapes), mirrored top/bottom, sizes scaling with count so the field stays balanced. Ace: one large central pip (~`90` tall).
  - Court cards (J/Q/K): **original** stylized designs within the center field — either full original figures or refined monogram crests. Must not trace any existing deck.
- **Color:** red suits use `--ink-red`, black suits `--ink-black`.
- **Delivery:** one optimized SVG per card, plus an option to emit a single sprite sheet (`<symbol>` per card) for runtime efficiency. Provide both source and minified.

### 11.2 Card back
- `viewBox="0 0 250 350"`. Original geometric/guilloché-inspired pattern, two-tone using `--card-back-base` + `--card-back-accent`, with a clean inner border inset ~`14` units. One back per theme.

### 11.3 Suit glyphs
- Four original vector paths (`clubs`, `diamonds`, `hearts`, `spades`) in `viewBox="0 0 100 100"`, currentColor-driven so they recolor via tokens.

### 11.4 Empty-pile placeholders
- `foundation`: faint suit watermark (`--foundation-watermark`) centered, optional "A" hint.
- `stock` (empty): recycle icon centered.
- `tableau` (empty): subtle rounded outline (`--placeholder-stroke` + `--placeholder-fill`).

### 11.5 Icon set (original, single-weight line icons, 24×24 grid)
`menu`, `undo`, `redo`, `hint` (lightbulb), `settings` (gear), `stats` (bar chart), `sound-on`, `sound-off`, `new-game` (shuffle/plus), `close`, `trophy`, `flame` (streak), `check`, `calendar` (daily), `back-arrow`, `play`.

### 11.6 Sound set (original, short, normalized −16 LUFS; `.webm/opus` + `.mp3` fallback)
`deal` (riffle), `pickup`, `place`, `flip`, `invalid`, `foundation-complete`, `win-fanfare`, `button-tap`, `recycle`. All optional via Sound setting; never autoplay before first interaction.

---

---

## 12. Feature specification

### 12.1 Game modes & options
- **Draw:** draw-1 / draw-3 (default draw-3).
- **Scoring:** `none`, `standard`, `vegas` (see §12.2).
- **Passes through stock:** unlimited (default) or limited (1 or 3) — a setting.
- **Left/right-handed layout:** mirror stock/waste vs foundations for thumb reach.
- **Winnable deals only** (see §12.5).
- **Timer:** on/off display (always tracked internally for stats).

### 12.2 Scoring
- **Standard:** +5 waste→tableau, +10 to foundation, +5 turn-over tableau card, −15 foundation→tableau, optional time bonus.
- **Vegas:** −$52 buy-in, +$5 per card to foundation; optional cumulative bankroll across games.
- **None:** pure relaxation; stats still track time/moves/win rate.

### 12.3 Stats (local, optional cloud)
Games played, games won, **win rate** (overall + per draw mode), current streak, best streak, best time (per mode), fewest moves, total time, win distribution. Honest and non-judgmental — losing a streak shows a neutral "streak reset," never guilt copy.

### 12.4 Achievements (original, non-coercive)
e.g. First Win, Win Without Undo, Sub-2-Minute Win, 7-Day Daily Streak, Win a Draw-3 Game, Comeback (win after a foundation→tableau worry-back). Cosmetic only.

### 12.5 Solver, hints & "winnable deals"
Research note: ~**82%** of Klondike deals are theoretically winnable (thoughtful play); real win rates are far lower because face-down cards hide information. So winnability needs a real solver, not a guess.

- **Hint engine (runtime, fast):** rank legal moves from `getLegalMoves` with a heuristic (prefer flips that reveal cards, foundation moves that don't strand needed cards, moves that empty a column for a King). Returns the best 1–2 moves; never needs a full solve. Powers `HintButton` and the `hintCardIds` highlight.
- **Winnability solver (heavier):** a depth-first backtracking solver with a transposition table and move-dominance pruning (the well-documented "Solvitaire"-style approach), running in a **Web Worker** with a node/time budget. Used for:
  - **Winnable-deals-only mode:** generate seeds in the worker, keep those the solver verifies winnable; precompute a **bundled seed pool** (ship a JSON list of verified-winnable seeds per draw mode) so the mode is instant offline, and top it up live in the background.
  - Optional **"Is this still winnable?"** indicator and **undo-to-winnable** (advanced/off by default).
- **Daily challenge:** uses the daily seed (§9.3). Decide per design whether dailies are guaranteed-winnable (recommended: yes, drawn from the verified pool) — flag it in the Daily UI either way.

### 12.6 Persistence
- **Local (default):** game state, settings, stats, achievements, seed pool, theme — in IndexedDB (via `idb`/`localforage`), with autosave on every move so a refresh resumes mid-game.
- **Cloud (optional, additive):** Supabase auth + a `saves`, `stats`, and `daily_results` schema for cross-device sync and a daily-challenge leaderboard. Pure enhancement — the game is fully functional with zero account.

### 12.7 Daily challenge & sharing
One deal per UTC day; completion time/moves recorded; optional shareable result string (spoiler-free, Wordle-style grid of move efficiency). Streak counts consecutive completed/won dailies.

---

---

## 13. Accessibility specification (not optional)

- **Keyboard play:** Tab/arrow to focus piles & cards; Enter/Space to pick up / drop / draw; Esc to cancel selection. Visible focus ring (uses `--accent`).
- **Screen reader:** each `CardView` has an `aria-label` like "Seven of Hearts, face up"; piles announce contents/counts; moves announce via a polite live region ("Moved Seven of Hearts to Eight of Spades"). Decorative SVGs `aria-hidden`.
- **Color-vision:** suits are distinguishable by *shape*, not just color; ship an optional **four-color deck** (clubs green, diamonds blue, hearts red, spades black) toggle. Text contrast ≥ 4.5:1 on all surfaces (verify each theme).
- **Motion:** honor `prefers-reduced-motion` (§8.7) and an explicit Motion toggle.
- **Targets:** interactive targets ≥ 44×44px on touch; card hit areas extend slightly beyond the visible card on mobile.
- **Text scaling:** UI uses `rem`/`clamp`; respects OS text size.

---

## 14. Cross-reference map (the explicit interconnection)

| Shared item (defined in) | Consumed by Cursor as… | Delivered by Claude Design as… |
|---|---|---|
| Color tokens §5.1 | `src/config/tokens.ts` + Tailwind `theme.extend.colors` + `:root[data-theme]` CSS vars | Token table per theme, named identically; swatches; applied in every mockup |
| Typography §5.2 | `--font-*` vars, `@font-face`/next/font | Type scale + font choices (same names) |
| Geometry §6 | CSS `--card-*`, `--gap-x`, `--overlap-*`; layout math | Redlined board at desktop/tablet/mobile using the same ratios |
| Z-layers §7 | `--z-*` vars used in stacking | Layered mockups labeled with the same z-names |
| Motion §8 | `--dur-*`, `--ease-*`, spring configs, cascade constants | Motion intent notes per interaction with the **same durations/easings**; cascade described, not redrawn |
| State model §9 | TS interfaces in `src/engine/types.ts` | Visual state matrix (face-down → in-cascade) |
| Component inventory §10 | file/component names | One design spec per named component |
| Asset spec §11 | SVG `viewBox 0 0 250 350`, sprite `<symbol>`s, icon/sound manifests | SVG assets to exact viewBoxes; icon set on 24-grid; suit glyphs 100-grid |
| Features §12 | engine modules, worker solver, persistence | Screens/states for modes, daily, stats, achievements, settings |
| A11y §13 | focus management, aria, four-color deck | focus states, four-color variant, contrast-checked palettes |

**Rule for both tools:** if you need a value not in this spec, do not invent a conflicting one — add it here (or ask), then use it. Cursor's `.cursor/rules` enforces this on the code side; the design prompt states it on the visual side.

---

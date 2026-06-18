import { describe, expect, it } from 'vitest';
import { buildDeck } from '../deck';
import { createRng, cyrb128, mulberry32, shuffle } from '../rng';
import { klondike } from '../variants/klondike';

const PINNED_SEED = 'klondike-20240618';

describe('rng', () => {
  it('cyrb128 produces stable hash for pinned seed', () => {
    expect(cyrb128(PINNED_SEED)).toEqual([379325237, 628110671, 2320811554, 3115907160]);
  });

  it('mulberry32 is deterministic from seed state', () => {
    const rng = mulberry32(379325237);
    expect(rng()).toBeCloseTo(0.23559687309898436, 10);
    expect(rng()).toBeCloseTo(0.15516220638528466, 10);
    expect(rng()).toBeCloseTo(0.13256316538900137, 10);
  });

  it('shuffle is deterministic for pinned seed', () => {
    const a = shuffle(buildDeck(), createRng(PINNED_SEED)).map((c) => c.id);
    const b = shuffle(buildDeck(), createRng(PINNED_SEED)).map((c) => c.id);
    expect(a).toEqual(b);
    expect(a).toHaveLength(52);
  });

  it('different seeds produce different shuffles', () => {
    const a = shuffle(buildDeck(), createRng('seed-a')).map((c) => c.id);
    const b = shuffle(buildDeck(), createRng('seed-b')).map((c) => c.id);
    expect(a).not.toEqual(b);
  });

  it('deal is byte-for-byte deterministic across calls', () => {
    const dealA = klondike.deal(buildDeck(), PINNED_SEED);
    const dealB = klondike.deal(buildDeck(), PINNED_SEED);

    for (const id of Object.keys(dealA)) {
      expect(dealA[id].cards.map((c) => `${c.id}:${c.faceUp}`)).toEqual(
        dealB[id].cards.map((c) => `${c.id}:${c.faceUp}`),
      );
    }
  });

  it('pinned daily deal has expected tableau tops and stock count', () => {
    const piles = klondike.deal(buildDeck(), PINNED_SEED);
    const tops = Array.from({ length: 7 }, (_, i) => {
      const col = piles[`tableau-${i}`].cards;
      return col[col.length - 1].id;
    });
    expect(tops).toEqual(['D6', 'SQ', 'S6', 'C6', 'H4', 'C9', 'D5']);
    expect(piles.stock.cards).toHaveLength(24);
    expect(piles.waste.cards).toHaveLength(0);
  });
});

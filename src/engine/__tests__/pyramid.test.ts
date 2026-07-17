import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { applyMove, draw, newGame, undo } from '../reducer';
import type { GameState, Pile } from '../types';
import { pyramid } from '../variants/pyramid';
import { isSlotFree, slotId } from '../variants/slotLayout';

function pile(id: string, type: Pile['type'], cards: ReturnType<typeof createCard>[]): Pile {
  return { id, type, cards };
}

function emptySlots(): Record<string, Pile> {
  const piles: Record<string, Pile> = {
    stock: pile('stock', 'stock', []),
    waste: pile('waste', 'waste', []),
    'foundation-0': pile('foundation-0', 'foundation', []),
  };
  for (let i = 0; i < 28; i++) piles[slotId(i)] = pile(slotId(i), 'slot', []);
  return piles;
}

function stateWith(overrides: Record<string, Pile>): GameState {
  return {
    variantId: 'pyramid',
    seed: 'test',
    drawCount: 1,
    scoreMode: 'standard',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: { ...emptySlots(), ...overrides },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

describe('pyramid deal', () => {
  it('deals 28 face-up slots and 24 stock', () => {
    const game = newGame({ seed: 'pyr-1', variant: pyramid, drawCount: 1 });
    let slots = 0;
    for (let i = 0; i < 28; i++) {
      const cards = game.piles[slotId(i)].cards;
      expect(cards).toHaveLength(1);
      expect(cards[0].faceUp).toBe(true);
      slots += 1;
    }
    expect(slots).toBe(28);
    expect(game.piles.stock.cards).toHaveLength(24);
    expect(game.piles.waste.cards).toHaveLength(0);
  });
});

describe('pyramid rules', () => {
  it('only bottom-row cards start free', () => {
    const game = newGame({ seed: 'pyr-free', variant: pyramid, drawCount: 1 });
    expect(isSlotFree(game, 27, 'pyramid')).toBe(true);
    expect(isSlotFree(game, 0, 'pyramid')).toBe(false);
  });

  it('removes a free King alone to the discard', () => {
    const king = createCard('spades', 13, true);
    const state = stateWith({
      [slotId(27)]: pile(slotId(27), 'slot', [king]),
    });
    expect(pyramid.canDrop(state, [king.id], slotId(27), 'foundation-0')).toBe(true);
    const next = applyMove(state, slotId(27), 'foundation-0', [king.id], 1, pyramid);
    expect(next.piles[slotId(27)].cards).toHaveLength(0);
    expect(next.piles['foundation-0'].cards.map((c) => c.id)).toEqual([king.id]);
  });

  it('removes a free pair that sums to 13', () => {
    const six = createCard('hearts', 6, true);
    const seven = createCard('clubs', 7, true);
    const leftover = createCard('spades', 5, true);
    const state = stateWith({
      [slotId(25)]: pile(slotId(25), 'slot', [leftover]),
      [slotId(26)]: pile(slotId(26), 'slot', [six]),
      [slotId(27)]: pile(slotId(27), 'slot', [seven]),
      stock: pile('stock', 'stock', [createCard('diamonds', 9, false)]),
    });
    expect(pyramid.canDrop(state, [six.id], slotId(26), slotId(27))).toBe(true);
    const next = applyMove(state, slotId(26), slotId(27), [six.id], 1, pyramid);
    expect(next.piles[slotId(26)].cards).toHaveLength(0);
    expect(next.piles[slotId(27)].cards).toHaveLength(0);
    expect(next.piles['foundation-0'].cards.map((c) => c.id).sort()).toEqual(
      [six.id, seven.id].sort(),
    );
    const reverted = undo(next);
    expect(reverted.piles[slotId(26)].cards.map((c) => c.id)).toEqual([six.id]);
    expect(reverted.piles[slotId(27)].cards.map((c) => c.id)).toEqual([seven.id]);
  });

  it('rejects covered cards', () => {
    const six = createCard('hearts', 6, true);
    const coverL = createCard('spades', 2, true);
    const coverR = createCard('spades', 3, true);
    const state = stateWith({
      [slotId(0)]: pile(slotId(0), 'slot', [six]),
      [slotId(1)]: pile(slotId(1), 'slot', [coverL]),
      [slotId(2)]: pile(slotId(2), 'slot', [coverR]),
      [slotId(27)]: pile(slotId(27), 'slot', [createCard('clubs', 7, true)]),
    });
    expect(isSlotFree(state, 0, 'pyramid')).toBe(false);
    expect(pyramid.canDrop(state, [six.id], slotId(0), slotId(27))).toBe(false);
  });

  it('draws one from stock to waste', () => {
    const state = stateWith({
      stock: pile('stock', 'stock', [createCard('diamonds', 4, false)]),
    });
    const next = draw(state, 1, pyramid);
    expect(next.piles.stock.cards).toHaveLength(0);
    expect(next.piles.waste.cards).toHaveLength(1);
    expect(next.piles.waste.cards[0].faceUp).toBe(true);
  });

  it('wins when all pyramid slots are empty', () => {
    const state = stateWith({});
    expect(pyramid.isWon(state)).toBe(true);
  });
});

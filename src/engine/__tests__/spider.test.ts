import { describe, expect, it } from 'vitest';
import { buildSpiderDeck, createCard } from '../deck';
import { applyMove, draw, newGame, undo } from '../reducer';
import type { Card, GameState, Pile, Rank } from '../types';
import { spider } from '../variants/spider';

function pile(id: string, type: Pile['type'], cards: Card[]): Pile {
  return { id, type, cards };
}

function copy(card: Card, suffix: string): Card {
  return { ...card, id: `${card.id}-${suffix}` };
}

function basePiles(): Record<string, Pile> {
  const piles: Record<string, Pile> = {
    stock: pile('stock', 'stock', []),
  };
  for (let i = 0; i < 8; i++) piles[`foundation-${i}`] = pile(`foundation-${i}`, 'foundation', []);
  for (let i = 0; i < 10; i++) {
    // Non-empty columns by default so stock deals are legal in tests.
    piles[`tableau-${i}`] = pile(`tableau-${i}`, 'tableau', [
      copy(createCard('hearts', 13, true), `filler-${i}`),
    ]);
  }
  return piles;
}

function stateWith(overrides: Record<string, Pile>): GameState {
  return {
    variantId: 'spider',
    seed: 'test',
    drawCount: 3,
    spiderSuits: 1,
    scoreMode: 'none',
    stockPassLimit: 'unlimited',
    stockRecycles: 0,
    piles: { ...basePiles(), ...overrides },
    selection: null,
    status: 'playing',
    moves: 0,
    score: 0,
    elapsedMs: 0,
    history: [],
    future: [],
  };
}

/** Face-up same-suit K→A run with unique ids. */
function fullRun(suffix: string): Card[] {
  return Array.from({ length: 13 }, (_, i) =>
    copy(createCard('spades', (13 - i) as Rank, true), suffix),
  );
}

describe('spider deck', () => {
  it('builds 104 unique cards for 1, 2, and 4 suits', () => {
    for (const suits of [1, 2, 4] as const) {
      const deck = buildSpiderDeck(suits);
      expect(deck).toHaveLength(104);
      expect(new Set(deck.map((c) => c.id)).size).toBe(104);
      expect(new Set(deck.map((c) => c.suit)).size).toBe(suits);
    }
  });
});

describe('spider deal', () => {
  it('deals 54 cards to tableau (6/6/6/6 then 5s), 50 to stock, tops face-up', () => {
    const game = newGame({ seed: 'abc12345', variant: spider, spiderSuits: 1 });
    for (let i = 0; i < 10; i++) {
      const cards = game.piles[`tableau-${i}`].cards;
      expect(cards).toHaveLength(i < 4 ? 6 : 5);
      expect(cards[cards.length - 1].faceUp).toBe(true);
      expect(cards.slice(0, -1).every((c) => !c.faceUp)).toBe(true);
    }
    expect(game.piles.stock.cards).toHaveLength(50);
    expect(game.piles.waste).toBeUndefined();
    expect(game.spiderSuits).toBe(1);
  });
});

describe('spider rules', () => {
  it('moves same-suit descending runs onto any rank+1 card or empty column', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [
        copy(createCard('spades', 8, true), 'a'),
        copy(createCard('spades', 7, true), 'a'),
      ]),
      'tableau-1': pile('tableau-1', 'tableau', [copy(createCard('hearts', 9, true), 'a')]),
      'tableau-2': pile('tableau-2', 'tableau', []),
    });
    expect(spider.canDrop(state, ['S8-a', 'S7-a'], 'tableau-0', 'tableau-1')).toBe(true);
    expect(spider.canDrop(state, ['S8-a', 'S7-a'], 'tableau-0', 'tableau-2')).toBe(true);
  });

  it('rejects mixed-suit runs and non-sequential drops', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [
        copy(createCard('spades', 8, true), 'a'),
        copy(createCard('hearts', 7, true), 'a'),
      ]),
      'tableau-1': pile('tableau-1', 'tableau', [copy(createCard('spades', 9, true), 'a')]),
      'tableau-2': pile('tableau-2', 'tableau', [copy(createCard('spades', 5, true), 'a')]),
    });
    // Mixed-suit tail cannot move as a unit…
    expect(spider.canDrop(state, ['S8-a', 'H7-a'], 'tableau-0', 'tableau-1')).toBe(false);
    // …but its single top card can, onto rank+1 of any suit.
    expect(spider.canDrop(state, ['H7-a'], 'tableau-0', 'tableau-1')).toBe(false);
    expect(spider.canDrop(state, ['H7-a'], 'tableau-0', 'tableau-2')).toBe(false);

    const single = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [copy(createCard('hearts', 8, true), 'a')]),
      'tableau-1': pile('tableau-1', 'tableau', [copy(createCard('spades', 9, true), 'a')]),
    });
    expect(spider.canDrop(single, ['H8-a'], 'tableau-0', 'tableau-1')).toBe(true);
  });

  it('never allows drops on foundations', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [copy(createCard('spades', 1, true), 'a')]),
    });
    expect(spider.canDrop(state, ['SA-a'], 'tableau-0', 'foundation-0')).toBe(false);
  });

  it('deals 10 cards from stock only when no column is empty', () => {
    const stocked = stateWith({
      stock: pile('stock', 'stock', fullRun('stock')),
    });
    expect(spider.getLegalMoves(stocked).some((m) => m.drew)).toBe(true);

    const withEmpty = stateWith({
      stock: pile('stock', 'stock', fullRun('stock')),
      'tableau-9': pile('tableau-9', 'tableau', []),
    });
    expect(spider.getLegalMoves(withEmpty).some((m) => m.drew)).toBe(false);
  });

  it('draw deals one face-up card to each column and undo restores stock', () => {
    const stockCards = fullRun('stock');
    const state = stateWith({
      stock: pile('stock', 'stock', stockCards),
    });

    const dealt = draw(state, Date.now(), spider);
    expect(dealt.piles.stock.cards).toHaveLength(3);
    for (let i = 0; i < 10; i++) {
      const cards = dealt.piles[`tableau-${i}`].cards;
      expect(cards).toHaveLength(2);
      expect(cards[cards.length - 1].faceUp).toBe(true);
    }

    const reverted = undo(dealt);
    expect(reverted.piles.stock.cards.map((c) => c.id)).toEqual(
      stockCards.map((c) => c.id),
    );
    for (let i = 0; i < 10; i++) {
      expect(reverted.piles[`tableau-${i}`].cards).toHaveLength(1);
    }
  });

  it('auto-clears a completed K→A run to a foundation and flips the exposed card', () => {
    const run = fullRun('a');
    const kingToQueen = run.slice(0, 12); // K..2
    const ace = run[12];

    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [
        copy(createCard('hearts', 5, false), 'buried'),
        ...kingToQueen,
      ]),
      'tableau-1': pile('tableau-1', 'tableau', [
        copy(createCard('hearts', 2, true), 'x'),
        ace,
      ]),
    });

    const next = applyMove(state, 'tableau-1', 'tableau-0', [ace.id], Date.now(), spider);

    expect(next.piles['foundation-0'].cards).toHaveLength(13);
    expect(next.piles['foundation-0'].suit).toBe('spades');
    expect(next.piles['tableau-0'].cards).toHaveLength(1);
    expect(next.piles['tableau-0'].cards[0].faceUp).toBe(true); // exposed card flipped

    const move = next.history[next.history.length - 1];
    expect(move.completed).toHaveLength(1);

    const reverted = undo(next);
    expect(reverted.piles['foundation-0'].cards).toHaveLength(0);
    expect(reverted.piles['tableau-0'].cards).toHaveLength(13); // buried + K..2
    expect(reverted.piles['tableau-0'].cards[0].faceUp).toBe(false);
    expect(
      reverted.piles['tableau-1'].cards[reverted.piles['tableau-1'].cards.length - 1].id,
    ).toBe(ace.id);
  });

  it('isWon when all eight foundations are complete', () => {
    const overrides: Record<string, Pile> = {};
    for (let i = 0; i < 8; i++) {
      overrides[`foundation-${i}`] = pile(`foundation-${i}`, 'foundation', fullRun(`f${i}`));
    }
    expect(spider.isWon(stateWith(overrides))).toBe(true);
    expect(spider.isWon(stateWith({}))).toBe(false);
  });

  it('autoMoveTarget prefers same-suit joins over off-suit and empty columns', () => {
    const state = stateWith({
      'tableau-0': pile('tableau-0', 'tableau', [copy(createCard('spades', 6, true), 'a')]),
      'tableau-1': pile('tableau-1', 'tableau', [copy(createCard('hearts', 7, true), 'a')]),
      'tableau-2': pile('tableau-2', 'tableau', [copy(createCard('spades', 7, true), 'a')]),
      'tableau-3': pile('tableau-3', 'tableau', []),
    });
    expect(spider.autoMoveTarget(state, 'S6-a')).toBe('tableau-2');
  });

  it('scores completed runs and flips in standard mode', () => {
    const move = {
      from: 'tableau-1',
      to: 'tableau-0',
      cardIds: ['SA-a'],
      completed: [
        { from: 'tableau-0', to: 'foundation-0', cardIds: [], flipped: undefined },
      ],
      flipped: { pileId: 'tableau-1', cardId: 'H2-x' },
      scoreDelta: 0,
      ts: 0,
    };
    expect(spider.score(move, 'standard')).toBe(105);
    expect(spider.score(move, 'none')).toBe(0);
  });

  it('stock deal that completes a run can be undone', () => {
    // K→2 already on tableau-0; Ace is stock top so the deal finishes the run.
    const partial = Array.from({ length: 12 }, (_, i) =>
      copy(createCard('spades', (13 - i) as Rank, true), 'run'),
    ); // K..2
    const ace = copy(createCard('spades', 1, true), 'deal');
    const fillers = Array.from({ length: 9 }, (_, i) =>
      copy(createCard('hearts', ((i % 13) + 1) as Rank, false), `f${i}`),
    );
    // Stock top = last element → dealt to tableau-0 first.
    const state = stateWith({
      stock: pile('stock', 'stock', [...fillers, ace]),
      'tableau-0': pile('tableau-0', 'tableau', [
        copy(createCard('hearts', 5, false), 'buried'),
        ...partial,
      ]),
      ...Object.fromEntries(
        Array.from({ length: 9 }, (_, i) => [
          `tableau-${i + 1}`,
          pile(`tableau-${i + 1}`, 'tableau', [copy(createCard('hearts', 8, true), `t${i}`)]),
        ]),
      ),
    });

    const drawn = draw(state, Date.now(), spider);
    expect(drawn).not.toBe(state);
    expect(drawn.piles['foundation-0'].cards).toHaveLength(13);
    expect(drawn.history[drawn.history.length - 1]?.completed?.length).toBe(1);

    const reverted = undo(drawn);
    expect(reverted.piles['foundation-0'].cards).toHaveLength(0);
    expect(reverted.piles.stock.cards.map((c) => c.id)).toEqual(
      state.piles.stock.cards.map((c) => c.id),
    );
  });
});

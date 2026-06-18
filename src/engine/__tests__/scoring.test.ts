import { describe, expect, it } from 'vitest';
import { createCard } from '../deck';
import { scoreMove, scoreStandard, scoreVegas, vegasBuyIn } from '../scoring';
import type { Move } from '../types';

function move(overrides: Partial<Move>): Move {
  return {
    from: 'waste',
    to: 'tableau-0',
    cardIds: ['H7'],
    scoreDelta: 0,
    ts: 0,
    ...overrides,
  };
}

describe('scoring', () => {
  it('none mode always returns 0', () => {
    expect(scoreMove(move({ to: 'foundation-0' }), 'none')).toBe(0);
    expect(scoreMove(move({ flipped: { pileId: 'tableau-1', cardId: 'C5' } }), 'none')).toBe(0);
  });

  it('standard: waste to tableau +5', () => {
    expect(scoreStandard(move({ from: 'waste', to: 'tableau-0' }))).toBe(5);
  });

  it('standard: to foundation +10', () => {
    expect(scoreStandard(move({ from: 'tableau-0', to: 'foundation-0' }))).toBe(10);
  });

  it('standard: flip +5', () => {
    expect(
      scoreStandard(
        move({
          from: 'tableau-1',
          to: 'tableau-0',
          flipped: { pileId: 'tableau-1', cardId: 'C5' },
        }),
      ),
    ).toBe(5);
  });

  it('standard: foundation to tableau -15', () => {
    const delta = scoreStandard(move({ from: 'foundation-0', to: 'tableau-2' }));
    expect(delta).toBe(-15);
  });

  it('standard: draw and recycle score 0', () => {
    expect(scoreStandard(move({ drew: 3, cardIds: [] }))).toBe(0);
    expect(scoreStandard(move({ recycled: true, cardIds: [] }))).toBe(0);
  });

  it('vegas: buy-in is -52', () => {
    expect(vegasBuyIn('vegas')).toBe(-52);
    expect(vegasBuyIn('standard')).toBe(0);
  });

  it('vegas: +5 per card to foundation', () => {
    expect(scoreVegas(move({ to: 'foundation-0', cardIds: ['HA'] }))).toBe(5);
    expect(scoreVegas(move({ to: 'tableau-0' }))).toBe(0);
  });

  it('vegas: draw and recycle score 0', () => {
    expect(scoreVegas(move({ drew: 3, cardIds: [], to: 'waste' }))).toBe(0);
    expect(scoreVegas(move({ recycled: true, cardIds: [], to: 'stock' }))).toBe(0);
  });
});

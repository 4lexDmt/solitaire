import type { Move, ScoreMode } from './types';

/** Standard scoring per SPEC §12.2 */
export function scoreStandard(move: Move): number {
  if (move.recycled || move.drew) {
    return 0;
  }

  const { from, to, flipped } = move;
  let delta = 0;

  if (to.startsWith('foundation-')) {
    delta += 10;
  }

  if (from === 'waste' && to.startsWith('tableau-')) {
    delta += 5;
  }

  if (from.startsWith('foundation-') && to.startsWith('tableau-')) {
    delta -= 15;
  }

  if (flipped) {
    delta += 5;
  }

  return delta;
}

/** Vegas scoring per SPEC §12.2: +$5 per card to foundation */
export function scoreVegas(move: Move): number {
  if (move.recycled || move.drew) {
    return 0;
  }

  if (move.to.startsWith('foundation-')) {
    return move.cardIds.length * 5;
  }

  return 0;
}

export function scoreMove(move: Move, mode: ScoreMode): number {
  switch (mode) {
    case 'none':
      return 0;
    case 'standard':
      return scoreStandard(move);
    case 'vegas':
      return scoreVegas(move);
  }
}

/** Vegas buy-in applied when a new game starts */
export function vegasBuyIn(mode: ScoreMode): number {
  return mode === 'vegas' ? -52 : 0;
}

import type { GameState } from '@/engine/types';
import { getVariant } from '@/engine/variants';

function allCardsFaceUpExceptStock(state: GameState): boolean {
  for (const pile of Object.values(state.piles)) {
    if (pile.type === 'stock') continue;
    for (const card of pile.cards) {
      if (!card.faceUp) return false;
    }
  }
  return true;
}

/** Every tableau column non-increasing by rank top-down — trivially finishable. */
function allTableausOrdered(state: GameState): boolean {
  for (const pile of Object.values(state.piles)) {
    if (pile.type !== 'tableau') continue;
    for (let i = 1; i < pile.cards.length; i++) {
      if (pile.cards[i].rank > pile.cards[i - 1].rank) return false;
    }
  }
  return true;
}

/** True when only foundation moves remain — SPEC §8.6 */
export function canAutoComplete(state: GameState): boolean {
  if (state.status !== 'playing') return false;

  const variant = getVariant(state.variantId);
  if (variant.foundationsLocked) return false; // Spider / Pyramid discard / TriPeaks
  if (variant.id === 'pyramid' || variant.id === 'tripeaks') return false;

  if (!allCardsFaceUpExceptStock(state)) return false;
  if (variant.isWon(state)) return false;

  // FreeCell: ordered tableaus + at least one foundation play. Empty free cells
  // must not block Finish (parking moves are still legal but irrelevant).
  if (variant.id === 'freecell') {
    if (!allTableausOrdered(state)) return false;
    return variant.getLegalMoves(state).some((m) => m.to.startsWith('foundation-'));
  }

  const moves = variant.getLegalMoves(state).filter((m) => !m.drew && !m.recycled);
  if (moves.length === 0) return false;

  return moves.every((m) => m.to.startsWith('foundation-'));
}

export function getAutoCompleteMoves(state: GameState) {
  const variant = getVariant(state.variantId);
  return variant
    .getLegalMoves(state)
    .filter((m) => !m.drew && !m.recycled && m.to.startsWith('foundation-'));
}

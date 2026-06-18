import type { GameState } from '@/engine/types';
import { klondike } from '@/engine/variants/klondike';

function allCardsFaceUpExceptStock(state: GameState): boolean {
  for (const pile of Object.values(state.piles)) {
    if (pile.id === 'stock') continue;
    for (const card of pile.cards) {
      if (!card.faceUp) return false;
    }
  }
  return true;
}

/** True when only foundation moves remain — SPEC §8.6 */
export function canAutoComplete(state: GameState): boolean {
  if (state.status !== 'playing') return false;
  if (!allCardsFaceUpExceptStock(state)) return false;

  const moves = klondike.getLegalMoves(state).filter((m) => !m.drew && !m.recycled);
  if (moves.length === 0) return false;

  return moves.every((m) => m.to.startsWith('foundation-'));
}

export function getAutoCompleteMoves(state: GameState) {
  return klondike
    .getLegalMoves(state)
    .filter((m) => !m.drew && !m.recycled && m.to.startsWith('foundation-'));
}

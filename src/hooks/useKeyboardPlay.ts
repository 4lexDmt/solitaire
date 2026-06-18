'use client';

import { useCallback, useMemo, useState } from 'react';
import type { GameState } from '@/engine/types';
import { klondike } from '@/engine/variants/klondike';
import { cardAriaLabel } from '@/lib/layout';
import { getMovableCardIds } from '@/lib/hitTest';

export type FocusTarget =
  | { kind: 'pile'; pileId: string }
  | { kind: 'card'; pileId: string; cardId: string };

const PILE_ORDER = [
  'stock',
  'waste',
  'foundation-0',
  'foundation-1',
  'foundation-2',
  'foundation-3',
  'tableau-0',
  'tableau-1',
  'tableau-2',
  'tableau-3',
  'tableau-4',
  'tableau-5',
  'tableau-6',
] as const;

function targetKey(target: FocusTarget): string {
  return target.kind === 'pile'
    ? `${target.pileId}:pile`
    : `${target.pileId}:${target.cardId}`;
}

function buildFocusables(game: GameState): FocusTarget[] {
  const items: FocusTarget[] = [{ kind: 'pile', pileId: 'stock' }];

  const wasteTop = game.piles.waste.cards[game.piles.waste.cards.length - 1];
  if (wasteTop?.faceUp) {
    items.push({ kind: 'card', pileId: 'waste', cardId: wasteTop.id });
  } else if (game.piles.waste.cards.length === 0) {
    items.push({ kind: 'pile', pileId: 'waste' });
  }

  for (const fid of ['foundation-0', 'foundation-1', 'foundation-2', 'foundation-3']) {
    const pile = game.piles[fid];
    const top = pile.cards[pile.cards.length - 1];
    if (top?.faceUp) {
      items.push({ kind: 'card', pileId: fid, cardId: top.id });
    } else {
      items.push({ kind: 'pile', pileId: fid });
    }
  }

  for (const tid of [
    'tableau-0',
    'tableau-1',
    'tableau-2',
    'tableau-3',
    'tableau-4',
    'tableau-5',
    'tableau-6',
  ]) {
    const pile = game.piles[tid];
    if (pile.cards.length === 0) {
      items.push({ kind: 'pile', pileId: tid });
      continue;
    }
    for (const card of pile.cards) {
      if (card.faceUp) {
        items.push({ kind: 'card', pileId: tid, cardId: card.id });
      }
    }
  }

  return items;
}

interface UseKeyboardPlayOptions {
  game: GameState;
  onSelect: (pileId: string, cardId: string) => void;
  onClearSelection: () => void;
  onMove: (from: string, to: string, cardIds: string[]) => boolean;
  onDrawOrRecycle: () => void;
  onAnnounce?: (message: string) => void;
}

export function useKeyboardPlay({
  game,
  onSelect,
  onClearSelection,
  onMove,
  onDrawOrRecycle,
  onAnnounce,
}: UseKeyboardPlayOptions) {
  const focusables = useMemo(() => buildFocusables(game), [game]);
  const [focusedKey, setFocusedKey] = useState(() => targetKey({ kind: 'pile', pileId: 'stock' }));
  const selection = game.selection;

  const focused =
    focusables.find((f) => targetKey(f) === focusedKey) ??
    focusables[0] ??
    ({ kind: 'pile', pileId: 'stock' } as FocusTarget);

  const moveFocus = useCallback(
    (delta: number) => {
      const idx = focusables.findIndex((f) => targetKey(f) === focusedKey);
      const next = focusables[(idx + delta + focusables.length) % focusables.length];
      setFocusedKey(targetKey(next));
    },
    [focusables, focusedKey],
  );

  const moveFocusDirection = useCallback(
    (direction: 'left' | 'right' | 'up' | 'down') => {
      if (direction === 'left' || direction === 'right') {
        const pileId =
          focused.kind === 'card' ? focused.pileId : focused.pileId;
        const pileIdx = PILE_ORDER.indexOf(pileId as (typeof PILE_ORDER)[number]);
        if (pileIdx < 0) return;

        const delta = direction === 'right' ? 1 : -1;
        const nextPile = PILE_ORDER[pileIdx + delta];
        if (!nextPile) return;

        const pile = game.piles[nextPile];
        const top = pile.cards[pile.cards.length - 1];
        const target: FocusTarget = top?.faceUp
          ? { kind: 'card', pileId: nextPile, cardId: top.id }
          : { kind: 'pile', pileId: nextPile };
        setFocusedKey(targetKey(target));
        return;
      }

      if (focused.kind === 'card' && focused.pileId.startsWith('tableau-')) {
        const pile = game.piles[focused.pileId];
        const cardIdx = pile.cards.findIndex((c) => c.id === focused.cardId);
        const delta = direction === 'up' ? -1 : 1;
        const nextIdx = cardIdx + delta;
        if (nextIdx >= 0 && nextIdx < pile.cards.length && pile.cards[nextIdx].faceUp) {
          setFocusedKey(
            targetKey({
              kind: 'card',
              pileId: focused.pileId,
              cardId: pile.cards[nextIdx].id,
            }),
          );
        }
      }
    },
    [focused, game.piles],
  );

  const activateFocused = useCallback(() => {
    if (game.status !== 'playing') return;

    if (focused.kind === 'pile' && focused.pileId === 'stock') {
      onClearSelection();
      onDrawOrRecycle();
      onAnnounce?.('Drew from stock');
      return;
    }

    if (focused.kind === 'pile') {
      if (selection) {
        const cardIds = getMovableCardIds(game, selection.pileId, selection.cardId);
        if (
          cardIds &&
          klondike.canDrop(game, cardIds, selection.pileId, focused.pileId)
        ) {
          if (onMove(selection.pileId, focused.pileId, cardIds)) {
            const card = game.piles[selection.pileId].cards.find(
              (c) => c.id === selection.cardId,
            );
            if (card) onAnnounce?.(`Moved ${cardAriaLabel(card)}`);
          }
        } else {
          onClearSelection();
        }
      }
      return;
    }

    const { pileId, cardId } = focused;

    if (!selection) {
      const cardIds = getMovableCardIds(game, pileId, cardId);
      if (cardIds) onSelect(pileId, cardIds[0]);
      return;
    }

    if (selection.pileId === pileId && selection.cardId === cardId) {
      onClearSelection();
      return;
    }

    const cardIds = getMovableCardIds(game, selection.pileId, selection.cardId);
    if (cardIds && klondike.canDrop(game, cardIds, selection.pileId, pileId)) {
      if (onMove(selection.pileId, pileId, cardIds)) {
        const card = game.piles[selection.pileId].cards.find((c) => c.id === selection.cardId);
        if (card) onAnnounce?.(`Moved ${cardAriaLabel(card)}`);
      }
      return;
    }

    const atFocus = getMovableCardIds(game, pileId, cardId);
    if (atFocus) onSelect(pileId, atFocus[0]);
    else onClearSelection();
  }, [
    focused,
    game,
    onAnnounce,
    onClearSelection,
    onDrawOrRecycle,
    onMove,
    onSelect,
    selection,
  ]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          moveFocus(event.shiftKey ? -1 : 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          moveFocusDirection('right');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          moveFocusDirection('left');
          break;
        case 'ArrowUp':
          event.preventDefault();
          moveFocusDirection('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          moveFocusDirection('down');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          activateFocused();
          break;
        case 'Escape':
          event.preventDefault();
          onClearSelection();
          break;
        default:
          break;
      }
    },
    [activateFocused, moveFocus, moveFocusDirection, onClearSelection],
  );

  const getFocusProps = useCallback(
    (target: FocusTarget) => ({
      tabIndex: targetKey(target) === focusedKey ? 0 : -1,
      onFocus: () => setFocusedKey(targetKey(target)),
      'data-focused': targetKey(target) === focusedKey ? true : undefined,
    }),
    [focusedKey],
  );

  const isFocused = useCallback(
    (target: FocusTarget) => targetKey(target) === focusedKey,
    [focusedKey],
  );

  return {
    handleKeyDown,
    getFocusProps,
    isFocused,
    focused,
  };
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CASCADE, Z } from '@/config/tokens';
import type { Card, GameState } from '@/engine/types';
import { klondike } from '@/engine/variants/klondike';
import {
  getMovableCardIds,
  resolvePointerTarget,
} from '@/lib/hitTest';

const DRAG_THRESHOLD_PX = 5;

export interface ActiveDrag {
  from: string;
  cardIds: string[];
  cards: Card[];
  grabOffsetX: number;
  grabOffsetY: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
}

export interface RejectDrag {
  cards: Card[];
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

interface UseCardDragOptions {
  boardRef: React.RefObject<HTMLElement | null>;
  game: GameState;
  motionEnabled: boolean;
  onMove: (from: string, to: string, cardIds: string[]) => boolean;
  onInvalidDrop?: (cardId: string) => void;
  onDragEnd?: () => void;
}

export function useCardDrag({
  boardRef,
  game,
  motionEnabled,
  onMove,
  onInvalidDrop,
  onDragEnd,
}: UseCardDragOptions) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);
  const [reject, setReject] = useState<RejectDrag | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pointerIdRef = useRef<number | null>(null);
  const dragRef = useRef<ActiveDrag | null>(null);
  const draggingRef = useRef(false);
  const pendingRef = useRef<{
    pileId: string;
    cardId: string;
    cardIds: string[];
    cards: Card[];
    startX: number;
    startY: number;
    originRect: DOMRect;
  } | null>(null);

  const clearReject = useCallback(() => {
    setReject(null);
  }, []);

  const finishActiveDrag = useCallback(
    (clientX: number, clientY: number, active: ActiveDrag) => {
      const board = boardRef.current;
      if (!board) {
        setDrag(null);
        setDropTarget(null);
        setIsDragging(false);
        onDragEnd?.();
        return;
      }

      const target = resolvePointerTarget(board, clientX, clientY);
      const toPile = target?.pileId ?? null;

      if (toPile && klondike.canDrop(game, active.cardIds, active.from, toPile)) {
        onMove(active.from, toPile, active.cardIds);
        dragRef.current = null;
        setDrag(null);
        setDropTarget(null);
        draggingRef.current = false;
        setIsDragging(false);
        onDragEnd?.();
        return;
      }

      onInvalidDrop?.(active.cardIds[0]);
      setReject({
        cards: active.cards,
        fromX: active.x,
        fromY: active.y,
        toX: active.originX,
        toY: active.originY,
      });
      dragRef.current = null;
      setDrag(null);
      setDropTarget(null);
      draggingRef.current = false;
      setIsDragging(false);
      onDragEnd?.();
    },
    [boardRef, game, onDragEnd, onInvalidDrop, onMove],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      const pending = pendingRef.current;
      if (!pending || pointerIdRef.current !== event.pointerId) return;

      const dx = event.clientX - pending.startX;
      const dy = event.clientY - pending.startY;

      if (!draggingRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

      if (!draggingRef.current) {
        draggingRef.current = true;
        setIsDragging(true);
        const nextDrag: ActiveDrag = {
          from: pending.pileId,
          cardIds: pending.cardIds,
          cards: pending.cards,
          grabOffsetX: pending.startX - pending.originRect.left,
          grabOffsetY: pending.startY - pending.originRect.top,
          originX: pending.originRect.left,
          originY: pending.originRect.top,
          x: event.clientX - (pending.startX - pending.originRect.left),
          y: event.clientY - (pending.startY - pending.originRect.top),
        };
        dragRef.current = nextDrag;
        setDrag(nextDrag);
      } else {
        setDrag((prev) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            x: event.clientX - prev.grabOffsetX,
            y: event.clientY - prev.grabOffsetY,
          };
          dragRef.current = next;
          return next;
        });
      }

      const board = boardRef.current;
      if (board) {
        const target = resolvePointerTarget(board, event.clientX, event.clientY);
        const pileId = target?.pileId ?? null;
        if (
          pileId &&
          pileId !== pending.pileId &&
          klondike.canDrop(game, pending.cardIds, pending.pileId, pileId)
        ) {
          setDropTarget(pileId);
        } else {
          setDropTarget(null);
        }
      }
    },
    [boardRef, game],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) return;

      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const active = dragRef.current;
      pendingRef.current = null;
      pointerIdRef.current = null;

      if (active) {
        finishActiveDrag(event.clientX, event.clientY, active);
      } else {
        draggingRef.current = false;
        setIsDragging(false);
      }
    },
    [finishActiveDrag, onPointerMove],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  const beginDrag = useCallback(
    (
      pileId: string,
      cardId: string,
      element: HTMLElement,
      clientX: number,
      clientY: number,
      pointerId: number,
    ) => {
      if (game.status !== 'playing') return;

      const cardIds = getMovableCardIds(game, pileId, cardId);
      if (!cardIds) return;

      const pile = game.piles[pileId];
      const startIdx = pile.cards.findIndex((c) => c.id === cardIds[0]);
      const cards = pile.cards.slice(startIdx);
      const originRect = element.getBoundingClientRect();

      pendingRef.current = {
        pileId,
        cardId,
        cardIds,
        cards,
        startX: clientX,
        startY: clientY,
        originRect,
      };
      pointerIdRef.current = pointerId;

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [game, onPointerMove, onPointerUp],
  );

  return {
    drag,
    reject,
    dropTarget,
    beginDrag,
    isDragging,
    clearReject,
    motionEnabled,
    dragScale: motionEnabled ? CASCADE.dragScale : 1,
    dragZIndex: Z.cardDragging,
  };
}

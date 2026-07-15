'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CASCADE, Z } from '@/config/tokens';
import type { Card, GameState } from '@/engine/types';
import { getVariant } from '@/engine/variants';
import {
  getMovableCardIds,
  resolvePointerTarget,
} from '@/lib/hitTest';

const DRAG_THRESHOLD_PX = 5;
const DOUBLE_TAP_MS = 400;

export interface TapTarget {
  pileId: string;
  cardId: string;
}

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
  onDoubleTap?: (pileId: string, cardId: string) => void;
  onInvalidDrop?: (cardId: string) => void;
  onDragEnd?: () => void;
  onSuppressClick?: () => void;
}

export function useCardDrag({
  boardRef,
  game,
  motionEnabled,
  onMove,
  onDoubleTap,
  onInvalidDrop,
  onDragEnd,
  onSuppressClick,
}: UseCardDragOptions) {
  const [drag, setDrag] = useState<ActiveDrag | null>(null);
  const [reject, setReject] = useState<RejectDrag | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const gameRef = useRef(game);
  gameRef.current = game;

  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const onInvalidDropRef = useRef(onInvalidDrop);
  onInvalidDropRef.current = onInvalidDrop;

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const onDoubleTapRef = useRef(onDoubleTap);
  onDoubleTapRef.current = onDoubleTap;

  const onSuppressClickRef = useRef(onSuppressClick);
  onSuppressClickRef.current = onSuppressClick;

  const pointerIdRef = useRef<number | null>(null);
  const captureElementRef = useRef<HTMLElement | null>(null);
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
  const lastTapRef = useRef<{ target: TapTarget; time: number } | null>(null);

  const clearReject = useCallback(() => {
    setReject(null);
  }, []);

  const resetDragState = useCallback(() => {
    pendingRef.current = null;
    pointerIdRef.current = null;
    dragRef.current = null;
    draggingRef.current = false;
    setDrag(null);
    setDropTarget(null);
    setIsDragging(false);
  }, []);

  const finishActiveDragRef = useRef(
    (clientX: number, clientY: number, active: ActiveDrag) => {
      void clientX;
      void clientY;
      void active;
    },
  );

  finishActiveDragRef.current = (clientX: number, clientY: number, active: ActiveDrag) => {
    const board = boardRef.current;
    const currentGame = gameRef.current;

    if (!board) {
      resetDragState();
      onDragEndRef.current?.();
      return;
    }

    const target = resolvePointerTarget(board, clientX, clientY);
    const toPile = target?.pileId ?? null;

    if (
      toPile &&
      getVariant(currentGame.variantId).canDrop(currentGame, active.cardIds, active.from, toPile)
    ) {
      onMoveRef.current(active.from, toPile, active.cardIds);
      resetDragState();
      onDragEndRef.current?.();
      return;
    }

    onInvalidDropRef.current?.(active.cardIds[0]);
    setReject({
      cards: active.cards,
      fromX: active.x,
      fromY: active.y,
      toX: active.originX,
      toY: active.originY,
    });
    resetDragState();
    onDragEndRef.current?.();
  };

  const releasePointerCapture = useCallback(() => {
    const element = captureElementRef.current;
    const pointerId = pointerIdRef.current;
    if (element && pointerId !== null && element.hasPointerCapture(pointerId)) {
      element.releasePointerCapture(pointerId);
    }
    captureElementRef.current = null;
  }, []);

  const handlePointerMoveRef = useRef((event: PointerEvent) => {
    void event;
  });

  handlePointerMoveRef.current = (event: PointerEvent) => {
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
        getVariant(gameRef.current.variantId).canDrop(
          gameRef.current,
          pending.cardIds,
          pending.pileId,
          pileId,
        )
      ) {
        setDropTarget(pileId);
      } else {
        setDropTarget(null);
      }
    }
  };

  const handlePointerUpRef = useRef((event: PointerEvent) => {
    void event;
  });

  handlePointerUpRef.current = (event: PointerEvent) => {
    if (pointerIdRef.current !== event.pointerId) return;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    releasePointerCapture();

    const active = dragRef.current;
    const pending = pendingRef.current;
    pendingRef.current = null;
    pointerIdRef.current = null;

    if (active) {
      finishActiveDragRef.current(event.clientX, event.clientY, active);
    } else if (pending) {
      draggingRef.current = false;
      setIsDragging(false);
    } else {
      draggingRef.current = false;
      setIsDragging(false);
    }
  };

  const onPointerMove = useCallback((event: PointerEvent) => {
    handlePointerMoveRef.current(event);
  }, []);

  const onPointerUp = useCallback((event: PointerEvent) => {
    handlePointerUpRef.current(event);
  }, [releasePointerCapture]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      releasePointerCapture();
    };
  }, [onPointerMove, onPointerUp, releasePointerCapture]);

  const beginDrag = useCallback(
    (
      pileId: string,
      cardId: string,
      element: HTMLElement,
      clientX: number,
      clientY: number,
      pointerId: number,
    ) => {
      if (gameRef.current.status !== 'playing') return;

      const cardIds = getMovableCardIds(gameRef.current, pileId, cardId);
      if (!cardIds) return;

      const now = Date.now();
      const last = lastTapRef.current;
      const isDoubleTap =
        last &&
        last.target.pileId === pileId &&
        last.target.cardId === cardId &&
        now - last.time < DOUBLE_TAP_MS;

      if (isDoubleTap) {
        lastTapRef.current = null;
        onSuppressClickRef.current?.();
        onDoubleTapRef.current?.(pileId, cardId);
        return;
      }

      lastTapRef.current = {
        target: { pileId, cardId },
        time: now,
      };

      const pile = gameRef.current.piles[pileId];
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
      captureElementRef.current = element;

      try {
        element.setPointerCapture(pointerId);
      } catch {
        // Some browsers reject capture on non-primary pointers.
      }

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [onPointerMove, onPointerUp],
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

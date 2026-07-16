'use client';

import { LiveRegion } from '@/components/a11y/LiveRegion';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState } from '@/engine/types';
import { useCardDrag } from '@/hooks/useCardDrag';
import { useKeyboardPlay } from '@/hooks/useKeyboardPlay';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { canAutoComplete, getAutoCompleteMoves } from '@/lib/autoComplete';
import { HAPTIC, vibrate } from '@/lib/haptics';
import { cardAriaLabel } from '@/lib/layout';
import { getMovableCardIds, resolveTargetAtPoint } from '@/lib/hitTest';
import { playSound, setSoundEnabled, unlockAudio } from '@/lib/sound';
import { useGameStore } from '@/state/store';
import { useSettingsStore } from '@/state/settings';
import { flashStatus } from '@/lib/statusFlash';
import { AutoCompleteBar } from './AutoCompleteBar';
import { CellPile } from './CellPile';
import { DragLayer } from './DragLayer';
import { FoundationRow } from './FoundationRow';
import { StockPile } from './StockPile';
import { TableauColumn } from './TableauColumn';
import { WastePile } from './WastePile';
import './board.css';

function pileIndex(id: string): number {
  return Number(id.split('-')[1] ?? 0);
}

function pilesOfType(game: GameState, type: string) {
  return Object.values(game.piles)
    .filter((p) => p.type === type)
    .sort((a, b) => pileIndex(a.id) - pileIndex(b.id));
}

interface BoardProps {
  game: GameState;
}

export function Board({ game }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const suppressClickRef = useRef(false);
  const [shakeCardId, setShakeCardId] = useState<string | null>(null);
  const [invalidFlashCardId, setInvalidFlashCardId] = useState<string | null>(null);
  const [foundationSparkle, setFoundationSparkle] = useState<string | null>(null);
  const [autoCompleteBusy, setAutoCompleteBusy] = useState(false);
  const [lastInvalidCardId, setLastInvalidCardId] = useState<string | null>(null);
  const prevHistoryLen = useRef(game.history.length);
  const prevSeedRef = useRef(game.seed);

  const move = useGameStore((s) => s.move);
  const drawOrRecycle = useGameStore((s) => s.drawOrRecycle);
  const setSelection = useGameStore((s) => s.setSelection);
  const clearSelection = useGameStore((s) => s.clearSelection);
  const autoMoveToFoundation = useGameStore((s) => s.autoMoveToFoundation);

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const motionSetting = useSettingsStore((s) => s.motionEnabled);
  const leftHanded = useSettingsStore((s) => s.leftHanded);
  const { reducedMotion } = useReducedMotion();
  const motionEnabled = motionSetting && !reducedMotion;

  const hintCardIds = game.hintCardIds ?? [];
  const foundations = pilesOfType(game, 'foundation');
  const tableaus = pilesOfType(game, 'tableau');
  const cells = pilesOfType(game, 'cell');
  const stockPile = game.piles.stock;
  const wastePile = game.piles.waste;
  const selection = game.selection;
  const showAutoComplete = canAutoComplete(game);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Instant deal (design file) — play deal sound, no flying cards.
  useEffect(() => {
    if (prevSeedRef.current === game.seed) return;
    prevSeedRef.current = game.seed;
    playSound('deal');
  }, [game.seed]);

  useEffect(() => {
    const lastMove = game.history[game.history.length - 1];
    if (game.history.length <= prevHistoryLen.current || !lastMove) {
      prevHistoryLen.current = game.history.length;
      return;
    }

    if (lastMove.flipped) playSound('flip');

    const completedTo = lastMove.completed?.[0]?.to;
    if (lastMove.to.startsWith('foundation-') || completedTo) {
      playSound('foundation');
      vibrate(HAPTIC.foundationDrop, hapticsEnabled);
      setFoundationSparkle(completedTo ?? lastMove.to);
      window.setTimeout(() => setFoundationSparkle(null), 600);
    } else {
      playSound('drop');
    }

    prevHistoryLen.current = game.history.length;
  }, [game.history, hapticsEnabled]);

  useEffect(() => {
    if (!lastInvalidCardId) return;
    if (reducedMotion) {
      setInvalidFlashCardId(lastInvalidCardId);
      window.setTimeout(() => setInvalidFlashCardId(null), 320);
    } else {
      setShakeCardId(lastInvalidCardId);
      window.setTimeout(() => setShakeCardId(null), 320);
    }
    setLastInvalidCardId(null);
  }, [lastInvalidCardId, reducedMotion]);

  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  const handleInvalidDrop = useCallback((cardId: string) => {
    playSound('invalid');
    setLastInvalidCardId(cardId);
  }, []);

  const suppressNextClick = useCallback(() => {
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }, []);

  const handleFoundationAutoMove = useCallback(
    (pileId: string, cardId: string) => {
      if (game.status !== 'playing') return;
      clearSelection();
      if (!autoMoveToFoundation(pileId, cardId)) {
        handleInvalidDrop(cardId);
      }
    },
    [autoMoveToFoundation, clearSelection, game.status, handleInvalidDrop],
  );

  const { drag, reject, dropTarget, beginDrag, isDragging, clearReject } = useCardDrag({
    boardRef,
    game,
    motionEnabled,
    onMove: move,
    onDoubleTap: handleFoundationAutoMove,
    onInvalidDrop: handleInvalidDrop,
    onSuppressClick: suppressNextClick,
    onDragEnd: suppressNextClick,
  });

  const { handleKeyDown, getFocusProps, isFocused } = useKeyboardPlay({
    game,
    onSelect: (pileId, cardId) => setSelection({ pileId, cardId }),
    onClearSelection: clearSelection,
    onMove: move,
    onDrawOrRecycle: drawOrRecycle,
    onAnnounce: announce,
  });

  const handlePointerDown = useCallback(
    (pileId: string, cardId: string, event: React.PointerEvent<HTMLElement>) => {
      if (game.status !== 'playing' || event.button !== 0) return;
      unlockAudio();
      vibrate(HAPTIC.pickup, hapticsEnabled);
      playSound('pickup');
      const target = event.currentTarget;
      beginDrag(pileId, cardId, target, event.clientX, event.clientY, event.pointerId);
    },
    [beginDrag, game.status, hapticsEnabled],
  );

  const handlePileActivate = useCallback(
    (pileId: string, cardId?: string | null) => {
      if (game.status !== 'playing') return;
      unlockAudio();

      if (pileId === 'stock') {
        clearSelection();
        if (game.variantId === 'spider') {
          const hasEmpty = Object.values(game.piles).some(
            (p) => p.type === 'tableau' && p.cards.length === 0,
          );
          const stockLen = game.piles.stock?.cards.length ?? 0;
          if (hasEmpty && stockLen > 0) {
            playSound('invalid');
            flashStatus('Fill every empty column before dealing.');
            return;
          }
        }
        const beforeMoves = game.moves;
        drawOrRecycle();
        const after = useGameStore.getState().game;
        if (after.moves > beforeMoves) playSound('deal');
        return;
      }

      if (!selection) {
        const ids = getMovableCardIds(game, pileId, cardId ?? null);
        if (ids) setSelection({ pileId, cardId: ids[0] });
        return;
      }

      const { pileId: from, cardId: selectedId } = selection;
      const cardIds = getMovableCardIds(game, from, selectedId);
      if (!cardIds) {
        clearSelection();
        return;
      }

      if (pileId === from && cardId === selectedId) {
        clearSelection();
        return;
      }

      if (move(from, pileId, cardIds)) {
        const card = game.piles[from].cards.find((c) => c.id === selectedId);
        if (card) announce(`Moved ${cardAriaLabel(card)}`);
        return;
      }

      if (cardId) handleInvalidDrop(selectedId);

      if (cardId) {
        const ids = getMovableCardIds(game, pileId, cardId);
        if (ids) setSelection({ pileId, cardId: ids[0] });
        else clearSelection();
      } else {
        clearSelection();
      }
    },
    [announce, clearSelection, drawOrRecycle, game, handleInvalidDrop, move, selection, setSelection],
  );

  const handleBoardClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (suppressClickRef.current || isDragging || game.status !== 'playing') return;
      const board = boardRef.current;
      if (!board) return;

      const target = resolveTargetAtPoint(board, game, event.clientX, event.clientY);
      if (!target) {
        clearSelection();
        return;
      }

      handlePileActivate(target.pileId, target.cardId);
    },
    [clearSelection, game, handlePileActivate, isDragging],
  );

  const handleCardDoubleClick = useCallback(
    (pileId: string, cardId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      suppressNextClick();
      handleFoundationAutoMove(pileId, cardId);
    },
    [handleFoundationAutoMove, suppressNextClick],
  );

  const handleAutoComplete = useCallback(() => {
    if (autoCompleteBusy) return;
    setAutoCompleteBusy(true);

    const step = () => {
      const state = useGameStore.getState().game;
      const moves = getAutoCompleteMoves(state);
      if (moves.length === 0) {
        setAutoCompleteBusy(false);
        return;
      }
      const m = moves[0];
      useGameStore.getState().move(m.from, m.to, m.cardIds);
      window.setTimeout(
        step,
        reducedMotion ? 80 : 160 + 60,
      );
    };

    step();
  }, [autoCompleteBusy, reducedMotion]);

  useEffect(() => {
    const onAuto = () => {
      if (canAutoComplete(useGameStore.getState().game)) {
        handleAutoComplete();
      }
    };
    window.addEventListener('aevanor:auto-complete', onAuto);
    return () => window.removeEventListener('aevanor:auto-complete', onAuto);
  }, [handleAutoComplete]);

  const isSelected = useCallback(
    (pileId: string, cardId: string) =>
      selection?.pileId === pileId && selection?.cardId === cardId,
    [selection],
  );

  const isDragSource = useCallback(
    (cardId: string) => drag?.cardIds.includes(cardId) ?? false,
    [drag],
  );

  const cardMotionProps = useCallback(
    (cardId: string, pileId: string) => ({
      reducedMotion,
      shake: shakeCardId === cardId,
      invalidFlash: invalidFlashCardId === cardId,
      foundationSparkle: foundationSparkle === pileId,
    }),
    [foundationSparkle, invalidFlashCardId, reducedMotion, shakeCardId],
  );

  const stockFocus = getFocusProps({ kind: 'pile', pileId: 'stock' });

  return (
    <>
      <AutoCompleteBar
        visible={showAutoComplete && game.status === 'playing'}
        busy={autoCompleteBusy}
        onFinish={() => void handleAutoComplete()}
      />

      <div
          key={game.seed}
          ref={boardRef}
          className={`board${leftHanded ? ' board--left-handed' : ''}`}
          data-variant={game.variantId}
          role="group"
          aria-label="Solitaire board"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleBoardClick}
        >
        {stockPile ? <div className="board__pile board__pile--gap" aria-hidden /> : null}
        {stockPile ? (
          <StockPile
            pile={stockPile}
            hintCardIds={hintCardIds}
            dropHighlight={dropTarget === 'stock'}
            focusProps={stockFocus}
            onStockActivate={() => handlePileActivate('stock')}
          />
        ) : null}
        {wastePile ? (
          <WastePile
            pile={wastePile}
            drawCount={game.drawCount}
            hintCardIds={hintCardIds}
            dropHighlight={dropTarget === 'waste'}
            selection={selection}
            isSelected={isSelected}
            isDragSource={isDragSource}
            isFocused={isFocused}
            getFocusProps={getFocusProps}
            cardMotionProps={cardMotionProps}
            onCardPointerDown={handlePointerDown}
            onCardDoubleClick={handleCardDoubleClick}
          />
        ) : null}
        {cells.map((pile) => (
          <CellPile
            key={pile.id}
            pile={pile}
            hintCardIds={hintCardIds}
            dropHighlight={dropTarget === pile.id}
            isSelected={isSelected}
            isDragSource={isDragSource}
            isFocused={isFocused}
            getFocusProps={getFocusProps}
            cardMotionProps={cardMotionProps}
            onCardPointerDown={handlePointerDown}
            onCardDoubleClick={handleCardDoubleClick}
          />
        ))}
        <FoundationRow
          piles={foundations}
          hintCardIds={hintCardIds}
          dropTarget={dropTarget}
          isSelected={isSelected}
          isDragSource={isDragSource}
          isFocused={isFocused}
          getFocusProps={getFocusProps}
          cardMotionProps={cardMotionProps}
          onCardPointerDown={handlePointerDown}
          onCardDoubleClick={handleCardDoubleClick}
        />
        {tableaus.map((pile) => (
          <TableauColumn
            key={pile.id}
            pile={pile}
            isMovable={(pileId, cardId) =>
              getMovableCardIds(game, pileId, cardId) !== null
            }
            hintCardIds={hintCardIds}
            dropHighlight={dropTarget === pile.id}
            isSelected={isSelected}
            isDragSource={isDragSource}
            isFocused={isFocused}
            getFocusProps={getFocusProps}
            cardMotionProps={cardMotionProps}
            onCardPointerDown={handlePointerDown}
            onCardDoubleClick={handleCardDoubleClick}
          />
        ))}
        </div>

      <DragLayer
        drag={drag}
        reject={reject}
        motionEnabled={motionEnabled}
        onRejectComplete={clearReject}
      />

      <LiveRegion message={announcement} />
    </>
  );
}

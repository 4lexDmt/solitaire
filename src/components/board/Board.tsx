'use client';

import { LiveRegion } from '@/components/a11y/LiveRegion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { LayoutGroup } from 'motion/react';
import { AutoCompleteBar } from './AutoCompleteBar';
import { buildDealSlotsFromGame, DealAnimation } from './DealAnimation';
import { DragLayer } from './DragLayer';
import { FoundationRow } from './FoundationRow';
import { StockPile } from './StockPile';
import { TableauColumn } from './TableauColumn';
import { WastePile } from './WastePile';
import './board.css';

interface BoardProps {
  game: GameState;
}

export function Board({ game }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const suppressClickRef = useRef(false);
  const [dealKey, setDealKey] = useState(game.seed);
  const [dealing, setDealing] = useState(true);
  const [shakeCardId, setShakeCardId] = useState<string | null>(null);
  const [invalidFlashCardId, setInvalidFlashCardId] = useState<string | null>(null);
  const [foundationSparkle, setFoundationSparkle] = useState<string | null>(null);
  const [autoCompleteBusy, setAutoCompleteBusy] = useState(false);
  const [lastInvalidCardId, setLastInvalidCardId] = useState<string | null>(null);
  const prevHistoryLen = useRef(game.history.length);

  const move = useGameStore((s) => s.move);
  const drawOrRecycle = useGameStore((s) => s.drawOrRecycle);
  const setSelection = useGameStore((s) => s.setSelection);
  const clearSelection = useGameStore((s) => s.clearSelection);
  const autoMoveCard = useGameStore((s) => s.autoMoveCard);

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const motionSetting = useSettingsStore((s) => s.motionEnabled);
  const leftHanded = useSettingsStore((s) => s.leftHanded);
  const { reducedMotion } = useReducedMotion();
  const motionEnabled = motionSetting && !reducedMotion;

  const hintCardIds = game.hintCardIds ?? [];
  const foundations = [0, 1, 2, 3].map((i) => game.piles[`foundation-${i}`]);
  const tableaus = [0, 1, 2, 3, 4, 5, 6].map((i) => game.piles[`tableau-${i}`]);
  const selection = game.selection;
  const showAutoComplete = canAutoComplete(game);
  const dealSlots = useMemo(() => buildDealSlotsFromGame(game.piles), [game.piles, dealKey]);

  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    setDealKey(game.seed);
    setDealing(true);
  }, [game.seed]);

  useEffect(() => {
    const lastMove = game.history[game.history.length - 1];
    if (game.history.length <= prevHistoryLen.current || !lastMove) {
      prevHistoryLen.current = game.history.length;
      return;
    }

    if (lastMove.flipped) playSound('flip');

    if (lastMove.to.startsWith('foundation-')) {
      playSound('foundation');
      vibrate(HAPTIC.foundationDrop, hapticsEnabled);
      setFoundationSparkle(lastMove.to);
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

  const { drag, reject, dropTarget, beginDrag, isDragging, clearReject } = useCardDrag({
    boardRef,
    game,
    motionEnabled,
    onMove: move,
    onInvalidDrop: handleInvalidDrop,
    onDragEnd: () => {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    },
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
        drawOrRecycle();
        playSound('deal');
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
      if (game.status !== 'playing') return;
      clearSelection();
      autoMoveCard(pileId, cardId);
    },
    [autoMoveCard, clearSelection, game.status],
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
      hiddenForDeal: dealing,
      shake: shakeCardId === cardId,
      invalidFlash: invalidFlashCardId === cardId,
      foundationSparkle: foundationSparkle === pileId,
    }),
    [dealing, foundationSparkle, invalidFlashCardId, reducedMotion, shakeCardId],
  );

  const handleDealComplete = useCallback(() => {
    setDealing(false);
  }, []);

  const stockFocus = getFocusProps({ kind: 'pile', pileId: 'stock' });

  return (
    <>
      <AutoCompleteBar
        visible={showAutoComplete && game.status === 'playing'}
        busy={autoCompleteBusy}
        onFinish={() => void handleAutoComplete()}
      />

      <LayoutGroup>
        <div
          ref={boardRef}
          className={`board${dealing ? ' board--dealing' : ''}${leftHanded ? ' board--left-handed' : ''}`}
          role="group"
          aria-label="Solitaire board"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={handleBoardClick}
        >
        <div className="board__pile board__pile--gap" aria-hidden />
        <StockPile
          pile={game.piles.stock}
          hintCardIds={hintCardIds}
          dropHighlight={dropTarget === 'stock'}
          focusProps={stockFocus}
          onStockActivate={() => handlePileActivate('stock')}
        />
        <WastePile
          pile={game.piles.waste}
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
      </LayoutGroup>

      {dealing && dealKey ? (
        <DealAnimation
          dealKey={dealKey}
          boardRef={boardRef}
          slots={dealSlots}
          reducedMotion={reducedMotion}
          onComplete={handleDealComplete}
        />
      ) : null}

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

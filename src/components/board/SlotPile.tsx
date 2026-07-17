import type { FocusTarget } from '@/hooks/useKeyboardPlay';
import type { Pile } from '@/engine/types';
import type { CardMotionProps } from './cardMotion';
import { CardView } from './CardView';
import { PilePlaceholder } from './PilePlaceholder';

interface SlotPileProps {
  pile: Pile;
  label?: string;
  dimmed?: boolean;
  hintCardIds?: string[];
  dropHighlight?: boolean;
  isSelected: (pileId: string, cardId: string) => boolean;
  isDragSource: (cardId: string) => boolean;
  isFocused: (target: FocusTarget) => boolean;
  getFocusProps: (target: FocusTarget) => {
    tabIndex: number;
    onFocus: () => void;
    'data-focused'?: boolean;
  };
  cardMotionProps?: (cardId: string, pileId: string) => CardMotionProps;
  onCardPointerDown: (
    pileId: string,
    cardId: string,
    event: React.PointerEvent<HTMLElement>,
  ) => void;
  onCardDoubleClick: (
    pileId: string,
    cardId: string,
    event: React.MouseEvent,
  ) => void;
}

/** Single-card pyramid / TriPeaks slot. */
export function SlotPile({
  pile,
  label = 'Card slot',
  dimmed = false,
  hintCardIds = [],
  dropHighlight = false,
  isSelected,
  isDragSource,
  isFocused,
  getFocusProps,
  cardMotionProps,
  onCardPointerDown,
  onCardDoubleClick,
}: SlotPileProps) {
  const top = pile.cards[pile.cards.length - 1];
  const focusTarget: FocusTarget = top
    ? { kind: 'card', pileId: pile.id, cardId: top.id }
    : { kind: 'pile', pileId: pile.id };
  const focus = getFocusProps(focusTarget);

  return (
    <div
      className={`board__pile board__pile--slot${dropHighlight ? ' board__pile--drop-valid' : ''}${dimmed ? ' board__pile--slot-covered' : ''}`}
      data-pile-id={pile.id}
      aria-label={`${label}, ${pile.cards.length === 0 ? 'empty' : '1 card'}`}
      tabIndex={top ? -1 : focus.tabIndex}
      onFocus={top ? undefined : focus.onFocus}
      data-focused={top ? undefined : focus['data-focused']}
    >
      {!top && <PilePlaceholder variant="slot" />}
      {top && (
        <CardView
          card={top}
          depthIndex={0}
          hinted={hintCardIds.includes(top.id)}
          selected={isSelected(pile.id, top.id)}
          dragSource={isDragSource(top.id)}
          focused={isFocused(focusTarget)}
          pileId={pile.id}
          tabIndex={focus.tabIndex}
          onFocus={focus.onFocus}
          onPointerDown={(event) => onCardPointerDown(pile.id, top.id, event)}
          onDoubleClick={(event) => onCardDoubleClick(pile.id, top.id, event)}
          {...(cardMotionProps?.(top.id, pile.id) ?? {})}
        />
      )}
    </div>
  );
}

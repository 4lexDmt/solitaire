import type { FocusTarget } from '@/hooks/useKeyboardPlay';
import type { Pile, Selection, Suit } from '@/engine/types';
import type { CardMotionProps } from './cardMotion';
import { CardView } from './CardView';
import { PilePlaceholder } from './PilePlaceholder';

const FOUNDATION_SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

interface FoundationPileProps {
  pile: Pile;
  defaultSuit?: Suit;
  hintCardIds?: string[];
  dropHighlight?: boolean;
  selection?: Selection | null;
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

export function FoundationPile({
  pile,
  defaultSuit,
  hintCardIds = [],
  dropHighlight = false,
  isSelected,
  isDragSource,
  isFocused,
  getFocusProps,
  cardMotionProps,
  onCardPointerDown,
  onCardDoubleClick,
}: FoundationPileProps) {
  const index = Number(pile.id.split('-')[1]);
  const watermarkSuit = defaultSuit ?? FOUNDATION_SUITS[index] ?? 'hearts';
  const top = pile.cards[pile.cards.length - 1];
  const focusTarget: FocusTarget = top
    ? { kind: 'card', pileId: pile.id, cardId: top.id }
    : { kind: 'pile', pileId: pile.id };
  const focus = getFocusProps(focusTarget);

  return (
    <div
      className={`board__pile board__pile--${pile.id}${dropHighlight ? ' board__pile--drop-valid' : ''}`}
      data-pile-id={pile.id}
      aria-label={`Foundation pile, ${pile.cards.length} cards`}
      tabIndex={top ? -1 : focus.tabIndex}
      onFocus={top ? undefined : focus.onFocus}
      data-focused={top ? undefined : focus['data-focused']}
    >
      {pile.cards.length === 0 && (
        <PilePlaceholder variant="foundation" suit={watermarkSuit} />
      )}
      {top && (
        <CardView
          card={top}
          depthIndex={pile.cards.length - 1}
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

interface FoundationRowProps {
  piles: Pile[];
  hintCardIds?: string[];
  dropTarget?: string | null;
  selection?: Selection | null;
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

export function FoundationRow({
  piles,
  hintCardIds = [],
  dropTarget = null,
  isSelected,
  isDragSource,
  isFocused,
  getFocusProps,
  cardMotionProps,
  onCardPointerDown,
  onCardDoubleClick,
}: FoundationRowProps) {
  return (
    <>
      {piles.map((pile, index) => (
        <FoundationPile
          key={pile.id}
          pile={pile}
          hintCardIds={hintCardIds}
          dropHighlight={dropTarget === pile.id}
          isSelected={isSelected}
          isDragSource={isDragSource}
          isFocused={isFocused}
          getFocusProps={getFocusProps}
          cardMotionProps={cardMotionProps}
          onCardPointerDown={onCardPointerDown}
          onCardDoubleClick={onCardDoubleClick}
          defaultSuit={FOUNDATION_SUITS[index]}
        />
      ))}
    </>
  );
}

import type { FocusTarget } from '@/hooks/useKeyboardPlay';
import type { Card, Pile, Selection } from '@/engine/types';
import type { CardMotionProps } from './cardMotion';
import { runFromCard } from '@/engine/variants/klondike';
import { tableauCardTopStyle, tableauColumnHeightStyle } from '@/lib/layout';
import { CardView } from './CardView';
import { PilePlaceholder } from './PilePlaceholder';

interface TableauColumnProps {
  pile: Pile;
  /** Variant-aware pickup check; defaults to any face-up run (Klondike). */
  isMovable?: (pileId: string, cardId: string) => boolean;
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

function isMovableCard(pile: Pile, card: Card): boolean {
  if (!card.faceUp) return false;
  return runFromCard(pile, card.id).length > 0;
}

export function TableauColumn({
  pile,
  isMovable,
  hintCardIds = [],
  dropHighlight = false,
  isSelected,
  isDragSource,
  isFocused,
  getFocusProps,
  cardMotionProps,
  onCardPointerDown,
  onCardDoubleClick,
}: TableauColumnProps) {
  const pileFocus = getFocusProps({ kind: 'pile', pileId: pile.id });

  return (
    <div
      className={`board__pile board__pile--${pile.id}${dropHighlight ? ' board__pile--drop-valid' : ''}`}
      data-pile-id={pile.id}
      style={{ height: tableauColumnHeightStyle(pile.cards) }}
      aria-label={`Tableau column, ${pile.cards.length} cards`}
      tabIndex={pile.cards.length === 0 ? pileFocus.tabIndex : -1}
      onFocus={pile.cards.length === 0 ? pileFocus.onFocus : undefined}
      data-focused={pile.cards.length === 0 ? pileFocus['data-focused'] : undefined}
    >
      {pile.cards.length === 0 && <PilePlaceholder variant="tableau" />}
      {pile.cards.map((card: Card, index: number) => {
        const movable = isMovable
          ? isMovable(pile.id, card.id)
          : isMovableCard(pile, card);
        const focusTarget: FocusTarget = { kind: 'card', pileId: pile.id, cardId: card.id };
        const focus = getFocusProps(focusTarget);

        return (
          <CardView
            key={card.id}
            card={card}
            depthIndex={index}
            topOffsetStyle={tableauCardTopStyle(pile.cards, index)}
            hinted={hintCardIds.includes(card.id)}
            selected={isSelected(pile.id, card.id)}
            dragSource={isDragSource(card.id)}
            focused={isFocused(focusTarget)}
            pileId={pile.id}
            tabIndex={movable ? focus.tabIndex : -1}
            onFocus={movable ? focus.onFocus : undefined}
            onPointerDown={
              movable
                ? (event) => onCardPointerDown(pile.id, card.id, event)
                : undefined
            }
            onDoubleClick={
              movable
                ? (event) => onCardDoubleClick(pile.id, card.id, event)
                : undefined
            }
            {...(cardMotionProps?.(card.id, pile.id) ?? {})}
          />
        );
      })}
    </div>
  );
}

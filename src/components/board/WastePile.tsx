import type { FocusTarget } from '@/hooks/useKeyboardPlay';
import type { Pile, Selection } from '@/engine/types';
import type { CardMotionProps } from './cardMotion';
import { wasteCardLeftStyle } from '@/lib/layout';
import { CardView } from './CardView';
import { PilePlaceholder } from './PilePlaceholder';

interface WastePileProps {
  pile: Pile;
  drawCount: 1 | 3;
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

export function WastePile({
  pile,
  drawCount,
  hintCardIds = [],
  dropHighlight = false,
  isSelected,
  isDragSource,
  isFocused,
  getFocusProps,
  cardMotionProps,
  onCardPointerDown,
  onCardDoubleClick,
}: WastePileProps) {
  const visible =
    drawCount === 1
      ? pile.cards.slice(-1)
      : pile.cards.slice(-Math.min(3, pile.cards.length));

  const startIndex = pile.cards.length - visible.length;
  const wasteFocus = getFocusProps(
    visible.length > 0
      ? { kind: 'card', pileId: 'waste', cardId: visible[visible.length - 1].id }
      : { kind: 'pile', pileId: 'waste' },
  );

  return (
    <div
      className={`board__pile board__pile--waste${dropHighlight ? ' board__pile--drop-valid' : ''}`}
      data-pile-id="waste"
      style={{ width: 'calc(var(--card-w) + 2 * var(--waste-fan))' }}
      aria-label={`Waste pile, ${pile.cards.length} cards`}
      tabIndex={visible.length === 0 ? wasteFocus.tabIndex : -1}
      onFocus={visible.length === 0 ? wasteFocus.onFocus : undefined}
      data-focused={visible.length === 0 ? wasteFocus['data-focused'] : undefined}
    >
      {pile.cards.length === 0 && <PilePlaceholder variant="tableau" />}
      {visible.map((card, i) => {
        const focusTarget: FocusTarget = { kind: 'card', pileId: 'waste', cardId: card.id };
        const focus = getFocusProps(focusTarget);
        const isTop = i === visible.length - 1;

        return (
          <CardView
            key={card.id}
            card={card}
            depthIndex={startIndex + i}
            leftOffsetStyle={visible.length > 1 ? wasteCardLeftStyle(i) : '0px'}
            hinted={hintCardIds.includes(card.id)}
            selected={isSelected('waste', card.id)}
            dragSource={isDragSource(card.id)}
            focused={isFocused(focusTarget)}
            pileId="waste"
            tabIndex={isTop ? focus.tabIndex : -1}
            onFocus={isTop ? focus.onFocus : undefined}
            onPointerDown={
              isTop
                ? (event) => onCardPointerDown('waste', card.id, event)
                : undefined
            }
            onDoubleClick={
              isTop
                ? (event) => onCardDoubleClick('waste', card.id, event)
                : undefined
            }
            {...(cardMotionProps?.(card.id, 'waste') ?? {})}
          />
        );
      })}
    </div>
  );
}

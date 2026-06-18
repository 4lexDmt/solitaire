import type { Pile } from '@/engine/types';
import { CardView } from './CardView';
import { PilePlaceholder } from './PilePlaceholder';

interface StockPileProps {
  pile: Pile;
  hintCardIds?: string[];
  dropHighlight?: boolean;
  focusProps?: {
    tabIndex: number;
    onFocus: () => void;
    'data-focused'?: boolean;
  };
  onStockActivate?: () => void;
}

export function StockPile({
  pile,
  hintCardIds = [],
  dropHighlight = false,
  focusProps,
  onStockActivate,
}: StockPileProps) {
  const showRecycleHint = hintCardIds.includes('stock');
  const topCard = pile.cards[pile.cards.length - 1];

  return (
    <div
      className={`board__pile board__pile--stock${dropHighlight ? ' board__pile--drop-valid' : ''}`}
      data-pile-id="stock"
      aria-label={`Stock pile, ${pile.cards.length} cards`}
      role="button"
      tabIndex={focusProps?.tabIndex ?? -1}
      onFocus={focusProps?.onFocus}
      data-focused={focusProps?.['data-focused']}
      onClick={(e) => {
        e.stopPropagation();
        onStockActivate?.();
      }}
    >
      {pile.cards.length === 0 ? (
        <PilePlaceholder variant="stock" hinted={showRecycleHint} />
      ) : (
        <>
          {pile.cards.length > 1 && topCard && (
            <CardView
              card={{ ...topCard, faceUp: false }}
              depthIndex={0}
              topOffsetStyle="2px"
              leftOffsetStyle="2px"
              pileId="stock"
            />
          )}
          {topCard && (
            <CardView
              card={{ ...topCard, faceUp: false }}
              depthIndex={1}
              hinted={showRecycleHint}
              pileId="stock"
            />
          )}
        </>
      )}
    </div>
  );
}

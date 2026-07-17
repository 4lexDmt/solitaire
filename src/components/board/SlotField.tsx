import type { FocusTarget } from '@/hooks/useKeyboardPlay';
import type { Pile } from '@/engine/types';
import { isSlotFree, slotIndex } from '@/engine/variants/slotLayout';
import type { GameState } from '@/engine/types';
import type { CardMotionProps } from './cardMotion';
import { SlotPile } from './SlotPile';

type SharedProps = {
  game: GameState;
  hintCardIds: string[];
  dropTarget: string | null;
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
};

function slotsOf(game: GameState): Pile[] {
  return Object.values(game.piles)
    .filter((p) => p.type === 'slot')
    .sort((a, b) => slotIndex(a.id) - slotIndex(b.id));
}

function SlotRow({
  piles,
  mode,
  game,
  ...rest
}: SharedProps & { piles: Pile[]; mode: 'pyramid' | 'tripeaks' }) {
  return (
    <div className={`board__slot-row board__slot-row--${mode}`}>
      {piles.map((pile) => {
        const idx = slotIndex(pile.id);
        const covered =
          pile.cards.length > 0 && !isSlotFree(game, idx, mode);
        return (
          <SlotPile
            key={pile.id}
            pile={pile}
            label={mode === 'pyramid' ? 'Pyramid card' : 'Peak card'}
            dimmed={covered}
            hintCardIds={rest.hintCardIds}
            dropHighlight={rest.dropTarget === pile.id}
            isSelected={rest.isSelected}
            isDragSource={rest.isDragSource}
            isFocused={rest.isFocused}
            getFocusProps={rest.getFocusProps}
            cardMotionProps={rest.cardMotionProps}
            onCardPointerDown={rest.onCardPointerDown}
            onCardDoubleClick={rest.onCardDoubleClick}
          />
        );
      })}
    </div>
  );
}

/** 7-row pyramid (1…7 cards). */
export function PyramidField(props: SharedProps) {
  const all = slotsOf(props.game);
  const rows: Pile[][] = [];
  let cursor = 0;
  for (let row = 0; row < 7; row++) {
    rows.push(all.slice(cursor, cursor + row + 1));
    cursor += row + 1;
  }

  return (
    <div className="board__slot-field board__slot-field--pyramid" aria-label="Pyramid">
      {rows.map((piles, i) => (
        <SlotRow key={i} piles={piles} mode="pyramid" {...props} />
      ))}
    </div>
  );
}

/** TriPeaks: 3 / 6 / 9 / 10 rows. */
export function TriPeaksField(props: SharedProps) {
  const all = slotsOf(props.game);
  const rows = [all.slice(0, 3), all.slice(3, 9), all.slice(9, 18), all.slice(18, 28)];

  return (
    <div className="board__slot-field board__slot-field--tripeaks" aria-label="TriPeaks">
      {rows.map((piles, i) => (
        <SlotRow key={i} piles={piles} mode="tripeaks" {...props} />
      ))}
    </div>
  );
}

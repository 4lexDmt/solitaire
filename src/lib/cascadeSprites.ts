import type { Card } from '@/engine/types';
import { rankLabel } from '@/lib/layout';

const SUIT_GLYPH: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

/** Lightweight canvas card sprite for the win cascade trail. */
export function drawCascadeCardSprite(
  ctx: CanvasRenderingContext2D,
  card: Card,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
): void {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rotation);

  const radius = width * 0.06;
  ctx.fillStyle = '#fbf8f1';
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1;

  roundRect(ctx, -width / 2, -height / 2, width, height, radius);
  ctx.fill();
  ctx.stroke();

  const ink = card.color === 'red' ? '#c0362c' : '#23262e';
  ctx.fillStyle = ink;
  ctx.font = `800 ${Math.max(12, width * 0.22)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(rankLabel(card.rank), -width / 2 + width * 0.08, -height / 2 + height * 0.06);

  ctx.font = `${Math.max(14, width * 0.34)}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(SUIT_GLYPH[card.suit], 0, height * 0.06);

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

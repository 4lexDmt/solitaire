import type { Card } from '@/engine/types';
import { rankLabel } from '@/lib/layout';

const SUIT_GLYPH: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

/** Lightweight canvas card sprite for the win cascade trail — classic Win9x look. */
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

  const radius = Math.max(4, width * 0.08);
  ctx.fillStyle = '#fdfdfb';
  ctx.strokeStyle = '#5a5a5a';
  ctx.lineWidth = 1;

  roundRect(ctx, -width / 2, -height / 2, width, height, radius);
  ctx.fill();
  ctx.stroke();

  const ink = card.color === 'red' ? '#c22222' : '#1a1a1a';
  ctx.fillStyle = ink;
  ctx.font = `bold ${Math.max(12, width * 0.2)}px Tahoma, Verdana, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(rankLabel(card.rank), -width / 2 + width * 0.08, -height / 2 + height * 0.05);

  ctx.font = `${Math.max(16, width * 0.38)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(SUIT_GLYPH[card.suit], 0, height * 0.04);

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

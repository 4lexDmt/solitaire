import type { Card, Suit } from '@/engine/types';
import { rankLabel } from '@/lib/layout';

/** Draw a vector suit (same geometry as SuitGlyph) — never emoji. */
function drawSuit(
  ctx: CanvasRenderingContext2D,
  suit: Suit,
  cx: number,
  cy: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(size / 100, size / 100);
  ctx.fillStyle = color;

  if (suit === 'spades') {
    ctx.beginPath();
    ctx.moveTo(50, 14);
    ctx.bezierCurveTo(46, 31, 21, 43, 21, 61);
    ctx.bezierCurveTo(21, 74, 33, 82, 43, 76);
    ctx.bezierCurveTo(42, 84, 38, 89, 30, 92);
    ctx.lineTo(70, 92);
    ctx.bezierCurveTo(62, 89, 58, 84, 57, 76);
    ctx.bezierCurveTo(67, 82, 79, 74, 79, 61);
    ctx.bezierCurveTo(79, 43, 54, 31, 50, 14);
    ctx.closePath();
    ctx.fill();
  } else if (suit === 'hearts') {
    ctx.beginPath();
    ctx.moveTo(50, 87);
    ctx.bezierCurveTo(29, 71, 17, 59, 17, 40);
    ctx.bezierCurveTo(17, 27, 26, 18, 37, 18);
    ctx.bezierCurveTo(45, 18, 49, 24, 50, 31);
    ctx.bezierCurveTo(51, 24, 55, 18, 63, 18);
    ctx.bezierCurveTo(74, 18, 83, 27, 83, 40);
    ctx.bezierCurveTo(83, 59, 71, 71, 50, 87);
    ctx.closePath();
    ctx.fill();
  } else if (suit === 'diamonds') {
    ctx.beginPath();
    ctx.moveTo(50, 11);
    ctx.lineTo(81, 50);
    ctx.lineTo(50, 89);
    ctx.lineTo(19, 50);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(50, 31, 15, 0, Math.PI * 2);
    ctx.arc(32, 55, 15, 0, Math.PI * 2);
    ctx.arc(68, 55, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(44, 55);
    ctx.bezierCurveTo(44, 70, 40, 82, 32, 91);
    ctx.lineTo(68, 91);
    ctx.bezierCurveTo(60, 82, 56, 70, 56, 55);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/** Lightweight canvas card sprite for the win cascade — vector suits, no emoji. */
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
  const rankSize = Math.max(11, width * 0.18);
  ctx.fillStyle = ink;
  ctx.font = `bold ${rankSize}px Tahoma, Verdana, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(rankLabel(card.rank), -width / 2 + width * 0.08, -height / 2 + height * 0.05);

  const cornerSuit = Math.max(10, width * 0.16);
  drawSuit(
    ctx,
    card.suit,
    -width / 2 + width * 0.18,
    -height / 2 + height * 0.22,
    cornerSuit,
    ink,
  );

  const centerSuit = Math.max(18, width * 0.42);
  drawSuit(ctx, card.suit, 0, height * 0.06, centerSuit, ink);

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

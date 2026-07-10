import { CASCADE, DURATIONS } from '@/config/tokens';
import type { Card } from '@/engine/types';

export interface CascadeSprite {
  id: string;
  card: Card;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  rotation: number;
  active: boolean;
  launchedAt: number;
}

export interface CascadeBounds {
  width: number;
  height: number;
}

export interface CascadeLaunch {
  card: Card;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface CascadeEngineOptions {
  bounds: CascadeBounds;
  gravity?: number;
  floorRestitution?: number;
  wallRestitution?: number;
  energyThreshold?: number;
  maxActive?: number;
}

export type DrawCardSprite = (
  ctx: CanvasRenderingContext2D,
  card: Card,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
) => void;

const DEFAULTS = {
  gravity: CASCADE.gravity,
  floorRestitution: CASCADE.floorRestitution,
  wallRestitution: CASCADE.wallRestitution,
  energyThreshold: 35,
  maxActive: 52,
};

/** RAF physics loop — canvas is NOT cleared each frame (trail smear). SPEC §8.6 */
export class CascadeEngine {
  private sprites: CascadeSprite[] = [];
  private readonly opts: Required<CascadeEngineOptions>;
  private rafId: number | null = null;
  private lastTime = 0;
  private running = false;

  constructor(options: CascadeEngineOptions) {
    this.opts = {
      gravity: options.gravity ?? DEFAULTS.gravity,
      floorRestitution: options.floorRestitution ?? DEFAULTS.floorRestitution,
      wallRestitution: options.wallRestitution ?? DEFAULTS.wallRestitution,
      energyThreshold: options.energyThreshold ?? DEFAULTS.energyThreshold,
      maxActive: options.maxActive ?? DEFAULTS.maxActive,
      bounds: options.bounds,
    };
  }

  get activeCount(): number {
    return this.sprites.filter((s) => s.active).length;
  }

  get canAcceptLaunch(): boolean {
    return this.activeCount < this.opts.maxActive;
  }

  get launchedCount(): number {
    return this.sprites.length;
  }

  get allSettled(): boolean {
    return this.sprites.length > 0 && this.sprites.every((s) => !s.active);
  }

  launch(launch: CascadeLaunch, cardWidth: number, cardHeight: number, now: number): void {
    if (this.activeCount >= this.opts.maxActive) return;

    this.sprites.push({
      id: launch.card.id,
      card: launch.card,
      x: launch.x,
      y: launch.y,
      vx: launch.vx,
      vy: launch.vy,
      width: cardWidth,
      height: cardHeight,
      rotation: (Math.random() - 0.5) * 0.4,
      active: true,
      launchedAt: now,
    });
  }

  clear(): void {
    this.sprites = [];
  }

  start(ctx: CanvasRenderingContext2D, drawCard: DrawCardSprite, onFrame?: () => void): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();

    const step = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 1 / 30);
      this.lastTime = now;
      this.integrate(dt);
      this.render(ctx, drawCard);
      onFrame?.();
      this.rafId = requestAnimationFrame(step);
    };

    this.rafId = requestAnimationFrame(step);
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private integrate(dt: number): void {
    const { width, height } = this.opts.bounds;
    const floor = height - 4;

    for (const sprite of this.sprites) {
      if (!sprite.active) continue;

      sprite.vy += this.opts.gravity * dt;
      sprite.x += sprite.vx * dt;
      sprite.y += sprite.vy * dt;
      sprite.rotation += sprite.vx * 0.0004;

      if (sprite.y + sprite.height >= floor) {
        sprite.y = floor - sprite.height;
        if (Math.abs(sprite.vy) > 8) {
          sprite.vy = -sprite.vy * this.opts.floorRestitution;
          sprite.vx *= 0.96;
        } else {
          sprite.vy = 0;
        }
      }

      if (sprite.x <= 0) {
        sprite.x = 0;
        sprite.vx = Math.abs(sprite.vx) * this.opts.wallRestitution;
      } else if (sprite.x + sprite.width >= width) {
        sprite.x = width - sprite.width;
        sprite.vx = -Math.abs(sprite.vx) * this.opts.wallRestitution;
      }

      const energy = Math.hypot(sprite.vx, sprite.vy);
      if (
        sprite.y + sprite.height >= floor - 1 &&
        energy < this.opts.energyThreshold
      ) {
        sprite.active = false;
      }

      if (sprite.y > height + sprite.height || sprite.x < -sprite.width * 2) {
        sprite.active = false;
      }
    }
  }

  private render(ctx: CanvasRenderingContext2D, drawCard: DrawCardSprite): void {
    for (const sprite of this.sprites) {
      if (!sprite.active && performance.now() - sprite.launchedAt > 4000) continue;
      drawCard(
        ctx,
        sprite.card,
        sprite.x,
        sprite.y,
        sprite.width,
        sprite.height,
        sprite.rotation,
      );
    }
  }
}

export function randomLaunchVelocity(
  originX: number,
  canvasWidth: number,
): { vx: number; vy: number } {
  const center = canvasWidth / 2;
  const bias = originX < center ? 1 : -1;
  const vx =
    bias * (160 + Math.random() * (CASCADE.vxMax - 160)) +
    (Math.random() - 0.5) * 100;
  const vy =
    CASCADE.vyMin + Math.random() * (CASCADE.vyMax - CASCADE.vyMin);
  return { vx, vy };
}

export function buildFoundationLaunchQueue(
  foundationCards: Card[][],
): { card: Card; pileIndex: number }[] {
  const queue: { card: Card; pileIndex: number }[] = [];
  const maxLen = Math.max(...foundationCards.map((p) => p.length), 0);

  for (let rank = maxLen - 1; rank >= 0; rank--) {
    for (let pileIndex = 0; pileIndex < foundationCards.length; pileIndex++) {
      const card = foundationCards[pileIndex][rank];
      if (card) queue.push({ card, pileIndex });
    }
  }

  return queue;
}

export const CASCADE_TIMEOUT_MS = DURATIONS.cascadeTimeout;
export const CASCADE_LAUNCH_STAGGER_MS = DURATIONS.cascadeLaunchStagger;

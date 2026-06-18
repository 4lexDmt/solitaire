'use client';

import { Z } from '@/config/tokens';
import type { GameState } from '@/engine/types';
import {
  CASCADE_LAUNCH_STAGGER_MS,
  CASCADE_TIMEOUT_MS,
  CascadeEngine,
  buildFoundationLaunchQueue,
  randomLaunchVelocity,
} from '@/lib/cascade';
import { drawCascadeCardSprite } from '@/lib/cascadeSprites';
import { resolveCardHeight, resolveCardWidth } from '@/lib/layout';
import { playWinFanfare } from '@/lib/sound';
import { useCallback, useEffect, useRef } from 'react';

interface WinCascadeCanvasProps {
  active: boolean;
  game: GameState;
  onComplete: () => void;
}

export function WinCascadeCanvas({ active, game, onComplete }: WinCascadeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CascadeEngine | null>(null);
  const completedRef = useRef(false);
  const launchTimersRef = useRef<number[]>([]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    engineRef.current?.stop();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    launchTimersRef.current.forEach((id) => window.clearTimeout(id));
    launchTimersRef.current = [];
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!active) {
      completedRef.current = false;
      engineRef.current?.stop();
      engineRef.current?.clear();
      launchTimersRef.current.forEach((id) => window.clearTimeout(id));
      launchTimersRef.current = [];
      return;
    }

    completedRef.current = false;
    playWinFanfare();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cardWidth = resolveCardWidth(width);
    const cardHeight = resolveCardHeight(cardWidth);

    const engine = new CascadeEngine({ bounds: { width, height } });
    engineRef.current = engine;

    const foundationCards = [0, 1, 2, 3].map(
      (i) => game.piles[`foundation-${i}`]?.cards ?? [],
    );
    const queue = buildFoundationLaunchQueue(foundationCards);

    const boardEl = document.querySelector('.board');
    const pileEls = [0, 1, 2, 3].map((i) =>
      document.querySelector(`[data-pile-id="foundation-${i}"]`),
    );

    let launchedCount = 0;

    queue.forEach(({ card, pileIndex }, index) => {
      const timer = window.setTimeout(() => {
        const pileEl = pileEls[pileIndex];
        const pileRect = pileEl?.getBoundingClientRect();
        const boardRect = boardEl?.getBoundingClientRect();
        const originX = pileRect?.left ?? width / 2;
        const originY = pileRect?.top ?? (boardRect?.top ?? 80);
        const { vx, vy } = randomLaunchVelocity(originX, width);
        engine.launch(
          { card, x: originX, y: originY, vx, vy },
          cardWidth,
          cardHeight,
          performance.now(),
        );
        launchedCount += 1;
      }, index * CASCADE_LAUNCH_STAGGER_MS);
      launchTimersRef.current.push(timer);
    });

    engine.start(ctx, drawCascadeCardSprite, () => {
      if (launchedCount < queue.length) return;
      if (engine.allSettled) {
        window.setTimeout(finish, 600);
      }
    });

    const timeoutId = window.setTimeout(finish, CASCADE_TIMEOUT_MS);
    launchTimersRef.current.push(timeoutId);

    return () => {
      engine.stop();
      launchTimersRef.current.forEach((id) => window.clearTimeout(id));
      launchTimersRef.current = [];
    };
  }, [active, finish, game.piles]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="win-cascade-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z.cascade,
        pointerEvents: 'auto',
        touchAction: 'none',
      }}
      aria-hidden
      onPointerDown={finish}
      onClick={finish}
    />
  );
}

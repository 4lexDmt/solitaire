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

    const cardWidth = resolveCardWidth(width, game.variantId);
    const cardHeight = resolveCardHeight(cardWidth);

    const engine = new CascadeEngine({ bounds: { width, height } });
    engineRef.current = engine;

    const foundationIds = Object.keys(game.piles)
      .filter((id) => id.startsWith('foundation-'))
      .sort((a, b) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
    const foundationCards = foundationIds.map((id) => game.piles[id]?.cards ?? []);
    const queue = buildFoundationLaunchQueue(foundationCards);

    const pileEls = foundationIds.map((id) =>
      document.querySelector(`[data-pile-id="${id}"]`),
    );

    const launchCard = (index: number) => {
      const { card, pileIndex } = queue[index];
      const pileRect = pileEls[pileIndex]?.getBoundingClientRect();
      const originX = pileRect?.left ?? width / 2 - cardWidth / 2;
      const originY = pileRect?.top ?? 80;
      const { vx, vy } = randomLaunchVelocity(originX + cardWidth / 2, width);
      engine.launch(
        { card, x: originX, y: originY, vx, vy },
        cardWidth,
        cardHeight,
        performance.now(),
      );
    };

    const scheduleLaunch = (index: number) => {
      const attempt = () => {
        if (!engine.canAcceptLaunch) {
          requestAnimationFrame(attempt);
          return;
        }
        launchCard(index);
      };
      attempt();
    };

    queue.forEach((_, index) => {
      const timer = window.setTimeout(
        () => scheduleLaunch(index),
        index * CASCADE_LAUNCH_STAGGER_MS,
      );
      launchTimersRef.current.push(timer);
    });

    engine.start(ctx, drawCascadeCardSprite, () => {
      if (engine.launchedCount >= queue.length && engine.allSettled) {
        window.setTimeout(finish, 500);
      }
    });

    const timeoutId = window.setTimeout(finish, CASCADE_TIMEOUT_MS);
    launchTimersRef.current.push(timeoutId);

    return () => {
      engine.stop();
      launchTimersRef.current.forEach((id) => window.clearTimeout(id));
      launchTimersRef.current = [];
    };
  }, [active, finish, game.piles, game.variantId]);

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

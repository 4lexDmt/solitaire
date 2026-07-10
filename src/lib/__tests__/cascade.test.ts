import { describe, expect, it } from 'vitest';
import { CascadeEngine, buildFoundationLaunchQueue } from '@/lib/cascade';
import { createCard } from '@/engine/deck';

describe('cascade engine', () => {
  it('queues launches when at capacity instead of dropping cards', () => {
    const engine = new CascadeEngine({
      bounds: { width: 800, height: 600 },
      maxActive: 2,
    });
    const card = createCard('hearts', 1, true);
    const now = performance.now();

    engine.launch({ card, x: 100, y: 100, vx: 100, vy: -200 }, 50, 70, now);
    engine.launch({ card: createCard('spades', 2, true), x: 120, y: 100, vx: 120, vy: -200 }, 50, 70, now);
    expect(engine.activeCount).toBe(2);
    expect(engine.canAcceptLaunch).toBe(false);

    engine.launch({ card: createCard('clubs', 3, true), x: 140, y: 100, vx: 140, vy: -200 }, 50, 70, now);
    expect(engine.launchedCount).toBe(2);
  });

  it('builds launch queue kings-first across foundations', () => {
    const queue = buildFoundationLaunchQueue([
      [createCard('hearts', 1, true), createCard('hearts', 2, true)],
      [createCard('diamonds', 1, true)],
      [],
      [],
    ]);
    expect(queue).toHaveLength(3);
    expect(queue[0].card.rank).toBe(2);
    expect(queue[0].pileIndex).toBe(0);
    expect(queue[1].card.rank).toBe(1);
    expect(queue[2].card.rank).toBe(1);
  });
});

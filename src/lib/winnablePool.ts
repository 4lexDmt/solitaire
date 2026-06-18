import { solveInWorker } from '@/solver/solverClient';

export interface WinnablePool {
  drawCount: 1 | 3;
  count: number;
  seeds: string[];
}

const POOL_KEY = 'solitaire-winnable-pool-extra';
const poolCache = new Map<1 | 3, WinnablePool>();
const topUpInFlight = new Set<1 | 3>();

function loadExtraSeeds(drawCount: 1 | 3): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${POOL_KEY}-${drawCount}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveExtraSeeds(drawCount: 1 | 3, seeds: string[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(`${POOL_KEY}-${drawCount}`, JSON.stringify(seeds));
}

export async function loadWinnablePool(drawCount: 1 | 3): Promise<WinnablePool> {
  const cached = poolCache.get(drawCount);
  if (cached) return cached;

  const response = await fetch(`/data/winnable-draw${drawCount}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load winnable pool for draw-${drawCount}`);
  }

  const bundled = (await response.json()) as WinnablePool;
  const extra = loadExtraSeeds(drawCount);
  const merged = {
    ...bundled,
    seeds: [...new Set([...bundled.seeds, ...extra])],
    count: 0,
  };
  merged.count = merged.seeds.length;
  poolCache.set(drawCount, merged);
  return merged;
}

export async function pickWinnableSeed(drawCount: 1 | 3): Promise<string> {
  const pool = await loadWinnablePool(drawCount);
  if (pool.seeds.length === 0) {
    throw new Error(`Winnable pool for draw-${drawCount} is empty`);
  }
  const index = Math.floor(Math.random() * pool.seeds.length);
  return pool.seeds[index];
}

/** Background top-up per SPEC §12.5 — verify random seeds in worker and append winners. */
export function topUpWinnablePool(drawCount: 1 | 3, targetExtra = 5): void {
  if (typeof window === 'undefined' || topUpInFlight.has(drawCount)) return;
  topUpInFlight.add(drawCount);

  void (async () => {
    try {
      const pool = await loadWinnablePool(drawCount);
      const extra = loadExtraSeeds(drawCount);
      if (extra.length >= targetExtra) return;

      let scanned = 0;
      while (extra.length < targetExtra && scanned < 24) {
        scanned += 1;
        const candidate = `live-${drawCount}-${Date.now().toString(36)}-${scanned}`;
        if (pool.seeds.includes(candidate)) continue;

        const result = await solveInWorker({
          seed: candidate,
          drawCount,
          maxNodes: 250_000,
          maxTimeMs: 6_000,
        });

        if (result.solvable) {
          extra.push(candidate);
          saveExtraSeeds(drawCount, extra);
          pool.seeds.push(candidate);
          pool.count = pool.seeds.length;
          poolCache.set(drawCount, pool);
        }
      }
    } catch {
      // Worker unavailable offline — bundled pool still works.
    } finally {
      topUpInFlight.delete(drawCount);
    }
  })();
}

export async function dailyWinnableSeed(
  drawCount: 1 | 3,
  date = new Date(),
): Promise<string> {
  const pool = await loadWinnablePool(drawCount);
  if (pool.seeds.length === 0) {
    throw new Error('Daily pool is empty');
  }
  const key = date.toISOString().slice(0, 10).replace(/-/g, '');
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return pool.seeds[hash % pool.seeds.length];
}

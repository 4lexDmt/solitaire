#!/usr/bin/env node
/** Fast batch pool builder — scans sequentially with progress logging. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { solve } from './solver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../../public/data');

function collect(drawCount: 1 | 3, target: number): string[] {
  const seeds: string[] = [];
  let scanned = 0;

  while (seeds.length < target && scanned < target * 100) {
    const seed = `pool-${drawCount}-${scanned.toString(36).padStart(4, '0')}`;
    scanned += 1;
    const result = solve({
      seed,
      drawCount,
      maxNodes: 800_000,
      maxTimeMs: drawCount === 1 ? 35_000 : 65_000,
    });

    if (result.solvable) {
      seeds.push(seed);
      console.log(`[draw-${drawCount}] ${seeds.length}/${target} <- ${seed} (${result.nodesVisited} nodes)`);
    } else if (scanned % 10 === 0) {
      console.log(`[draw-${drawCount}] scanned ${scanned}, found ${seeds.length}`);
    }
  }

  return seeds;
}

function writePool(drawCount: 1 | 3, seeds: string[]): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `winnable-draw${drawCount}.json`);
  writeFileSync(path, `${JSON.stringify({ drawCount, count: seeds.length, seeds }, null, 2)}\n`);
  console.log(`Wrote ${path} (${seeds.length} seeds)`);
}

const draw1 = collect(1, 50);
writePool(1, draw1);
const draw3 = collect(3, 50);
writePool(3, draw3);

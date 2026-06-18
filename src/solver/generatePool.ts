#!/usr/bin/env node
/**
 * Node script: scan seeds and write verified winnable pools.
 * Usage: npx tsx src/solver/generatePool.ts [--target 50] [--draw 1|3|both]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { solve } from './solver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const OUT_DIR = join(ROOT, 'public/data');

interface PoolOptions {
  drawCount: 1 | 3;
  target: number;
  maxScan: number;
  maxNodes: number;
  maxTimeMs: number;
}

function parseArgs(): { draw: '1' | '3' | 'both'; target: number } {
  const args = process.argv.slice(2);
  let draw: '1' | '3' | 'both' = 'both';
  let target = 50;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--draw' && args[i + 1]) {
      const value = args[i + 1];
      if (value === '1' || value === '3' || value === 'both') {
        draw = value;
      }
      i += 1;
    } else if (args[i] === '--target' && args[i + 1]) {
      target = Number.parseInt(args[i + 1], 10);
      i += 1;
    }
  }

  return { draw, target };
}

function generatePool(options: PoolOptions): string[] {
  const seeds: string[] = [];
  let scanned = 0;

  while (seeds.length < options.target && scanned < options.maxScan) {
    const seed = `pool-${options.drawCount}-${scanned.toString(36).padStart(4, '0')}`;
    scanned += 1;

    const result = solve({
      seed,
      drawCount: options.drawCount,
      maxNodes: options.maxNodes,
      maxTimeMs: options.maxTimeMs,
    });

    if (result.solvable) {
      seeds.push(seed);
      process.stdout.write(`\r[draw-${options.drawCount}] found ${seeds.length}/${options.target} (scanned ${scanned})`);
    }
  }

  process.stdout.write('\n');
  return seeds;
}

function findProvenUnwinnable(drawCount: 1 | 3, maxScan: number): string | null {
  // Fast scan: short seeds with a tight budget find deals whose search tree
  // exhausts quickly (proven unwinnable without timing out).
  for (let i = 0; i < maxScan; i++) {
    const seed = `w${i.toString(36)}`;
    const result = solve({
      seed,
      drawCount,
      maxNodes: 150_000,
      maxTimeMs: 3_000,
    });
    if (!result.solvable && !result.timedOut) {
      return seed;
    }
  }
  return null;
}

function writePool(drawCount: 1 | 3, seeds: string[]): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `winnable-draw${drawCount}.json`);
  writeFileSync(
    path,
    `${JSON.stringify({ drawCount, count: seeds.length, seeds }, null, 2)}\n`,
    'utf8',
  );
  console.log(`Wrote ${seeds.length} seeds to ${path}`);
}

function writeDeadSeed(drawCount: 1 | 3, seed: string): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `unwinnable-draw${drawCount}.json`);
  writeFileSync(
    path,
    `${JSON.stringify({ drawCount, seed, verified: true }, null, 2)}\n`,
    'utf8',
  );
  console.log(`Wrote proven unwinnable seed to ${path}: ${seed}`);
}

export function runGeneratePool(
  draw: '1' | '3' | 'both' = 'both',
  target = 50,
): { draw1: string[]; draw3: string[]; deadDraw1: string | null } {
  const base = {
    target,
    maxScan: target * 80,
    maxNodes: 600_000,
    maxTimeMs: 20_000,
  };

  const draw1 =
    draw === '3'
      ? []
      : generatePool({
          ...base,
          drawCount: 1,
        });

  const draw3 =
    draw === '1'
      ? []
      : generatePool({
          ...base,
          drawCount: 3,
        });

  if (draw1.length > 0) writePool(1, draw1);
  if (draw3.length > 0) writePool(3, draw3);

  let deadDraw1: string | null = null;
  if (draw !== '3') {
    deadDraw1 = findProvenUnwinnable(1, 300);
    if (deadDraw1) writeDeadSeed(1, deadDraw1);
  }

  return { draw1, draw3, deadDraw1 };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { draw, target } = parseArgs();
  runGeneratePool(draw, target);
}

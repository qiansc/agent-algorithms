import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestThreshold } from './solution.ts';

function brute(samples: [number, number][], fp: number, fn: number): [number, number] {
  const cands = [...new Set([...samples.map(([s]) => s), Infinity])].sort((x, y) => y - x);
  let best: [number, number] | null = null;
  for (const t of cands) {
    let loss = 0;
    for (const [s, y] of samples) {
      if (s >= t && y === 0) loss += fp;
      if (s < t && y === 1) loss += fn;
    }
    if (best === null || loss < best[1]) best = [t, loss];
  }
  return best as [number, number];
}

test('routing-threshold · 与枚举阈值对拍', () => {
  let seed = 49;
  const rand = (m: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % m;
  };
  const scores = [0.1, 0.2, 0.3, 0.5, 0.7, 0.9];
  for (let t = 0; t < 2000; t++) {
    const samples = Array.from({ length: rand(11) }, (): [number, number] => [scores[rand(6)], rand(2)]);
    const fp = rand(6);
    const fn = rand(6);
    assert.deepEqual(bestThreshold(samples, fp, fn), brute(samples, fp, fn));
  }
});

test('routing-threshold · 输入顺序不影响结果', () => {
  assert.deepEqual(bestThreshold([[0.9, 1], [0.8, 1], [0.8, 0], [0.2, 1]], 4, 2), [0.9, 4]);
  assert.deepEqual(bestThreshold([[0.2, 1], [0.8, 0], [0.9, 1], [0.8, 1]], 4, 2), [0.9, 4]);
});

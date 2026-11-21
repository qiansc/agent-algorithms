import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mmr } from './solution.ts';

// 每轮和所有已选片段重新比一遍的 O(n·k²) 写法，用来对拍
function naiveMmr(q: number[], p: number[][], k: number, lam: number): number[] {
  const n = q.length;
  let first = 0;
  for (let i = 1; i < n; i++) if (q[i] > q[first]) first = i;
  const chosen = [first];
  while (chosen.length < Math.min(k, n)) {
    let best = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < n; i++) {
      if (chosen.includes(i)) continue;
      const redundancy = Math.max(...chosen.map((j) => p[i][j]));
      const score = lam * q[i] - (1 - lam) * redundancy;
      if (score > bestScore) {
        best = i;
        bestScore = score;
      }
    }
    chosen.push(best);
  }
  return chosen;
}

test('mmr-rerank · 增量维护冗余与朴素写法一致（随机对拍）', () => {
  let seed = 21;
  const rand = (m: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % m;
  };
  const lams = [0, 0.25, 0.5, 0.75, 1];
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(9);
    const q = Array.from({ length: n }, () => rand(21) / 20);
    const p = Array.from({ length: n }, () => new Array<number>(n).fill(1));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) p[i][j] = p[j][i] = rand(21) / 20;
    }
    const k = 1 + rand(n + 1);
    const lam = lams[rand(5)];
    assert.deepEqual(mmr(q, p, k, lam), naiveMmr(q, p, k, lam));
  }
});

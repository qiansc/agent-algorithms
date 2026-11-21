import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gauc } from './followup.ts';
import { auc } from './solution.ts';

/** O(P·N) 定义法：逐对比较，并列记 0.5。只用来对拍。 */
function aucBrute(scores: number[], labels: number[]): number {
  const pos = scores.filter((_, i) => labels[i] === 1);
  const neg = scores.filter((_, i) => labels[i] === 0);
  let wins = 0;
  for (const p of pos) for (const q of neg) wins += p > q ? 1 : p === q ? 0.5 : 0;
  return wins / (pos.length * neg.length);
}

function rng(seed: number): (n: number) => number {
  let s = seed >>> 0;
  return (n) => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s % n;
  };
}

test('auc-with-ties · 与 O(P·N) 定义法对拍', () => {
  const rand = rng(42);
  for (let t = 0; t < 500; t++) {
    const n = 2 + rand(29);
    const labels = Array.from({ length: n }, () => rand(2));
    if (new Set(labels).size < 2) [labels[0], labels[1]] = [0, 1];
    const scores = Array.from({ length: n }, () => rand(6) / 5);
    assert.ok(Math.abs(auc(scores, labels) - aucBrute(scores, labels)) < 1e-12);
  }
});

test('auc-with-ties · 延伸：GAUC', () => {
  const users = ['u1', 'u1', 'u1', 'u2', 'u2', 'u2', 'u2', 'u3', 'u3'];
  const scores = [0.9, 0.8, 0.8, 0.4, 0.3, 0.2, 0.1, 0.95, 0.05];
  const labels = [1, 1, 0, 1, 1, 0, 0, 0, 0];
  assert.ok(Math.abs(gauc(users, scores, labels) - 25 / 28) < 1e-12);
  assert.ok(Math.abs(auc(scores, labels) - 27 / 40) < 1e-12);
  assert.throws(() => gauc(['a', 'a'], [0.1, 0.2], [1, 1]));
  assert.throws(() => gauc(['a', 'b'], [0.1, 0.2], [1, 0]));
});

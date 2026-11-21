import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KVCache } from './followup.ts';
import { causalAttention } from './solution.ts';

const Q = [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0]];
const K = [[2, 0, 0, 0], [0, 2, 0, 0], [0, 0, 2, 0]];
const V = [[3], [6], [9]];

test('causal-attention · 延伸：逐个生成与整矩阵结果一致', () => {
  const cache = new KVCache();
  const full = causalAttention(Q, K, V);
  for (let i = 0; i < 3; i++) {
    const row = cache.step(Q[i], K[i], V[i]);
    row.forEach((x, c) => assert.ok(Math.abs(x - full[i][c]) < 1e-12));
  }
  assert.equal(cache.keys.length, 3);
});

test('causal-attention · 延伸：样例 1 逐个生成', () => {
  const cache = new KVCache();
  assert.deepEqual(cache.step([0], [0], [2]), [2]);
  assert.ok(Math.abs(cache.step([1], [Math.log(3)], [10])[0] - 8) < 1e-12);
});

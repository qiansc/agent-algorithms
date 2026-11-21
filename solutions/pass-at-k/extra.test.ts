import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meanPassAtK } from './followup.ts';
import { passAtK } from './solution.ts';

// 用 BigInt 算精确的组合数之比，作为对拍基准
function comb(n: number, k: number): bigint {
  let r = 1n;
  for (let i = 0; i < k; i++) r = (r * BigInt(n - i)) / BigInt(i + 1);
  return r;
}
function exact(n: number, c: number, k: number): number {
  const num = comb(n - c, k);
  const den = comb(n, k);
  const scale = 10n ** 18n;
  return 1 - Number((num * scale) / den) / 1e18;
}

test('pass-at-k · 与组合数精确值对拍', () => {
  let seed = 24;
  const rand = (m: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % m;
  };
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(60);
    const c = rand(n + 1);
    const k = 1 + rand(n);
    assert.ok(Math.abs(passAtK(n, c, k) - exact(n, c, k)) <= 1e-12, `${n} ${c} ${k}`);
  }
});

test('pass-at-k · 延伸：逐题算再平均', () => {
  assert.equal(meanPassAtK([[2, 2], [2, 0]], 2), 0.5);
  assert.ok(Math.abs(passAtK(4, 2, 2) - 5 / 6) < 1e-12);
  assert.ok(Math.abs(meanPassAtK([[5, 2], [10, 3], [3, 0]], 2) - (0.7 + 8 / 15) / 3) < 1e-12);
  assert.throws(() => meanPassAtK([], 1));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { largestAtMost } from './followup.ts';
import { largestBelow } from './solution.ts';

/** 从 n - 1 往下逐个检查，第一个只由可用数字组成的数就是答案。 */
function bruteBelow(n: number, digits: number[]): number {
  const allowed = new Set(digits.map(String));
  for (let x = n - 1; x > 0; x--) {
    if (Array.from(String(x)).every((c) => allowed.has(c))) return x;
  }
  return -1;
}

// 固定种子的线性同余生成器，保证每次跑的数据一样
function makeRng(seed: number): (lo: number, hi: number) => number {
  let s = seed;
  return (lo, hi) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return lo + (s % (hi - lo + 1));
  };
}

test('largest-number-below · 随机数据与暴力枚举对拍', () => {
  const rand = makeRng(56);
  for (let t = 0; t < 2000; t++) {
    const n = rand(1, 5000);
    const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const digits: number[] = [];
    const k = rand(1, 4);
    while (digits.length < k) digits.push(...pool.splice(rand(0, pool.length - 1), 1)); // 不放回抽样
    assert.equal(largestBelow(n, digits), bruteBelow(n, digits), `${n} ${digits}`);
    assert.equal(largestAtMost(n, digits), bruteBelow(n + 1, digits), `${n} ${digits}`);
  }
});

test('largest-number-below · 延伸：小于等于 n', () => {
  assert.equal(largestAtMost(2111, [1, 2]), 2111);
  assert.equal(largestAtMost(2533, [1, 2, 5, 9]), 2529);
  assert.equal(largestAtMost(1, [1]), 1);
  assert.equal(largestAtMost(1000, [2, 3]), 333);
});

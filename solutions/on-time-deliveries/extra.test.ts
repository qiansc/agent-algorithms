import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maxOnTimeValue } from './followup.ts';
import { maxOnTime, MaxHeap } from './solution.ts';

function brute(orders: number[][]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << orders.length; mask++) {
    const subset = orders.filter((_, i) => mask & (1 << i)).sort((x, y) => x[1] - y[1]);
    let t = 0;
    let ok = true;
    for (const [d, deadline] of subset) {
      t += d;
      ok = ok && t <= deadline;
    }
    if (ok) best = Math.max(best, subset.reduce((s, o) => s + o[2], 0));
  }
  return best;
}

// 简单的线性同余随机数，保证每次跑出来一样
function rng(seed: number): (lo: number, hi: number) => number {
  let s = seed;
  return (lo, hi) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return lo + (s % (hi - lo + 1));
  };
}

test('on-time-deliveries · 手写最大堆按从大到小弹出', () => {
  const heap = new MaxHeap();
  const values = [5, 1, 8, 3, 8, 2, 9, 0];
  values.forEach((v) => heap.push(v));
  const out: number[] = [];
  while (heap.size > 0) out.push(heap.pop());
  assert.deepEqual(out, [...values].sort((a, b) => b - a));
  assert.throws(() => heap.pop());
});

test('on-time-deliveries · 延伸：反例', () => {
  assert.equal(maxOnTime([[3, 3], [1, 2], [1, 3]]), 2);
  assert.equal(maxOnTimeValue([[3, 3, 10], [1, 2, 2], [1, 3, 2]]), 10);
  assert.equal(maxOnTimeValue([[1, 2, 6], [1, 2, 5], [2, 2, 10]]), 11);
});

test('on-time-deliveries · 延伸：边界与非法输入', () => {
  assert.equal(maxOnTimeValue([]), 0);
  assert.equal(maxOnTimeValue([[3, 2, 9]]), 0);
  assert.equal(maxOnTimeValue([[5, 5, 7]]), 7);
  for (const bad of [[[0, 5, 1]], [[1, 5]], [[1, 5, -1]]]) assert.throws(() => maxOnTimeValue(bad));
});

test('on-time-deliveries · 延伸：与枚举子集对拍', () => {
  const r = rng(230);
  for (let k = 0; k < 300; k++) {
    const orders = Array.from({ length: r(0, 7) }, () => [r(1, 5), r(0, 12), r(0, 9)]);
    assert.equal(maxOnTimeValue(orders), brute(orders), JSON.stringify(orders));
    assert.equal(maxOnTimeValue(orders.map(([d, D]) => [d, D, 1])), maxOnTime(orders.map(([d, D]) => [d, D])));
  }
});

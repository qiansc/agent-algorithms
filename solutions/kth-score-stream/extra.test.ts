import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kthAcrossShards } from './followup.ts';
import { KthScore, MinHeap } from './solution.ts';

function rng(seed: number): (n: number) => number {
  let s = seed >>> 0;
  return (n) => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s % n;
  };
}

test('kth-score-stream · 延伸：分片各留 k 个', () => {
  assert.equal(kthAcrossShards([[10, 9, 8, 1], [7, 2]], 3), 8);
  assert.equal(kthAcrossShards([[1], [2]], 3), null);
  const rand = rng(3);
  for (let t = 0; t < 200; t++) {
    const shards = Array.from({ length: 1 + rand(4) }, () => Array.from({ length: rand(7) }, () => rand(10)));
    const k = 1 + rand(5);
    const flat = shards.flat().sort((a, b) => b - a);
    assert.equal(kthAcrossShards(shards, k), flat.length >= k ? flat[k - 1] : null);
  }
});

test('kth-score-stream · 与排序对拍，小顶堆始终合法', () => {
  const rand = rng(11);
  for (let t = 0; t < 200; t++) {
    const k = 1 + rand(6);
    const ks = new KthScore(k);
    const seen: number[] = [];
    const n = rand(31);
    for (let i = 0; i < n; i++) {
      const x = rand(11) - 5;
      seen.push(x);
      const sorted = [...seen].sort((a, b) => b - a);
      assert.equal(ks.add(x), seen.length >= k ? sorted[k - 1] : null);
      const a = ks.top.items;
      for (let j = 1; j < a.length; j++) assert.ok(a[(j - 1) >> 1] <= a[j]);
    }
  }
  const h = new MinHeap();
  for (const x of [4, 9, 4]) h.push(x);
  h.replaceTop(7);
  assert.deepEqual(h.items, [4, 9, 7]);
  h.replaceTop(10);
  assert.deepEqual(h.items, [7, 9, 10]);
});

test('kth-score-stream · k < 1 报错', () => {
  assert.throws(() => new KthScore(0));
  assert.throws(() => new KthScore(-1));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { intersectShortLong } from './followup.ts';
import { intersectLists } from './solution.ts';

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function sample(rand: () => number, range: number, count: number): number[] {
  const pool = Array.from({ length: range }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

test('posting-list-intersection · 延伸：短表二分查长表', () => {
  assert.deepEqual(intersectShortLong([2, 8, 9], [1, 2, 8, 20]), [2, 8]);
  const long = Array.from({ length: 3334 }, (_, i) => i * 3);
  assert.deepEqual(intersectShortLong([3, 500, 9999], long), [3, 9999]);
  assert.deepEqual(intersectShortLong([], [1, 2]), []);
  assert.deepEqual(intersectShortLong([5], []), []);
  const rand = rng(7);
  for (let t = 0; t < 200; t++) {
    const a = sample(rand, 60, Math.floor(rand() * 7));
    const b = sample(rand, 60, Math.floor(rand() * 41));
    assert.deepEqual(intersectShortLong(a, b), intersectLists([a, b]));
  }
});

test('posting-list-intersection · 与集合求交对拍，且不改输入', () => {
  const rand = rng(5);
  for (let t = 0; t < 300; t++) {
    const lists = Array.from({ length: 1 + Math.floor(rand() * 5) }, () => sample(rand, 40, Math.floor(rand() * 26)));
    const want = lists[0].filter((x) => lists.every((l) => l.includes(x)));
    assert.deepEqual(intersectLists(lists), want);
  }
  const lists = [[2, 5, 8, 13], [1, 2, 8, 20], [2, 8, 9]];
  intersectLists(lists);
  assert.deepEqual(lists, [[2, 5, 8, 13], [1, 2, 8, 20], [2, 8, 9]]);
});

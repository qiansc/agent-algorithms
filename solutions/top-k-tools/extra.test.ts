import { test } from 'node:test';
import assert from 'node:assert/strict';
import { topToolsHeap } from './followup.ts';
import { topTools } from './solution.ts';

test('top-k-tools · 延伸：大小为 k 的堆', () => {
  assert.deepEqual(topToolsHeap(['web', 'db', 'db', 'mail', 'web', 'calc'], 3), ['db', 'web', 'calc']);
  assert.deepEqual(topToolsHeap(['web', 'db', 'db', 'mail', 'web', 'calc'], 10), ['db', 'web', 'calc', 'mail']);
  assert.deepEqual(topToolsHeap(['web'], 0), []);
  assert.deepEqual(topToolsHeap([], 2), []);
  assert.deepEqual(topToolsHeap(['a', 'a', 'b', 'b', 'z', 'z', 'z', 'z', 'z', 'z'], 1), ['z']);
});

test('top-k-tools · 延伸：和排序结果一致（随机对拍）', () => {
  let seed = 7;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let t = 0; t < 200; t++) {
    const calls = Array.from({ length: rand(41) }, () => 'abcdefgh'[rand(8)]);
    const k = rand(10);
    assert.deepEqual(topToolsHeap(calls, k), topTools(calls, k));
  }
});

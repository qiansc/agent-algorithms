import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orderKind } from './followup.ts';
import { MinHeap } from './solution.ts';

test('lexicographic-tool-order · 延伸：合法顺序是否唯一', () => {
  assert.equal(orderKind(5, [[0, 3], [1, 2], [2, 3]]), 'many');
  assert.equal(orderKind(4, [[0, 1], [1, 2], [2, 3]]), 'unique');
  assert.equal(orderKind(3, [[0, 1], [1, 2], [0, 2]]), 'unique');
  assert.equal(orderKind(2, [[0, 1], [1, 0]]), 'cycle');
  assert.equal(orderKind(1, []), 'unique');
  assert.equal(orderKind(0, []), 'unique');
});

test('lexicographic-tool-order · 小顶堆按从小到大弹出', () => {
  let seed = 9;
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  const heap = new MinHeap();
  const xs: number[] = [];
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(rand() * 50);
    xs.push(x);
    heap.push(x);
  }
  const out: number[] = [];
  while (heap.size > 0) out.push(heap.pop());
  assert.deepEqual(out, xs.sort((a, b) => a - b));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestWindowValueK } from './followup.ts';
import { bestWindowValue, bisectRight } from './solution.ts';

const SAMPLE: [number, number, number][] = [[0, 3, 8], [1, 2, 3], [2, 5, 6], [3, 5, 7], [5, 6, 2]];

test('weighted-interval-scheduling · bisectRight 与 Python 一致', () => {
  assert.equal(bisectRight([2, 3, 5], 3), 2);
  assert.equal(bisectRight([2, 3, 5], 1), 0);
  assert.equal(bisectRight([2, 3, 5, 5], 5), 4);
  assert.equal(bisectRight([2, 3, 5, 5], 5, 0, 2), 2);
  assert.equal(bisectRight([], 0), 0);
});

test('weighted-interval-scheduling · 延伸：最多接 k 个任务', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((k) => bestWindowValueK(SAMPLE, k)), [0, 8, 15, 17, 17]);
  assert.equal(bestWindowValueK([], 3), 0);
  // k 足够大时和原题一样
  assert.equal(bestWindowValueK(SAMPLE, SAMPLE.length), bestWindowValue(SAMPLE));
});

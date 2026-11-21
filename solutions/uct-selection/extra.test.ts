import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uctRounds } from './followup.ts';
import { uctPick } from './solution.ts';

const sample = [[3, 2.0], [1, 0.9], [6, 4.2]];

test('uct-selection · 延伸：B 连续拿到 0 分', () => {
  assert.deepEqual(uctRounds(sample, [0, 0, 0]), [1, 1, 0]);
  assert.deepEqual(sample, [[3, 2.0], [1, 0.9], [6, 4.2]]); // 不改调用方的数组
});

test('uct-selection · 延伸：更多轮', () => {
  assert.deepEqual(uctRounds(sample, [0, 0, 0, 0, 0, 0]), [1, 1, 0, 0, 2, 1]);
  assert.deepEqual(uctRounds([[0, 0], [0, 0], [0, 0]], [1, 0, 0]), [0, 1, 2]);
  assert.deepEqual(uctRounds(sample, []), []);
});

test('uct-selection · 默认 c 等于 √2', () => {
  assert.equal(uctPick(sample), uctPick(sample, Math.sqrt(2)));
});

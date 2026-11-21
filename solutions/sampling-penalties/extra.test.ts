import { test } from 'node:test';
import assert from 'node:assert/strict';
import { additivePenalties } from './followup.ts';

test('sampling-penalties · 延伸：减法版惩罚的样例', () => {
  assert.deepEqual(additivePenalties([2.0, -1.0, 0.5, 1.0, 1.0], [0, 1, 1], 0.5, 0.5), [1.0, -2.5, 0.5, 1.0, 1.0]);
});

test('sampling-penalties · 延伸：没有历史时不变', () => {
  assert.deepEqual(additivePenalties([0.3, -0.2], [], 1.0, 1.0), [0.3, -0.2]);
});

test('sampling-penalties · 延伸：出现次数越多罚得越多', () => {
  const got = additivePenalties([2.0, 0.0], [0, 0, 0], 0.4, 0.1);
  assert.ok(Math.abs(got[0] - 0.7) < 1e-12);
  assert.equal(got[1], 0);
});

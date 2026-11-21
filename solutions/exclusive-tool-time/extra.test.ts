import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exclusiveTimeUnits } from './followup.ts';

const obj = (m: Map<string, number>) => Object.fromEntries(m);

test('exclusive-tool-time · 延伸：结束时刻包含在内', () => {
  assert.deepEqual(obj(exclusiveTimeUnits([[0, 'A', 'start'], [2, 'B', 'start'], [4, 'B', 'end'], [5, 'A', 'end']])), { A: 3, B: 3 });
  assert.deepEqual(obj(exclusiveTimeUnits([[0, '0', 'start'], [2, '1', 'start'], [5, '1', 'end'], [6, '0', 'end']])), { 0: 3, 1: 4 });
  assert.deepEqual(obj(exclusiveTimeUnits([[3, 'A', 'start'], [3, 'A', 'end']])), { A: 1 });
  assert.deepEqual(obj(exclusiveTimeUnits([[0, 'A', 'start'], [2, 'A', 'start'], [5, 'A', 'end'], [7, 'A', 'end']])), { A: 8 });
  assert.deepEqual(obj(exclusiveTimeUnits([])), {});
});

test('exclusive-tool-time · 延伸：end 对不上时抛错', () => {
  assert.throws(() => exclusiveTimeUnits([[0, 'A', 'start'], [1, 'B', 'end']]));
});

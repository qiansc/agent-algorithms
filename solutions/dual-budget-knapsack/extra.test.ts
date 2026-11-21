import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestBranchesExact } from './followup.ts';
import { bestBranches } from './solution.ts';

const SAMPLE: [number, number, number][] = [[2, 4, 9], [1, 3, 6], [1, 2, 5]];

test('dual-budget-knapsack · 延伸：两项预算恰好用完', () => {
  assert.equal(bestBranchesExact(SAMPLE, 2, 5), 11);
  assert.equal(bestBranchesExact(SAMPLE, 2, 4), 9);
  assert.equal(bestBranchesExact(SAMPLE, 0, 0), 0);
  // 恰好 1 次调用、4 单位 token 凑不出来；“最多”版本会给 6
  assert.equal(bestBranchesExact(SAMPLE, 1, 4), -1);
  assert.equal(bestBranches(SAMPLE, 1, 4), 6);
});

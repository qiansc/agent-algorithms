import { test } from 'node:test';
import assert from 'node:assert/strict';
import { microRecall } from './followup.ts';
import { evaluateRankings, type Doc } from './solution.ts';

const range = (a: number, b: number) => Array.from({ length: b - a }, (_, i) => a + i);
const big: [Doc[], Doc[]][] = [[[1, 500, 501], range(1, 101)], [[7], [7]]];

test('recall-mrr · 延伸：按查询平均 vs 按文档汇总', () => {
  const [macroRecall] = evaluateRankings(big, 3);
  assert.ok(Math.abs(macroRecall - 0.505) < 1e-12);
  assert.ok(Math.abs(microRecall(big, 3) - 2 / 101) < 1e-12);
  const sample: [Doc[], Doc[]][] = [[[8, 2, 2, 7], [2, 7]], [[5, 3], [5]], [[4], []]];
  assert.ok(Math.abs(microRecall(sample, 3) - 2 / 3) < 1e-12);
  assert.equal(microRecall([[[1], []]], 3), 0);
});

test('recall-mrr · 接受 Set 和字符串编号', () => {
  assert.deepEqual(evaluateRankings([[[8, 2, 2, 7], new Set([2, 7])]], 3), [0.5, 0.5]);
  assert.deepEqual(evaluateRankings([[['a', 'b'], new Set(['b'])]], 2), [1, 0.5]);
  const sample: [Doc[], Doc[]][] = [[[8, 2, 2, 7], [2, 7]], [[5, 3], [5]], [[4], []]];
  assert.deepEqual(evaluateRankings(sample, 4), [1, 0.75]);
});

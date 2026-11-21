import { test } from 'node:test';
import assert from 'node:assert/strict';
import { actionProbs } from './solution.ts';
import { actionLogProbs } from './followup.ts';

test('masked-softmax · 两种错误写法的数值', () => {
  // 减全局最大值 2000：权重全部下溢成 0，0 / 0 = NaN
  const w = [1000, 1000].map((x) => Math.exp(x - 2000));
  assert.deepEqual(w, [0, 0]);
  assert.ok(Number.isNaN(w[0] / (w[0] + w[1])));
  // 不减最大值：JS 不抛错，得到 Infinity，Infinity / Infinity = NaN
  assert.equal(Math.exp(1000), Infinity);
  assert.ok(Number.isNaN(Math.exp(1000) / (Math.exp(1000) * 2)));
});

test('masked-softmax · 延伸：log 概率', () => {
  assert.deepEqual(actionLogProbs([0, -800], [true, true], 1), [0, -800]);
  assert.equal(actionProbs([0, -800], [true, true], 1)[1], 0);
  const got = actionLogProbs([2.0, 1.0, 0.1, 3.0], [true, true, true, false], 1);
  assert.equal(got[3], -Infinity);
  const probs = actionProbs([2.0, 1.0, 0.1, 3.0], [true, true, true, false], 1);
  for (let i = 0; i < 3; i++) assert.ok(Math.abs(Math.exp(got[i]) - probs[i]) < 1e-12);
  assert.ok(Math.abs(got[0] - -0.41703001627783354) < 1e-12);
  assert.throws(() => actionLogProbs([1], [false], 1));
  assert.throws(() => actionLogProbs([1], [true], 0));
  assert.throws(() => actionLogProbs([1, 2], [true], 1));
});

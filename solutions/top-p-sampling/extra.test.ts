import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NucleusSampler } from './followup.ts';
import { nucleusDraw } from './solution.ts';

test('top-p-sampling · 延伸：排序一次、二分抽样与逐个扫描一致', () => {
  const probs = [0.125, 0.5, 0.25, 0.125];
  for (const p of [0.3, 0.7, 0.75, 1.0]) {
    const sampler = new NucleusSampler(probs, p);
    for (let k = 0; k < 100; k++) {
      const u = k / 100;
      assert.equal(sampler.draw(u), nucleusDraw(probs, p, u));
    }
  }
});

test('top-p-sampling · 延伸：样例的累计表', () => {
  const sampler = new NucleusSampler([0.125, 0.5, 0.25, 0.125], 0.7);
  assert.deepEqual(sampler.ids, [1, 2]);
  assert.deepEqual(sampler.ends, [0.5, 0.75]);
  assert.equal(sampler.draw(0.8), 2);
  assert.equal(sampler.draw(0.5), 1);
  assert.equal(sampler.draw(2 / 3), 2);
});

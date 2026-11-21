import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rmsNorm } from './solution.ts';
import { streamingMeanVar } from './followup.ts';

function close(got: number[], want: number[], tol = 1e-9): void {
  assert.equal(got.length, want.length);
  got.forEach((g, i) => assert.ok(Math.abs(g - want[i]) <= tol, `index ${i}: ${g} vs ${want[i]}`));
}

test('layernorm-rmsnorm · RMSNorm 数值', () => {
  close(rmsNorm([1, 2, 3, 4], [1, 1, 1, 1], 0), [0.3651483716701107, 0.7302967433402214, 1.0954451150103321, 1.4605934866804429]);
  close(rmsNorm([11, 12, 13, 14], [1, 1, 1, 1], 0), [0.8765009801785554, 0.956182887467515, 1.0358647947564745, 1.1155467020454342]);
  close(rmsNorm([3, 6, 9, 12], [1, 1, 1, 1], 0), rmsNorm([1, 2, 3, 4], [1, 1, 1, 1], 0));
  close(rmsNorm([-3], [1], 0), [-1]);
  close(rmsNorm([0, 0, 0], [1, 1, 1]), [0, 0, 0]);
  close(rmsNorm([1, 2, 3, 4], [0.5, 1, 2, 0], 0), [0.18257418583505536, 0.7302967433402214, 2.1908902300206643, 0]);
});

test('layernorm-rmsnorm · RMSNorm 随机数据', () => {
  const x = [1.82, -4.084, 1.178, 3.419, 3.346, 0.15, 1.31, -1.308, 0.28, -3.921, 1.829, 1.007, -2.181, -1.214, 2.361, -0.561];
  const g = [1.46, 1.471, 1.338, 0.591, 0.575, 0.789, 0.861, 1.205, 1.327, 1.063, 1.139, 1.073, 0.534, 1.027, 0.713, 0.917];
  const want = [1.19097820137913, -2.6926380277698367, 0.7064492570369316, 0.9056620096622422, 0.8623297119311217, 0.05304541251438357, 0.5055382444368262, -0.7064385000458008, 0.1665361510253009, -1.868141101854149, 0.9337207246113376, 0.48429363516120905, -0.5220071978582753, -0.5588158286764522, 0.7545101487860221, -0.23057476026752802];
  close(rmsNorm(x, g, 1e-6), want);
});

test('layernorm-rmsnorm · RMSNorm 非法输入', () => {
  assert.throws(() => rmsNorm([], []));
  assert.throws(() => rmsNorm([1, 2], [1]));
  assert.throws(() => rmsNorm([0, 0], [1, 1], 0));
  assert.throws(() => rmsNorm([1, 2], [1, 1], -1e-6));
});

test('layernorm-rmsnorm · 延伸：一遍扫描求均值和方差', () => {
  assert.deepEqual(streamingMeanVar([1, 2, 3, 4]), [2.5, 1.25]);
  assert.deepEqual(streamingMeanVar([1e8 + 1, 1e8 + 2, 1e8 + 3, 1e8 + 4]), [100000002.5, 1.25]);
  assert.deepEqual(streamingMeanVar([7]), [7, 0]);
  assert.deepEqual(streamingMeanVar(new Set([3])), [3, 0]);
  assert.throws(() => streamingMeanVar([]));
});

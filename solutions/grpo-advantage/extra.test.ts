import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupAdvantagesEps } from './followup.ts';

function close(got: number[][], want: number[][]): void {
  assert.equal(got.length, want.length);
  got.forEach((g, i) => {
    assert.equal(g.length, want[i].length);
    g.forEach((x, j) => assert.ok(Math.abs(x - want[i][j]) < 1e-9, `${x} != ${want[i][j]}`));
  });
}

test('grpo-advantage · 延伸：分差大时 eps 几乎不影响', () => {
  const k = 2 / 2.01;
  close(groupAdvantagesEps([[10, 10, 14, 14]], 0.01), [[-k, -k, k, k]]);
});

test('grpo-advantage · 延伸：分差很小时 eps 把优势压到一半', () => {
  close(groupAdvantagesEps([[0, 0, 0.02, 0.02]], 0.01), [[-0.5, -0.5, 0.5, 0.5]]);
});

test('grpo-advantage · 延伸：全相同的组与空组', () => {
  close(groupAdvantagesEps([[5, 5], [], [1]], 0.01), [[0, 0], [], [0]]);
});

test('grpo-advantage · 延伸：eps 必须大于 0', () => {
  assert.throws(() => groupAdvantagesEps([[1, 2]], 0));
});

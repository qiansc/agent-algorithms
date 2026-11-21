import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dualClipLoss } from './followup.ts';

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('ppo-clip · 延伸：极端负优势项被限制在 c 倍', () => {
  close(dualClipLoss([0.1], [0.9], [-1], 0.2, 3), 3);
  close(dualClipLoss([0.5, 0.5, 0.5, 0.1], [0.8, 0.2, 0.8, 0.9], [2, -1, -1, -1], 0.2, 3), 0.75);
});

test('ppo-clip · 延伸：比值不极端时与原题一致', () => {
  close(dualClipLoss([0.5, 0.5, 0.5], [0.8, 0.2, 0.8], [2, -1, -1], 0.2, 3), 0);
  close(dualClipLoss([0.5, 0.5], [0.55, 0.3], [1, -2], 0.2, 3), 0.25);
  close(dualClipLoss([0.2], [1], [3], 0.1, 3), -3.3);
});

test('ppo-clip · 延伸：c 必须大于 1', () => {
  assert.throws(() => dualClipLoss([0.5], [0.5], [1], 0.2, 1));
});

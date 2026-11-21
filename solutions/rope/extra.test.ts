import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ropeScore } from './followup.ts';

const Q = [1, 2, 0.5, -1];
const K = [0.3, -0.7, 2, 1];
const near = (a: number, b: number) => Math.abs(a - b) < 1e-12;

test('rope · 延伸：分数只取决于位置差', () => {
  for (const [m, n] of [[3, 5], [0, 2], [10, 12], [1, 3]]) assert.ok(near(ropeScore(Q, K, m, n, 100), 1.1431748480875898));
});

test('rope · 延伸：前后颠倒分数会变', () => {
  assert.ok(near(ropeScore(Q, K, 5, 3, 100), -0.2276518076838766));
});

test('rope · 延伸：所有位置整体加 1，分数不变', () => {
  for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) assert.ok(near(ropeScore(Q, K, m, n, 100), ropeScore(Q, K, m + 1, n + 1, 100)));
});

test('rope · 延伸：同一位置就是普通点积', () => {
  assert.ok(near(ropeScore(Q, K, 2, 2, 100), -1.1));
});

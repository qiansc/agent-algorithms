import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spiralAt } from './followup.ts';
import { spiralOrder } from './solution.ts';

test('spiral-matrix · 延伸：只取第 k 个', () => {
  const matrix = [
    [1, 2, 3, 4],
    [5, 6, 7, 8],
    [9, 10, 11, 12],
  ];
  assert.equal(spiralAt(matrix, 0), 1);
  assert.equal(spiralAt(matrix, 4), 8);
  assert.equal(spiralAt(matrix, 9), 5);
  assert.equal(spiralAt(matrix, 10), 6);
  assert.equal(spiralAt(matrix, 11), 7);
  assert.throws(() => spiralAt(matrix, 12));
  assert.throws(() => spiralAt(matrix, -1));
});

test('spiral-matrix · 延伸：随机矩阵与完整序列一致', () => {
  let seed = 51;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rand(8);
    const cols = 1 + rand(8);
    const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rand(100)));
    const order = spiralOrder(matrix);
    assert.deepEqual(order.map((_, k) => spiralAt(matrix, k)), order);
  }
});

test('spiral-matrix · 延伸：2000×2000 的最后一格', () => {
  const n = 2000;
  const matrix = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => r * n + c));
  assert.equal(spiralAt(matrix, n * n - 1), 1000 * n + 999);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LoRALinear, matvec } from './solution.ts';
import { loraGrads } from './followup.ts';

function close(a: unknown, b: unknown, tol = 1e-9): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => close(x, b[i], tol));
  }
  return Math.abs((a as number) - (b as number)) <= tol;
}

test('lora-layer · 形状不对时抛错', () => {
  assert.throws(() => new LoRALinear([], [[1]], [], 1));
  assert.throws(() => new LoRALinear([[1, 0], [0, 1]], [], [[], []], 1));
  assert.throws(() => new LoRALinear([[1, 0], [0, 1]], [[1, 1, 1]], [[0], [0]], 1));
  assert.throws(() => new LoRALinear([[1, 0], [0, 1]], [[1, 1]], [[0]], 1));
  assert.throws(() => new LoRALinear([[1, 0], [0, 1]], [[1, 1]], [[0, 0], [0, 0]], 1));
  const layer = new LoRALinear([[1, 0], [0, 1]], [[1, 1]], [[2], [0]], 2);
  assert.throws(() => layer.forward([1, 2, 3]));
});

test('lora-layer · 随机矩阵上合并前后结果一致', () => {
  let seed = 41;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const randInt = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  const mat = (rows: number, cols: number, s: number) =>
    Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() * 2 - 1) * s));
  for (let n = 0; n < 20; n++) {
    const d = randInt(1, 6);
    const k = randInt(1, 6);
    const r = randInt(1, 3);
    const layer = new LoRALinear(mat(d, k, 1), mat(r, k, 1), mat(d, r, 1), [1, 8, 16][randInt(0, 2)]);
    const x = mat(1, k, 2)[0];
    assert.ok(close(layer.forward(x), matvec(layer.merge(), x)));
  }
});

test('lora-layer · 延伸：A、B 的梯度', () => {
  let [gA, gB] = loraGrads([[1, 1]], [[0], [0]], 2, [1, 2], [1, 0]);
  assert.ok(close(gA, [[0, 0]]) && close(gB, [[6], [0]]));
  [gA, gB] = loraGrads([[0, 0]], [[0], [0]], 2, [1, 2], [1, 0]);
  assert.ok(close(gA, [[0, 0]]) && close(gB, [[0], [0]]));
  [gA, gB] = loraGrads([[1, 1]], [[-0.6], [0]], 2, [1, 2], [1, 0]);
  assert.ok(close(gA, [[-1.2, -2.4]]) && close(gB, [[6], [0]]));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupedQueryCausal } from './followup.ts';
import { multiHeadCausal } from './solution.ts';

const eye = (n: number) => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
const close = (a: number[][], b: number[][]) =>
  a.length === b.length && a.every((r, i) => r.every((x, c) => Math.abs(x - b[i][c]) < 1e-12));
const X = [[1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 0, 0]];

test('multi-head-attention · 延伸：groups = heads 时就是多头', () => {
  assert.ok(close(groupedQueryCausal(X, eye(4), eye(4), eye(4), eye(4), 2, 2), multiHeadCausal(X, eye(4), eye(4), eye(4), eye(4), 2)));
});

test('multi-head-attention · 延伸：MQA 手算样例', () => {
  const wk = [[1, 0], [0, 1], [0, 0], [0, 0]];
  const wv = [[0, 0], [0, 0], [1, 0], [0, 1]];
  const e = Math.exp(1 / Math.sqrt(2));
  const want = [
    [1, 0, 1, 0],
    [1 / (1 + e), e / (1 + e), 1 / (1 + e), e / (1 + e)],
    [1 / (2 + e), 1 / (2 + e), 1 / 3, 1 / 3],
  ];
  assert.ok(close(groupedQueryCausal(X, eye(4), wk, wv, eye(4), 2, 1), want));
});

test('multi-head-attention · 延伸：GQA 等于把 K、V 复制给组内各头的多头', () => {
  let seed = 5;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648; // 线性同余，只为生成可复现的数
    return (seed / 2147483648) * 2 - 1;
  };
  const rand = (r: number, c: number) => Array.from({ length: r }, () => Array.from({ length: c }, rnd));
  const [x, wq, wk, wv, wo] = [rand(3, 8), rand(8, 8), rand(8, 4), rand(8, 4), rand(8, 8)];
  const expand = (w: number[][]) => w.map((row) => [0, 1, 2, 3].flatMap((h) => [0, 1].map((c) => row[Math.floor(h / 2) * 2 + c])));
  assert.ok(close(groupedQueryCausal(x, wq, wk, wv, wo, 4, 2), multiHeadCausal(x, wq, expand(wk), expand(wv), wo, 4)));
});

test('multi-head-attention · 延伸：groups 不整除 heads 时报错', () => {
  assert.throws(() => groupedQueryCausal(X, eye(4), eye(4), eye(4), eye(4), 2, 3), RangeError);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CosineIndex } from './followup.ts';
import { cosineTopK } from './solution.ts';

test('cosine-top-k · 延伸：预先归一化的索引', () => {
  const index = new CosineIndex([[1, 1], [5, 0], [0, 0], [-1, 0]]);
  assert.deepEqual(index.query([1, 0], 3), [1, 0, 3]);
  assert.deepEqual(index.query([0, 2], 2), [0, 1]);
  assert.deepEqual(index.query([1, 0], 0), []);
  assert.throws(() => index.query([0, 0], 1));
});

test('cosine-top-k · 延伸：与精确版、按距离排序一致（随机对拍）', () => {
  let seed = 11;
  const rand = (lo: number, hi: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return lo + (seed % (hi - lo + 1));
  };
  const docs = Array.from({ length: 60 }, () => Array.from({ length: 5 }, () => rand(-50, 50)));
  const index = new CosineIndex(docs);
  for (let t = 0; t < 30; t++) {
    const q = Array.from({ length: 5 }, () => rand(-50, 50));
    if (q.every((x) => x === 0)) continue;
    const got = index.query(q, 8);
    assert.deepEqual(got, cosineTopK(q, docs, 8));
    const norm = Math.sqrt(q.reduce((s, x) => s + x * x, 0));
    const qu = q.map((x) => x / norm);
    const dist = index.units.map(([idx, u]): [number, number] => [
      u.reduce((s, x, i) => s + (qu[i] - x) ** 2, 0),
      idx,
    ]);
    dist.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    assert.deepEqual(dist.slice(0, 8).map(([, idx]) => idx), got);
  }
});

test('cosine-top-k · 延伸：归一化之后浮点并列会变', () => {
  // 归一化后 [1,1] 与 [3,3] 的单位向量差在最后一位，浮点点积把 3,3 排在前面
  assert.deepEqual(new CosineIndex([[1, 1], [3, 3]]).query([1, 0], 2), [1, 0]);
  assert.deepEqual(cosineTopK([1, 0], [[1, 1], [3, 3]], 2), [0, 1]);
});

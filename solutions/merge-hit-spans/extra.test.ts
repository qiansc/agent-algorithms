import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeHitsWithGap, totalTokens } from './followup.ts';
import { mergeHits, type Hit } from './solution.ts';

const sample = (): Hit[] => [[2, 1, 5], [1, 8, 10], [1, 2, 6], [1, 5, 8], [1, 13, 14]];

test('merge-hit-spans · 合并省下的 token', () => {
  assert.equal(totalTokens(sample()), 14);
  assert.equal(totalTokens(mergeHits(sample())), 13);
});

test('merge-hit-spans · 延伸：允许小空隙', () => {
  assert.deepEqual(mergeHitsWithGap(sample(), 0), mergeHits(sample()));
  assert.deepEqual(mergeHitsWithGap(sample(), 2), [[1, 2, 10], [1, 13, 14], [2, 1, 5]]);
  const got = mergeHitsWithGap(sample(), 3);
  assert.deepEqual(got, [[1, 2, 14], [2, 1, 5]]);
  assert.equal(totalTokens(got), 16);
  assert.throws(() => mergeHitsWithGap(sample(), -1));
});

test('merge-hit-spans · 覆盖的 token 不变且不改输入', () => {
  let s = 8;
  const rand = (n: number) => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s % n;
  };
  for (let t = 0; t < 300; t++) {
    const hits: Hit[] = [];
    const count = rand(9);
    for (let k = 0; k < count; k++) {
      const st = rand(16);
      hits.push([1 + rand(3), st, st + 1 + rand(4)]);
    }
    const before = JSON.stringify(hits);
    const got = mergeHits(hits);
    assert.equal(JSON.stringify(hits), before);
    const cover = (xs: Hit[]) => {
      const set = new Set<string>();
      for (const [d, a, b] of xs) for (let k = a; k < b; k++) set.add(`${d}:${k}`);
      return [...set].sort();
    };
    assert.deepEqual(cover(got), cover(hits));
    for (let k = 1; k < got.length; k++) {
      assert.ok(got[k - 1][0] < got[k][0] || got[k - 1][2] < got[k][1]);
    }
  }
});

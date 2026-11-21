import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkSentences } from './followup.ts';
import { chunkSpans } from './solution.ts';

function rng(seed: number): (n: number) => number {
  let s = seed >>> 0;
  return (n) => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s % n;
  };
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

test('chunk-with-overlap · 延伸：按整句切块', () => {
  assert.deepEqual(chunkSentences([3, 2, 4, 1, 3], 6, 2), [[0, 2], [1, 3], [3, 5]]);
  assert.deepEqual(chunkSentences([], 6, 2), []);
  assert.deepEqual(chunkSentences([9, 2], 6, 2), [[0, 1], [1, 2]]);
  assert.deepEqual(chunkSentences([2, 2, 2], 6, 0), [[0, 3]]);
  assert.throws(() => chunkSentences([1, 0], 6, 2));
  const rand = rng(9);
  for (let t = 0; t < 500; t++) {
    const size = 1 + rand(12);
    const overlap = rand(size);
    const lengths = Array.from({ length: rand(16) }, () => 1 + rand(8));
    const spans = chunkSentences(lengths, size, overlap);
    if (lengths.length === 0) {
      assert.deepEqual(spans, []);
      continue;
    }
    assert.equal(spans[0][0], 0);
    assert.equal(spans[spans.length - 1][1], lengths.length);
    for (const [a, b] of spans) assert.ok(a < b && (sum(lengths.slice(a, b)) <= size || b - a === 1));
    for (let k = 1; k < spans.length; k++) {
      const [a1, b1] = spans[k - 1];
      const [a2, b2] = spans[k];
      assert.ok(a1 < a2 && a2 <= b1 && b1 < b2);
      assert.ok(sum(lengths.slice(a2, b1)) <= overlap);
    }
  }
});

test('chunk-with-overlap · 随机检查步长和重叠', () => {
  const rand = rng(4);
  for (let t = 0; t < 500; t++) {
    const size = 1 + rand(10);
    const overlap = rand(size);
    const n = rand(41);
    const spans = chunkSpans(n, size, overlap);
    if (n === 0) {
      assert.deepEqual(spans, []);
      continue;
    }
    assert.equal(spans[0][0], 0);
    assert.equal(spans[spans.length - 1][1], n);
    assert.equal(spans.filter(([, e]) => e === n).length, 1);
    for (let k = 1; k < spans.length; k++) {
      assert.equal(spans[k][0] - spans[k - 1][0], size - overlap);
      assert.equal(spans[k - 1][1] - spans[k][0], overlap);
    }
  }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeOnce, type Row } from './solution.ts';
import { encode } from './followup.ts';

// 样例 1 的语料连续训练三轮学到的合并表
const MERGES: [number, number, number][] = [
  [1, 1, 9],
  [1, 2, 10],
  [9, 1, 11],
];

test('bpe-merge · 连续三轮学到的合并表', () => {
  let rows: Row[] = [
    [[1, 1, 1], 2],
    [[1, 2], 3],
  ];
  const learned: [number, number, number][] = [];
  for (const newId of [9, 10, 11]) {
    const [pair, next] = mergeOnce(rows, newId);
    assert.ok(pair);
    learned.push([pair[0], pair[1], newId]);
    rows = next;
  }
  assert.deepEqual(learned, MERGES);
  assert.deepEqual(rows, [
    [[11], 2],
    [[10], 3],
  ]);
});

test('bpe-merge · 延伸：按学到的顺序编码新文本', () => {
  assert.deepEqual(encode([1, 2, 1, 1, 2], MERGES), [10, 9, 2]);
  assert.deepEqual(encode([1, 1, 1, 2], MERGES), [9, 10]);
  assert.deepEqual(encode([1, 1, 1], MERGES), [11]);
  assert.deepEqual(encode([1, 1, 1, 1, 1], MERGES), [9, 11]);
  assert.deepEqual(encode([], MERGES), []);
  assert.deepEqual(encode([3, 4], MERGES), [3, 4]);
  const [, rows] = mergeOnce([[[1, 2, 1, 1, 2], 1]], 10);
  assert.deepEqual(rows, [[[10, 1, 10], 1]]);
});

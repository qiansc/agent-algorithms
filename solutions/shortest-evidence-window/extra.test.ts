import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shortestOrdered } from './followup.ts';

const TOKENS = ['A', 'X', 'B', 'A', 'C', 'A', 'B'];

function bruteOrdered(tokens: string[], wanted: string[]): [number, number] | null {
  if (wanted.length === 0) return [0, 0];
  for (let len = 1; len <= tokens.length; len++) {
    for (let left = 0; left + len <= tokens.length; left++) {
      let j = 0;
      for (let i = left; i < left + len && j < wanted.length; i++) {
        if (tokens[i] === wanted[j]) j++;
      }
      if (j === wanted.length) return [left, left + len];
    }
  }
  return null;
}

test('shortest-evidence-window · 延伸：按顺序出现的最短窗口', () => {
  assert.deepEqual(shortestOrdered(TOKENS, ['A', 'A', 'B']), [3, 7]);
  assert.deepEqual(shortestOrdered(TOKENS, ['B', 'A']), [2, 4]);
  assert.deepEqual(shortestOrdered(TOKENS, []), [0, 0]);
  assert.equal(shortestOrdered(TOKENS, ['B', 'B', 'B']), null);
});

test('shortest-evidence-window · 延伸：与暴力枚举一致（随机对拍）', () => {
  let seed = 4;
  const rand = (m: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % m;
  };
  for (let t = 0; t < 500; t++) {
    const tokens = Array.from({ length: rand(11) }, () => 'ABCX'[rand(4)]);
    const wanted = Array.from({ length: rand(5) }, () => 'ABC'[rand(3)]);
    assert.deepEqual(shortestOrdered(tokens, wanted), bruteOrdered(tokens, wanted));
  }
});

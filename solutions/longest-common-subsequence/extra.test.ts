import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lcsLength, rougeL } from './followup.ts';
import { lcs } from './solution.ts';

function isSubsequence(seq: unknown[], whole: unknown[]): boolean {
  let k = 0;
  for (const x of whole) if (k < seq.length && x === seq[k]) k++;
  return k === seq.length;
}

function bruteLcsLength(a: string, b: string): number {
  // 从长到短枚举 a 的所有子序列（用位掩码），第一个同时是 b 的子序列的就是答案
  const xs = Array.from(a);
  const ys = Array.from(b);
  let best = 0;
  for (let mask = 0; mask < 1 << xs.length; mask++) {
    const pick = xs.filter((_, i) => (mask >> i) & 1);
    if (pick.length > best && isSubsequence(pick, ys)) best = pick.length;
  }
  return best;
}

// 固定种子的线性同余生成器，保证每次跑的数据一样
function makeRng(seed: number): (lo: number, hi: number) => number {
  let s = seed;
  return (lo, hi) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return lo + (s % (hi - lo + 1));
  };
}

const close = (x: number, y: number) => Math.abs(x - y) < 1e-12;

test('longest-common-subsequence · 随机数据与暴力枚举对拍', () => {
  const rand = makeRng(55);
  const word = () => Array.from({ length: rand(0, 8) }, () => 'ABC'[rand(0, 2)]).join('');
  for (let t = 0; t < 300; t++) {
    const a = word();
    const b = word();
    const [length, seq] = lcs(a, b);
    assert.equal(length, bruteLcsLength(a, b), `${a} ${b}`);
    assert.equal(seq.length, length);
    assert.ok(isSubsequence(seq, Array.from(a)) && isSubsequence(seq, Array.from(b)), `${a} ${b} ${seq}`);
    assert.equal(lcsLength(Array.from(a), Array.from(b)), length);
  }
});

test('longest-common-subsequence · 延伸：ROUGE-L 样例', () => {
  const [p, r, f] = rougeL('the cat sat on the mat', 'the cat on a mat');
  assert.ok(close(p, 0.8) && close(r, 4 / 6) && close(f, 8 / 11), `${p} ${r} ${f}`);
});

test('longest-common-subsequence · 延伸：ROUGE-L 词序与边界', () => {
  assert.deepEqual(rougeL('the cat sat on the mat', 'mat the on sat cat the'), [0.5, 0.5, 0.5]);
  const [p, r] = rougeL('the cat on a mat', 'the cat sat on the mat');
  assert.ok(close(p, 4 / 6) && close(r, 0.8)); // 参数对调，P 和 R 互换
  assert.deepEqual(rougeL('a b c', ''), [0, 0, 0]);
  assert.deepEqual(rougeL('', ''), [0, 0, 0]);
  assert.deepEqual(rougeL('  the  cat ', 'the\tcat'), [1, 1, 1]);
});

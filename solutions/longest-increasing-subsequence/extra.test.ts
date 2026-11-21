import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lisSequence } from './followup.ts';
import { lisLength } from './solution.ts';

function quadraticLis(nums: number[]): number {
  const best = nums.map(() => 1);
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) best[i] = Math.max(best[i], best[j] + 1);
    }
  }
  return Math.max(0, ...best);
}

function isValid(seq: number[], nums: number[]): boolean {
  let k = 0;
  for (const x of nums) if (k < seq.length && x === seq[k]) k++; // 按顺序是 nums 的子序列
  return k === seq.length && seq.every((v, i) => i === 0 || seq[i - 1] < v);
}

// 固定种子的线性同余生成器，保证每次跑的数据一样
function makeRng(seed: number): (lo: number, hi: number) => number {
  let s = seed;
  return (lo, hi) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return lo + (s % (hi - lo + 1));
  };
}

test('longest-increasing-subsequence · 延伸：输出一条最长递增子序列', () => {
  assert.deepEqual(lisSequence([10, 9, 2, 5, 3, 7, 101, 18]), [2, 3, 7, 18]);
  assert.deepEqual(lisSequence([3, 4, 1]), [3, 4]);
  assert.deepEqual(lisSequence([2, 2, 2]), [2]);
  assert.deepEqual(lisSequence([]), []);
  assert.deepEqual(lisSequence([0, 1, 0, 3, 2, 3]), [0, 1, 2, 3]);
});

test('longest-increasing-subsequence · 随机数据与 O(n²) DP 对拍', () => {
  const rand = makeRng(54);
  for (let t = 0; t < 500; t++) {
    const nums = Array.from({ length: rand(0, 30) }, () => rand(-20, 20));
    const want = quadraticLis(nums);
    assert.equal(lisLength(nums), want, JSON.stringify(nums));
    const seq = lisSequence(nums);
    assert.equal(seq.length, want);
    assert.ok(isValid(seq, nums), JSON.stringify({ nums, seq }));
  }
});

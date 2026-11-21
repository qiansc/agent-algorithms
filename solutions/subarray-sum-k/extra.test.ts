import { test } from 'node:test';
import assert from 'node:assert/strict';
import { longestRewardSpan } from './followup.ts';

function bruteLongest(rewards: number[], k: number): number {
  let best = 0;
  for (let i = 0; i < rewards.length; i++) {
    let sum = 0;
    for (let j = i; j < rewards.length; j++) {
      sum += rewards[j];
      if (sum === k) best = Math.max(best, j - i + 1);
    }
  }
  return best;
}

test('subarray-sum-k · 延伸：最长片段', () => {
  assert.equal(longestRewardSpan([1, -1, 1, 0], 1), 4);
  assert.equal(longestRewardSpan([0, 0], 0), 2);
  assert.equal(longestRewardSpan([4, -1], 3), 2);
  assert.equal(longestRewardSpan([1, 2, 3], 7), 0);
  assert.equal(longestRewardSpan([], 0), 0);
});

test('subarray-sum-k · 延伸：随机数据与暴力解一致', () => {
  let seed = 53;
  const rand = (n: number) => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed % n;
  };
  for (let t = 0; t < 1000; t++) {
    const rewards = Array.from({ length: rand(13) }, () => rand(7) - 3);
    const k = rand(9) - 4;
    assert.equal(longestRewardSpan(rewards, k), bruteLongest(rewards, k));
  }
});

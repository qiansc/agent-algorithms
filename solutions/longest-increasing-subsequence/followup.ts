import { lowerBound } from './solution.ts';

export function lisSequence(nums: number[]): number[] {
  const tails: number[] = []; // 同原题：每个长度的最小结尾值
  const tailIdx: number[] = []; // tailIdx[k]：这个结尾值在 nums 里的下标
  // parent[i]：nums[i] 接在哪个下标后面
  const parent: number[] = new Array(nums.length).fill(-1);
  nums.forEach((x, i) => {
    const p = lowerBound(tails, x);
    if (p > 0) {
      parent[i] = tailIdx[p - 1]; // 接在“长度 p 的当前最佳结尾”后面
    }
    if (p === tails.length) {
      tails.push(x);
      tailIdx.push(i);
    } else {
      tails[p] = x;
      tailIdx[p] = i;
    }
  });
  const out: number[] = [];
  let i = tailIdx.length ? tailIdx[tailIdx.length - 1] : -1;
  while (i !== -1) {
    // 从最长那一条的结尾沿 parent 倒着走
    out.push(nums[i]);
    i = parent[i];
  }
  return out.reverse();
}

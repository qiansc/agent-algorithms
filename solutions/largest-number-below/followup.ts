import { largestBelow } from './solution.ts';

export function largestAtMost(n: number, digits: number[]): number {
  const below = largestBelow(n, digits); // 顺便完成参数检查
  if (Array.from(String(n)).every((c) => digits.includes(Number(c)))) {
    return n; // n 的每一位都可用，n 本身就是答案
  }
  return below;
}

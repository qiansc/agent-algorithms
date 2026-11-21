/** tails 递增，返回第一个 >= x 的位置；都比 x 小时返回 tails.length。 */
export function lowerBound(tails: number[], x: number): number {
  let lo = 0;
  let hi = tails.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (tails[mid] < x) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

export function lisLength(nums: number[]): number {
  // tails[k]：长度为 k + 1 的递增子序列里，最小的结尾值
  const tails: number[] = [];
  for (const x of nums) {
    const p = lowerBound(tails, x);
    if (p === tails.length) {
      tails.push(x); // 比所有结尾都大，最长长度加 1
    } else {
      tails[p] = x; // 长度 p + 1 的结尾换成更小的 x
    }
  }
  return tails.length;
}

// 返回 long 中第一个 >= target 的下标，只在 [lo, long.length) 里找
function lowerBound(
  long: number[],
  target: number,
  lo: number,
): number {
  let hi = long.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (long[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** short 的每个编号都到 long 里二分查找。 */
export function intersectShortLong(
  short: number[],
  long: number[],
): number[] {
  const common: number[] = [];
  let lo = 0; // long[0..lo) 都小于上一个查过的编号，下次不用再找
  for (const doc of short) {
    lo = lowerBound(long, doc, lo);
    if (lo === long.length) break; // 后面的编号更大，long 里不会再有
    if (long[lo] === doc) {
      common.push(doc);
      lo += 1;
    }
  }
  return common;
}

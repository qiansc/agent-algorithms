// 和 Python 的 bisect_right 一样：返回 arr[lo..hi) 中第一个 > x 的位置，
// 也就是“<= x 的元素有几个”（arr 已按升序排好）。
export function bisectRight(
  arr: number[],
  x: number,
  lo = 0,
  hi = arr.length,
): number {
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function bestWindowValue(
  jobs: [number, number, number][],
): number {
  for (const [start, end, value] of jobs) {
    if (start >= end || value <= 0) {
      throw new Error(
        `非法任务 ${[start, end, value]}：要求 start < end、value > 0`,
      );
    }
  }

  // 按结束时间排；Array.prototype.sort 是稳定排序
  const ordered = [...jobs].sort((a, b) => a[1] - b[1]);
  const ends = ordered.map(([, end]) => end);
  // best[i]：只看结束最早的前 i 个任务，能拿到的最大收益
  const best: number[] = new Array(ordered.length + 1).fill(0);
  ordered.forEach(([start, , value], i) => {
    // 前 i 个任务里结束时间 <= start 的个数；
    // 首尾相接（end == start）也算不冲突
    const eligible = bisectRight(ends, start, 0, i);
    best[i + 1] = Math.max(best[i], best[eligible] + value);
  });
  return best[ordered.length];
}

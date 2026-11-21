import { bisectRight } from './solution.ts';

// 最多只接 k 个任务时的最大收益。
export function bestWindowValueK(
  jobs: [number, number, number][],
  k: number,
): number {
  if (k < 0) throw new Error('k 不能为负');
  for (const [start, end, value] of jobs) {
    if (start >= end || value <= 0) {
      throw new Error(
        `非法任务 ${[start, end, value]}：要求 start < end、value > 0`,
      );
    }
  }

  const ordered = [...jobs].sort((a, b) => a[1] - b[1]);
  const ends = ordered.map(([, end]) => end);
  // best[i][c]：只看前 i 个任务、最多接 c 个时的最大收益
  const best: number[][] = Array.from(
    { length: ordered.length + 1 },
    () => new Array(k + 1).fill(0),
  );
  ordered.forEach(([start, , value], i) => {
    const eligible = bisectRight(ends, start, 0, i);
    for (let c = 1; c <= k; c++) {
      // 接下第 i 个任务就用掉一个名额，前面只剩 c - 1 个
      const take = best[eligible][c - 1] + value;
      best[i + 1][c] = Math.max(best[i][c], take);
    }
  });
  return best[ordered.length][k];
}

// wanted 必须按给定顺序出现（中间可以夹别的词）的最短窗口
export function shortestOrdered(
  tokens: string[],
  wanted: string[],
): [number, number] | null {
  const m = wanted.length;
  if (m === 0) return [0, 0];
  // start[j]：在已读的 tokens 里，按顺序匹配完 wanted[0..j] 时，
  // 第一个词最晚能从哪个下标开始；-1 表示还匹配不上
  const start = new Array<number>(m).fill(-1);
  let best: [number, number] | null = null;
  tokens.forEach((word, r) => {
    // j 从大到小更新，保证同一个词不会在这一步被用两次
    for (let j = m - 1; j >= 0; j--) {
      if (word !== wanted[j]) continue;
      if (j === 0) start[0] = r;
      else if (start[j - 1] !== -1) start[j] = start[j - 1];
    }
    if (word === wanted[m - 1] && start[m - 1] !== -1) {
      const left = start[m - 1];
      const right = r + 1;
      if (best === null || right - left < best[1] - best[0]) {
        best = [left, right];
      }
    }
  });
  return best;
}

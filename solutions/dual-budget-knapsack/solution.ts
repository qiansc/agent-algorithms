export function bestBranches(
  branches: [number, number, number][],
  callCap: number,
  tokenCap: number,
): number {
  if (callCap < 0 || tokenCap < 0) throw new Error('预算不能为负');
  for (const [calls, tokens, value] of branches) {
    if (calls <= 0 || tokens <= 0 || value <= 0) {
      throw new Error(
        `非法分支 ${[calls, tokens, value]}：三项都要是正整数`,
      );
    }
  }

  // best[c][t]：已看过的分支里，
  // 最多用 c 次调用、t 单位 token 能拿到的最高分
  const best: number[][] = Array.from({ length: callCap + 1 }, () =>
    new Array(tokenCap + 1).fill(0),
  );
  for (const [calls, tokens, value] of branches) {
    // 两个预算都从大往小扫：
    // 读到的 best[c - calls][t - tokens] 还是“没看这个分支”时的值
    for (let c = callCap; c >= calls; c--) {
      for (let t = tokenCap; t >= tokens; t--) {
        const take = best[c - calls][t - tokens] + value;
        if (take > best[c][t]) best[c][t] = take;
      }
    }
  }
  return best[callCap][tokenCap];
}

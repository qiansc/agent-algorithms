/** 和为 k 的最长连续片段有多长；没有这样的片段返回 0。 */
export function longestRewardSpan(
  rewards: number[],
  k: number,
): number {
  // 前缀和 -> 最早在第几步之后出现；-1 代表“一步都还没走”
  const first = new Map<number, number>([[0, -1]]);
  let total = 0;
  let best = 0;
  rewards.forEach((reward, i) => {
    total += reward;
    const start = first.get(total - k);
    if (start !== undefined) best = Math.max(best, i - start);
    // 只记第一次：起点越靠左，片段越长
    if (!first.has(total)) first.set(total, i);
  });
  return best;
}

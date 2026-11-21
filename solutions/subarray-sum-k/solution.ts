export function countRewardSpans(
  rewards: number[],
  k: number,
): number {
  if (![...rewards, k].every((x) => Number.isInteger(x))) {
    throw new Error('rewards 和 k 都必须是整数');
  }
  // 前缀和 -> 出现过几次；0 代表“一步都还没走”
  const count = new Map<number, number>([[0, 1]]);
  let total = 0;
  let answer = 0;
  for (const reward of rewards) {
    total += reward;
    // 先查：以这步结尾、和为 k 的片段，起点前的前缀和必须是 total - k
    answer += count.get(total - k) ?? 0;
    // 再记：顺序反过来，k = 0 时会把当前位置和它自己配对
    count.set(total, (count.get(total) ?? 0) + 1);
  }
  return answer;
}

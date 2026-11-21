export function groupAdvantagesEps(
  groups: number[][],
  eps: number,
): number[][] {
  if (!(eps > 0)) {
    throw new Error('eps 必须大于 0');
  }
  return groups.map((rewards) => {
    const n = rewards.length;
    if (n === 0) {
      return [];
    }
    const mean = rewards.reduce((s, r) => s + r, 0) / n;
    const deviations = rewards.map((r) => r - mean);
    const std = Math.sqrt(deviations.reduce((s, x) => s + x * x, 0) / n);
    // 分母永远不小于 eps，全相同的组自然得到 0，不用单独判断
    return deviations.map((x) => x / (std + eps));
  });
}

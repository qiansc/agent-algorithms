export function groupAdvantages(groups: number[][]): number[][] {
  return groups.map((rewards) => {
    const n = rewards.length;
    if (n === 0) {
      return [];
    }
    const mean = rewards.reduce((s, r) => s + r, 0) / n;
    const deviations = rewards.map((r) => r - mean);
    // 总体标准差：偏差平方的平均，除以 n 而不是 n - 1
    const std = Math.sqrt(deviations.reduce((s, x) => s + x * x, 0) / n);
    if (std === 0) {
      return new Array<number>(n).fill(0); // 组内全一样，看不出谁更好
    }
    return deviations.map((x) => x / std);
  });
}

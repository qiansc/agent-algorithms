export function mmr(
  querySim: number[],
  pairSim: number[][],
  k: number,
  lam: number,
): number[] {
  const n = querySim.length;
  if (!(lam >= 0 && lam <= 1)) throw new Error('lam 必须在 0 到 1 之间');
  if (pairSim.length !== n || pairSim.some((row) => row.length !== n)) {
    throw new Error('pairSim 必须是 n × n 的矩阵');
  }
  if (k <= 0 || n === 0) return [];
  const chosen: number[] = [];
  const picked = new Array<boolean>(n).fill(false);
  // redundancy[i]：片段 i 与所有已选片段相似度的最大值
  const redundancy = new Array<number>(n).fill(-Infinity);
  while (chosen.length < Math.min(k, n)) {
    let best = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < n; i++) {
      if (picked[i]) continue;
      const score =
        chosen.length > 0
          ? lam * querySim[i] - (1 - lam) * redundancy[i]
          : querySim[i]; // 第一轮只看相关度
      if (score > bestScore) {
        // 严格大于：同分时保留下标小的
        best = i;
        bestScore = score;
      }
    }
    chosen.push(best);
    picked[best] = true;
    // 只需和新选中的这一个比，就能保持“与所有已选的最大值”
    for (let i = 0; i < n; i++) {
      if (!picked[i]) {
        redundancy[i] = Math.max(redundancy[i], pairSim[i][best]);
      }
    }
  }
  return chosen;
}

export function infoNceWithIds(
  queries: number[][],
  docs: number[][],
  docIds: number[],
  tau: number,
): number {
  const n = queries.length;
  if (n === 0 || docs.length !== n || docIds.length !== n) {
    throw new Error('queries、docs、docIds 必须等长且非空');
  }
  if (!(tau > 0)) {
    throw new Error('tau 必须大于 0');
  }

  const unit = (v: number[]): number[] => {
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    if (norm === 0) {
      throw new Error('零向量没有方向，无法归一化');
    }
    return v.map((x) => x / norm);
  };
  const dot = (a: number[], b: number[]): number =>
    a.reduce((s, x, k) => s + x * b[k], 0);

  const qs = queries.map(unit);
  const ds = docs.map(unit);
  let total = 0;
  qs.forEach((q, i) => {
    // 和正确文档编号相同的其他列是假负例，不进分母
    const logits = ds
      .filter((_, j) => j === i || docIds[j] !== docIds[i])
      .map((d) => dot(q, d) / tau);
    const target = dot(q, ds[i]) / tau;
    const peak = Math.max(...logits);
    const logSum =
      peak +
      Math.log(logits.reduce((s, z) => s + Math.exp(z - peak), 0));
    total += logSum - target;
  });
  return total / n;
}

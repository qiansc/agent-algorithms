export function infoNce(
  queries: number[][],
  docs: number[][],
  tau: number,
): number {
  const n = queries.length;
  if (n === 0 || docs.length !== n) {
    throw new Error('queries 和 docs 必须等长且非空');
  }
  if (!(tau > 0)) {
    throw new Error('tau 必须大于 0');
  }
  const dim = queries[0].length;
  if ([...queries, ...docs].some((v) => v.length !== dim)) {
    throw new Error('所有向量的维数必须相同');
  }

  const unit = (v: number[]): number[] => {
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    if (norm === 0) {
      throw new Error('零向量没有方向，无法归一化');
    }
    return v.map((x) => x / norm);
  };

  const qs = queries.map(unit);
  const ds = docs.map(unit);
  let total = 0;
  qs.forEach((q, i) => {
    // 第 i 行：查询 i 与每篇文档的余弦相似度，再除以温度
    const logits = ds.map(
      (d) => d.reduce((s, x, k) => s + x * q[k], 0) / tau,
    );
    const peak = Math.max(...logits); // 先减去最大值，exp 不会溢出
    const logSum =
      peak +
      Math.log(logits.reduce((s, z) => s + Math.exp(z - peak), 0));
    total += logSum - logits[i]; // -log softmax(logits)[i]
  });
  return total / n;
}

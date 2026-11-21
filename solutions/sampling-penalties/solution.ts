export function nextTokenProbs(
  logits: number[],
  generated: number[],
  penalty: number,
  temperature: number,
  k: number,
): number[] {
  const n = logits.length;
  if (n === 0 || !(penalty > 0) || !(temperature > 0) || !(k >= 1)) {
    throw new RangeError('bad logits, penalty, temperature or k');
  }
  const valid = (t: number) => Number.isInteger(t) && t >= 0 && t < n;
  if (!generated.every(valid)) {
    throw new RangeError('generated token id out of range');
  }
  let scores = [...logits];
  // 1. 重复惩罚：每个出现过的编号只罚一次
  //    正分除、负分乘，都是往“更不可能”的方向推
  for (const t of new Set(generated)) {
    if (scores[t] > 0) scores[t] /= penalty;
    else scores[t] *= penalty;
  }
  // 2. 温度
  scores = scores.map((s) => s / temperature);
  // 3. Top-k：严格小于第 k 大的才去掉，与它同分的全部保留
  const sorted = [...scores].sort((a, b) => b - a);
  const kth = sorted[Math.min(k, n) - 1];
  // 4. 在保留下来的分数上做稳定 softmax（最大分一定被保留）
  const peak = sorted[0];
  const weights = scores.map((s) =>
    s >= kth ? Math.exp(s - peak) : 0,
  );
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / total);
}
